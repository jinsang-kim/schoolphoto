const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const os = require("os");
const https = require("https");
const http = require("http");
const QRCode = require("qrcode");
const { exec } = require("child_process");
require("dotenv").config();

// 학교 방화벽 SSL 인증서 검사(SELF_SIGNED_CERT_IN_CHAIN) 우회용 HTTPS 에이전트
const insecureHttpsAgent = new https.Agent({ rejectUnauthorized: false });

const app = express();
app.set("trust proxy", true);
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

// 업로드 및 사진 캐시 저장소 (로컬 지속성 및 7일 유효기간 관리)
const RETENTION_DAYS = 7;
const RETENTION_SECONDS = 7 * 24 * 60 * 60; // 604,800 초 (ImgBB 만료 파라미터)
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000; // 604,800,000 밀리초

// 로컬 uploads 폴더 우선 사용 (서버 재시작 후에도 7일간 유지), 실패 시 os.tmpdir fallback
const localUploadsDir = path.join(__dirname, "uploads");
let uploadDir = localUploadsDir;
try {
  if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn("로컬 uploads 폴더 생성 실패, 임시 디렉토리 사용:", e.message);
  uploadDir = path.join(os.tmpdir(), "photobooth_uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}
const memoryPhotos = new Map();

// 7일 지난 만료 파일 자동 정리 함수
function cleanExpiredPhotos() {
  try {
    const now = Date.now();
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      let removedCount = 0;
      for (const file of files) {
        if (file === ".gitkeep") continue;
        const filePath = path.join(uploadDir, file);
        try {
          const stats = fs.statSync(filePath);
          if (now - stats.mtimeMs > RETENTION_MS) {
            fs.unlinkSync(filePath);
            memoryPhotos.delete(file);
            removedCount++;
          }
        } catch (fErr) {
          // ignore individual file stat/unlink error
        }
      }
      if (removedCount > 0) {
        console.log(`[STORAGE CLEANUP] 만료된 사진 ${removedCount}개가 정리되었습니다 (보관기간: 7일).`);
      }
    }
  } catch (err) {
    console.error("[STORAGE CLEANUP ERROR]:", err.message);
  }
}

// 서버 시작 시 및 1시간마다 만료 사진 자동 청소
cleanExpiredPhotos();
setInterval(cleanExpiredPhotos, 60 * 60 * 1000);

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, "public")));
app.get("/uploads/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(uploadDir, fileName);

  const isVideo = fileName.endsWith(".webm") || fileName.endsWith(".mp4");

  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      if (Date.now() - stats.mtimeMs > RETENTION_MS) {
        fs.unlinkSync(filePath);
        memoryPhotos.delete(fileName);
        return res.status(410).send("보관 유효기간(7일)이 만료되었습니다.");
      }
    } catch (e) {}
    if (isVideo) {
      res.setHeader("Content-Type", fileName.endsWith(".mp4") ? "video/mp4" : "video/webm");
    }
    return res.sendFile(filePath);
  }
  if (memoryPhotos.has(fileName)) {
    if (isVideo) {
      res.setHeader("Content-Type", fileName.endsWith(".mp4") ? "video/mp4" : "video/webm");
    } else {
      res.setHeader("Content-Type", "image/jpeg");
    }
    return res.send(memoryPhotos.get(fileName));
  }
  res.status(404).send("파일을 찾을 수 없습니다.");
});

// 로컬 IPv4 주소 자동 탐지 함수 (가상 어댑터 및 내부 서브넷 필터링)
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    const nameLower = name.toLowerCase();
    // 가상 네트워크, WSL, 루프백, 블루투스 등 제외
    if (nameLower.includes("virtual") || nameLower.includes("vethernet") || nameLower.includes("pseudo") || nameLower.includes("loopback") || nameLower.includes("bluetooth")) {
      continue;
    }

    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        const addr = iface.address;
        // APIPA(169.254.x.x) 및 로컬호스트 제외
        if (addr.startsWith("169.254.") || addr.startsWith("127.")) {
          continue;
        }
        candidates.push({ name, addr });
      }
    }
  }

  // 1순위: 학교/공유기 일반 사설망 (10.x.x.x 또는 192.168.x.x)
  const priority1 = candidates.find(c => c.addr.startsWith("10.") || c.addr.startsWith("192.168."));
  if (priority1) return priority1.addr;

  // 2순위: 172.x.x.x 가 아닌 실제 이더넷/Wi-Fi
  const priority2 = candidates.find(c => !c.addr.startsWith("172."));
  if (priority2) return priority2.addr;

  if (candidates.length > 0) return candidates[0].addr;
  return "localhost";
}

const localIp = getLocalIpAddress();
let currentPrinterName = process.env.PRINTER_NAME || "EPSON L15150 Series";

// 1. 기본 설정 정보 조회
app.get("/api/config", (req, res) => {
  const rawHost = req.get("host") || `${localIp}:${PORT}`;
  const host = (rawHost.includes("localhost") || rawHost.includes("127.0.0.1")) ? `${localIp}:${PORT}` : rawHost;
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const baseUrl = `${protocol}://${host}`;

  res.json({
    schoolName: process.env.SCHOOL_NAME || "2026 청춘 학교 축제",
    subtitle: process.env.EVENT_SUBTITLE || "추억을 남기는 인생네컷",
    printerName: currentPrinterName,
    enableAutoPrint: process.env.AUTO_PRINT === "true",
    localIp,
    baseUrl,
  });
});

// QR 코드 실시간 생성 API (클라이언트 백업 지원)
app.get("/api/qrcode", async (req, res) => {
  const text = req.query.text;
  if (!text) {
    return res.status(400).json({ error: "text 파라미터가 필요합니다." });
  }
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 280,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
    res.json({ dataUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 프린터 이름 실시간 변경 API
app.post("/api/config/printer", (req, res) => {
  const { printerName } = req.body;
  if (printerName && typeof printerName === "string") {
    currentPrinterName = printerName.trim();
    console.log(`[PRINTER CONFIG] 프린터가 '${currentPrinterName}'(으)로 변경되었습니다.`);
    return res.json({ success: true, printerName: currentPrinterName });
  }
  res.status(400).json({ error: "유효한 프린터 이름을 입력해주세요." });
});

// 연결된 프린터 목록 자동 조회 API (Windows)
app.get("/api/printers", (req, res) => {
  if (process.platform !== "win32") {
    return res.json({
      printers: [currentPrinterName, "EPSON L15150 Series", "EPSON L8050 Series", "Canon SELPHY CP1500", "Microsoft Print to PDF"]
    });
  }

  exec('powershell -Command "Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name"', (err, stdout) => {
    if (err || !stdout) {
      return res.json({
        printers: [currentPrinterName, "EPSON L15150 Series", "EPSON L8050 Series", "Canon SELPHY CP1500", "Microsoft Print to PDF"]
      });
    }
    const list = stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    res.json({
      printers: list.length > 0 ? Array.from(new Set([currentPrinterName, ...list])) : [currentPrinterName]
    });
  });
});

// 프린터 테스트 인쇄 API
app.post("/api/test-print", (req, res) => {
  const { printerName = currentPrinterName } = req.body;

  if (process.platform !== "win32") {
    return res.json({
      success: false,
      message: "Vercel 클라우드 서버에서는 로컬 USB 프린터에 직접 접근할 수 없습니다. 로컬 서버(http://10.220.29.86:3000) 또는 브라우저 인쇄창을 사용해주세요."
    });
  }

  const psScriptPath = path.join(__dirname, "print-photo.ps1");
  const sampleFile = fs.readdirSync(uploadDir).find(f => f.endsWith(".jpg"));
  const samplePath = sampleFile ? path.join(uploadDir, sampleFile) : path.join(__dirname, "public", "favicon.ico");

  const psCommand = `powershell -ExecutionPolicy Bypass -File "${psScriptPath}" -ImagePath "${samplePath}" -PrinterName "${printerName}" -Copies 1`;

  exec(psCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("[TEST PRINT ERROR]:", stderr || error.message);
      return res.json({ success: false, message: `인쇄 실패: ${stderr || error.message}` });
    }
    console.log("[TEST PRINT SUCCESS]:", stdout.trim());
    return res.json({ success: true, message: `프린터(${printerName})로 테스트 인쇄 전송 완료!` });
  });
});

// 2. 모바일 다운로드 전용 페이지
app.get("/download/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(uploadDir, fileName);
  const exists = fs.existsSync(filePath) || memoryPhotos.has(fileName);

  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      if (Date.now() - stats.mtimeMs > RETENTION_MS) {
        fs.unlinkSync(filePath);
        memoryPhotos.delete(fileName);
        return res.status(410).send(`
          <!DOCTYPE html>
          <html lang="ko">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>보관 기간 만료</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 40px 20px; background: #0f172a; color: white; }
              .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); margin-bottom: 12px; font-weight: 700; }
            </style>
          </head>
          <body>
            <div class="badge">⏰ 유효기간 만료</div>
            <h2>사진 보관 기간(7일)이 만료되었습니다 😢</h2>
            <p>개인정보 및 사진 보호를 위해 7일이 지난 사진은 자동으로 영구 삭제됩니다.</p>
          </body>
          </html>
        `);
      }
    } catch (e) {}
  }

  if (!exists) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>사진을 찾을 수 없습니다</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 40px 20px; background: #0f172a; color: white; }
        </style>
      </head>
      <body>
        <h2>사진을 찾을 수 없습니다 😢</h2>
        <p>요청하신 사진이 만료되었거나 존재하지 않습니다.</p>
      </body>
      </html>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
      <title>인생네컷 사진 다운로드</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Pretendard', sans-serif; }
        body {
          background: #0f172a;
          color: #f8fafc;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-size: 22px; font-weight: 800; color: #38bdf8; margin-bottom: 4px; }
        .header p { font-size: 14px; color: #94a3b8; }
        .preview-card {
          background: #1e293b;
          border: 1px solid #334155;
          padding: 12px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          max-width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        .preview-card img { max-width: 100%; max-height: 60vh; border-radius: 8px; display: block; }
        .action-group { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 12px; }
        .download-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          text-decoration: none;
          font-size: 18px;
          font-weight: 700;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }
        .tip { font-size: 13px; color: #64748b; text-align: center; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✨ 인생네컷 다운로드 ✨</h1>
        <p>소중한 추억을 스마트폰에 저장해보세요!</p>
      </div>
      <div class="preview-card">
        <img src="/uploads/${fileName}" alt="인생네컷 사진">
      </div>
      <div class="action-group">
        <a href="/uploads/${fileName}" download="life4cut_${Date.now()}.jpg" class="download-btn">
          💾 고화질 사진 저장하기
        </a>
        <p class="tip">※ 아이폰/갤럭시: 사진을 길게 누른 후 '사진 앱에 저장'을 터치하셔도 됩니다.</p>
      </div>
    </body>
    </html>
  `);
});

// HTTPS POST 헬퍼 (학교 방화벽 자체서명 SSL 인증서 환경 및 Vercel 모두 호환)
function httpsPostUrlEncoded(targetUrl, paramsObj, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(targetUrl);
      const bodyStr = new URLSearchParams(paramsObj).toString();
      const req = https.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || 443,
          path: parsed.pathname + parsed.search,
          method: "POST",
          agent: insecureHttpsAgent,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(bodyStr),
            "User-Agent": "SchoolPhotoBooth/2.0",
          },
          timeout: timeoutMs,
        },
        (res) => {
          let raw = "";
          res.on("data", (chunk) => (raw += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(raw));
            } catch (e) {
              reject(new Error(`JSON 파싱 오류 (HTTP ${res.statusCode})`));
            }
          });
        }
      );
      req.on("timeout", () => {
        req.destroy(new Error("요청 타임아웃"));
      });
      req.on("error", reject);
      req.write(bodyStr);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// HTTPS JSON POST 헬퍼 (로컬 PC -> Vercel 클라우드 백그라운드 미러링용)
function httpsPostJson(targetUrl, payloadObj, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(targetUrl);
      const bodyStr = JSON.stringify(payloadObj);
      const req = https.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || 443,
          path: parsed.pathname + parsed.search,
          method: "POST",
          agent: insecureHttpsAgent,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyStr),
            "User-Agent": "SchoolPhotoBooth/2.0",
          },
          timeout: timeoutMs,
        },
        (res) => {
          let raw = "";
          res.on("data", (chunk) => (raw += chunk));
          res.on("end", () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(raw) });
            } catch (e) {
              resolve({ status: res.statusCode, data: null });
            }
          });
        }
      );
      req.on("timeout", () => req.destroy(new Error("JSON POST 타임아웃")));
      req.on("error", reject);
      req.write(bodyStr);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// 무료 클라우드 이미지 CDN 업로드 함수 (Vercel 서버리스 및 모바일 LTE 다운로드 지원 - 학교 방화벽 SSL 완벽 호환)
async function uploadToCloudCDN(base64Data) {
  // 1순위: FreeImage.host (iili.io 글로벌 CDN - 학교 방화벽 및 모바일 통신사 100% 통과)
  try {
    const json = await httpsPostUrlEncoded(
      "https://freeimage.host/api/1/upload",
      {
        key: "6d207e02198a847aa98d0a2a901485a5",
        action: "upload",
        source: base64Data,
        format: "json",
      },
      7500
    );
    if (json && json.image && json.image.url) {
      console.log("[CLOUD CDN] FreeImage(iili.io) 업로드 성공:", json.image.url);
      return json.image.url;
    }
  } catch (e1) {
    console.warn("FreeImage 업로드 알림:", e1.message);
  }

  // 2순위: ImgBB 업로드 시도 (expiration=604800 설정으로 7일 후 CDN 서버에서 자동 영구 삭제)
  try {
    const json = await httpsPostUrlEncoded(
      "https://api.imgbb.com/1/upload?key=41dc94f09d8d6dc3e3a9c69d80d2105a",
      {
        image: base64Data,
        expiration: String(RETENTION_SECONDS),
      },
      6500
    );
    if (json && json.data && json.data.url) {
      console.log("[CLOUD CDN] ImgBB 업로드 성공 (유효기간: 7일):", json.data.url);
      return json.data.url;
    }
  } catch (e2) {
    console.warn("ImgBB 업로드 알림:", e2.message);
  }

  return null;
}

// 모바일 원클릭 강제 파일 다운로드 프록시 API (Cross-Origin 이미지 및 로컬 파일 모두 attachment로 즉시 다운로드)
app.get("/api/proxy-download", (req, res) => {
  const { file, url, name } = req.query;
  const downloadName = (name && /^[a-zA-Z0-9_.-]+$/.test(name)) ? name : (file || `life4cut_${Date.now()}.jpg`);

  // 1. 로컬/메모리 파일 먼저 확인
  if (file) {
    const safeFile = path.basename(file);
    const filePath = path.join(uploadDir, safeFile);
    const isVideo = safeFile.endsWith(".webm") || safeFile.endsWith(".mp4");
    const contentType = isVideo ? (safeFile.endsWith(".mp4") ? "video/mp4" : "video/webm") : "image/jpeg";

    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
      return res.sendFile(filePath);
    }
    if (memoryPhotos.has(safeFile)) {
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
      return res.send(memoryPhotos.get(safeFile));
    }
  }

  // 2. 클라우드 CDN URL 프록시 다운로드
  if (url && /^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      const client = parsed.protocol === "https:" ? https : http;
      const options = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: "GET",
        agent: parsed.protocol === "https:" ? insecureHttpsAgent : undefined,
        headers: { "User-Agent": "SchoolPhotoBooth/2.0" },
        timeout: 10000,
      };
      const proxyReq = client.request(options, (proxyRes) => {
        if (proxyRes.statusCode && proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
          res.setHeader("Content-Type", proxyRes.headers["content-type"] || "image/jpeg");
          res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
          proxyRes.pipe(res);
        } else {
          res.status(404).send("원격 파일을 다운로드할 수 없습니다.");
        }
      });
      proxyReq.on("error", () => {
        if (!res.headersSent) res.status(500).send("다운로드 프록시 오류");
      });
      proxyReq.end();
      return;
    } catch (e) {
      return res.status(400).send("유효하지 않은 다운로드 URL입니다.");
    }
  }

  res.status(404).send("다운로드할 파일을 찾을 수 없습니다.");
});

// 촬영 영상 단독 업로드 백업 API (대용량 영상 분할 업로드 지원)
app.post("/api/upload-video", async (req, res) => {
  try {
    const { fileName, videoBase64, fromLocalSync } = req.body;
    if (!fileName || !videoBase64 || typeof videoBase64 !== "string") {
      return res.status(400).json({ error: "필수 파라미터가 누락되었습니다." });
    }
    const safeCustomName = /^[a-zA-Z0-9_-]+\.jpg$/.test(fileName) ? fileName : `photo_${Date.now()}.jpg`;
    const vidMatches = videoBase64.match(/^data:video\/([a-zA-Z0-9]+);base64,/);
    const vidExt = vidMatches ? (vidMatches[1] === "webm" ? "webm" : "mp4") : "webm";
    const cleanVidBase64 = videoBase64.replace(/^data:video\/[a-zA-Z0-9]+;base64,/, "").replace(/^data:[^;]+;base64,/, "");
    const vidBuffer = Buffer.from(cleanVidBase64, "base64");

    const baseNameWithoutExt = safeCustomName.replace(/\.[^/.]+$/, "");
    const videoFileName = `${baseNameWithoutExt}_video.${vidExt}`;
    const vidFilePath = path.join(uploadDir, videoFileName);

    try {
      fs.writeFileSync(vidFilePath, vidBuffer);
    } catch (fsErr) {}
    memoryPhotos.set(videoFileName, vidBuffer);

    // 로컬 서버에서 업로드된 경우 Vercel 서버에도 백그라운드 동기화 (4MB 이하인 경우)
    if (!process.env.VERCEL && !fromLocalSync && videoBase64.length < 3800000) {
      httpsPostJson("https://schoolphoto.vercel.app/api/upload-video", {
        fileName: safeCustomName,
        videoBase64,
        fromLocalSync: true,
      }).catch(() => {});
    }

    return res.json({
      success: true,
      videoFileName,
      videoUrl: `/uploads/${videoFileName}`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. 사진 및 영상 저장 처리 API (QR 코드 생성 & 인쇄)
app.post("/api/complete", async (req, res) => {
  try {
    const {
      imageBase64,
      videoBase64,
      printCount = 1,
      frameTheme = "classic",
      printerName: reqPrinterName,
      cloudUrl: existingCloudUrl,
      skipCloudUpload = false,
      fromLocalSync = false,
    } = req.body;
    const printerName = reqPrinterName || currentPrinterName || process.env.PRINTER_NAME || "EPSON L15150 Series";

    if (!imageBase64) {
      return res.status(400).json({ error: "이미지 데이터가 없습니다." });
    }

    // Base64 데이터를 파일 및 메모리에 저장 (클라이언트와 QR코드가 일치하도록 요청된 파일명 우선 적용)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const safeCustomName = req.body.fileName && /^[a-zA-Z0-9_-]+\.jpg$/.test(req.body.fileName) ? req.body.fileName : null;
    const fileName = safeCustomName || `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    try {
      fs.writeFileSync(filePath, buffer);
    } catch (fsErr) {
      console.warn("디스크 파일 쓰기 알림:", fsErr.message);
    }
    memoryPhotos.set(fileName, buffer);
    const photoUrl = `/uploads/${fileName}`;

    // 🎥 촬영 영상(타임랩스/비디오) 저장 처리
    const baseNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    let videoFileName = null;
    let videoUrl = null;
    if (videoBase64 && typeof videoBase64 === "string" && videoBase64.length > 50) {
      try {
        const vidMatches = videoBase64.match(/^data:video\/([a-zA-Z0-9]+);base64,/);
        const vidExt = vidMatches ? (vidMatches[1] === "webm" ? "webm" : "mp4") : "webm";
        const cleanVidBase64 = videoBase64.replace(/^data:video\/[a-zA-Z0-9]+;base64,/, "").replace(/^data:[^;]+;base64,/, "");
        const vidBuffer = Buffer.from(cleanVidBase64, "base64");

        videoFileName = `${baseNameWithoutExt}_video.${vidExt}`;
        const vidFilePath = path.join(uploadDir, videoFileName);

        try {
          fs.writeFileSync(vidFilePath, vidBuffer);
        } catch (vFsErr) {}
        memoryPhotos.set(videoFileName, vidBuffer);
        videoUrl = `/uploads/${videoFileName}`;
        console.log(`[VIDEO SAVED] 촬영 영상 저장 완료: ${videoFileName} (${Math.round(vidBuffer.length / 1024)} KB)`);
      } catch (vidErr) {
        console.warn("촬영 영상 저장 오류:", vidErr.message);
      }
    } else {
      // 이전 프리뷰 동기화 단계에서 이미 저장된 영상이 있는지 확인
      for (const ext of ["webm", "mp4"]) {
        const candidateVid = `${baseNameWithoutExt}_video.${ext}`;
        if (memoryPhotos.has(candidateVid) || fs.existsSync(path.join(uploadDir, candidateVid))) {
          videoFileName = candidateVid;
          videoUrl = `/uploads/${candidateVid}`;
          break;
        }
      }
    }

    // 스마트폰 스캔용 다운로드 URL (스마트폰이 LTE/5G 어디서든 받을 수 있도록 글로벌 CDN + 파일명 이중 보장)
    const reqHost = req.get("host") || `${localIp}:${PORT}`;
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || (req.secure ? "https" : "http");
    const actualHost = (reqHost.includes("localhost") || reqHost.includes("127.0.0.1")) ? `${localIp}:${PORT}` : reqHost;

    let cloudUrl = existingCloudUrl || null;
    if (!cloudUrl && !skipCloudUpload) {
      try {
        cloudUrl = await uploadToCloudCDN(base64Data);
      } catch (cdnErr) {
        console.warn("클라우드 CDN 연동 알림 (로컬 URL 사용):", cdnErr.message);
      }
    }

    const vParam = videoFileName ? `&video=${encodeURIComponent(videoFileName)}` : "";
    let downloadUrl = "";
    if (cloudUrl) {
      downloadUrl = `https://schoolphoto.vercel.app/download.html?file=${encodeURIComponent(fileName)}&img=${encodeURIComponent(cloudUrl)}${vParam}`;
      console.log(`[QR CODE URL] 글로벌 CDN + 로컬 하이브리드 다운로드 링크 생성 완료: ${downloadUrl}`);
    } else {
      downloadUrl = `${protocol}://${actualHost}/download.html?file=${encodeURIComponent(fileName)}${vParam}`;
      console.log(`[QR CODE URL] 로컬 네트워크 다운로드 링크 사용: ${downloadUrl}`);
    }

    // 로컬 PC에서 실행 중일 때 Vercel 클라우드 서버에도 사진/영상을 백그라운드로 미러링 (모바일 LTE/5G에서 영상까지 100% 재생 보장)
    if (!process.env.VERCEL && !actualHost.includes("vercel.app") && !fromLocalSync) {
      const canIncludeVid = videoBase64 && videoBase64.length < 2800000;
      httpsPostJson("https://schoolphoto.vercel.app/api/complete", {
        imageBase64,
        videoBase64: canIncludeVid ? videoBase64 : null,
        fileName,
        cloudUrl,
        printCount: 0,
        skipCloudUpload: true,
        fromLocalSync: true,
      }).catch((syncErr) => {
        console.warn("Vercel 클라우드 미러링 알림:", syncErr.message);
      });
    }

    // QR 코드 이미지(Data URL) 생성
    const qrCodeDataUrl = await QRCode.toDataURL(downloadUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    let printSuccess = false;
    let printMessage = "인쇄가 요청되지 않았습니다.";

    // 프린터 인쇄 처리 (Windows 로컬 환경)
    if (printCount > 0 && process.platform === "win32") {
      const psScriptPath = path.join(__dirname, "print-photo.ps1");

      if (fs.existsSync(psScriptPath)) {
        const psCommand = `powershell -ExecutionPolicy Bypass -File "${psScriptPath}" -ImagePath "${filePath}" -PrinterName "${printerName}" -Copies ${printCount}`;

        console.log(`[PRINT REQUEST] 실행 중: ${psCommand}`);

        exec(psCommand, (error, stdout, stderr) => {
          if (error) {
            console.error("[PRINT ERROR]:", stderr || error.message);
          } else {
            console.log("[PRINT SUCCESS]:", stdout.trim());
          }
        });

        printSuccess = true;
        printMessage = `프린터(${printerName})로 ${printCount}장 인쇄 명령을 전송했습니다.`;
      }
    }

    res.json({
      success: true,
      fileName,
      photoUrl,
      cloudUrl,
      videoFileName,
      videoUrl,
      downloadUrl,
      qrCodeDataUrl,
      printSuccess,
      printMessage,
    });
  } catch (err) {
    console.error("서버 처리 오류:", err);
    res.status(500).json({ error: err.message || "서버 내부 오류가 발생했습니다." });
  }
});

// 서버 실행
app.listen(PORT, "0.0.0.0", () => {
  console.log(`====================================================`);
  console.log(`📸 학교 축제 인생네컷 포토부스 서버가 준비되었습니다!`);
  console.log(`🖨️ 연결된 프린터: ${process.env.PRINTER_NAME || "Canon SELPHY CP1200"}`);
  console.log(`📍 로컬 접속 (현재 컴퓨터): http://localhost:${PORT}`);
  console.log(`📍 태블릿/스마트폰 접속 주소: http://${localIp}:${PORT}`);
  console.log(`====================================================`);
});

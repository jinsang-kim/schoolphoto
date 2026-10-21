const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const os = require("os");
const QRCode = require("qrcode");
const { exec } = require("child_process");
require("dotenv").config();

const app = express();
app.set("trust proxy", true);
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      if (Date.now() - stats.mtimeMs > RETENTION_MS) {
        fs.unlinkSync(filePath);
        memoryPhotos.delete(fileName);
        return res.status(410).send("사진 보관 유효기간(7일)이 만료되었습니다.");
      }
    } catch (e) {}
    return res.sendFile(filePath);
  }
  if (memoryPhotos.has(fileName)) {
    res.setHeader("Content-Type", "image/jpeg");
    return res.send(memoryPhotos.get(fileName));
  }
  res.status(404).send("사진을 찾을 수 없습니다.");
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
  const host = req.get("host") || `${localIp}:${PORT}`;
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

// 무료 클라우드 이미지 CDN 업로드 함수 (Vercel 서버리스 및 모바일 LTE 다운로드 지원 - 7일 자동 만료 적용)
async function uploadToCloudCDN(base64Data) {
  // 1. ImgBB 업로드 시도 (expiration=604800 설정으로 7일 후 CDN 서버에서 자동 영구 삭제)
  try {
    const params = new URLSearchParams();
    params.append("image", base64Data);
    params.append("expiration", String(RETENTION_SECONDS)); // 7일 (604,800초)
    const res = await fetch("https://api.imgbb.com/1/upload?key=41dc94f09d8d6dc3e3a9c69d80d2105a", {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const json = await res.json();
    if (json.data && json.data.url) {
      console.log("[CLOUD CDN] ImgBB 업로드 성공 (유효기간: 7일):", json.data.url);
      return json.data.url;
    }
  } catch (e1) {
    console.warn("ImgBB 업로드 알림:", e1.message);
  }

  // 2. FreeImage.host 업로드 시도
  try {
    const params = new URLSearchParams();
    params.append("key", "6d207e02198a847aa98d0a2a901485a5");
    params.append("action", "upload");
    params.append("source", base64Data);
    params.append("format", "json");
    const res = await fetch("https://freeimage.host/api/1/upload", {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const json = await res.json();
    if (json.image && json.image.url) {
      console.log("[CLOUD CDN] FreeImage 업로드 성공:", json.image.url);
      return json.image.url;
    }
  } catch (e2) {
    console.warn("FreeImage 업로드 알림:", e2.message);
  }

  return null;
}

// 3. 사진 저장 및 처리 API (QR 코드 생성 & 인쇄)
app.post("/api/complete", async (req, res) => {
  try {
    const { imageBase64, printCount = 1, frameTheme = "classic", printerName: reqPrinterName } = req.body;
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

    // 스마트폰 스캔용 다운로드 URL (스마트폰이 LTE/5G 어디서든 받을 수 있도록 글로벌 CDN 우선 적용)
    const reqHost = req.get("host") || `${localIp}:${PORT}`;
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || (req.secure ? "https" : "http");
    const actualHost = (reqHost.includes("localhost") || reqHost.includes("127.0.0.1")) ? `${localIp}:${PORT}` : reqHost;
    
    let downloadUrl = `${protocol}://${actualHost}/download.html?file=${fileName}`;

    // ⭐️ 로컬 / Vercel 상관없이 클라우드 CDN 업로드 우선 시도 (스마트폰 LTE/5G에서도 즉시 다운로드 가능)
    try {
      const cloudUrl = await uploadToCloudCDN(base64Data);
      if (cloudUrl) {
        downloadUrl = `https://schoolphoto.vercel.app/download.html?img=${encodeURIComponent(cloudUrl)}`;
        console.log(`[QR CODE URL] 글로벌 다운로드 링크 생성 완료: ${downloadUrl}`);
      } else {
        console.log(`[QR CODE URL] 로컬 네트워크 다운로드 링크 사용: ${downloadUrl}`);
      }
    } catch (cdnErr) {
      console.warn("클라우드 CDN 연동 알림 (로컬 URL 사용):", cdnErr.message);
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

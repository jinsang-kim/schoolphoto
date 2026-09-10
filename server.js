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

// 업로드 폴더 확인
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir));

// 로컬 IPv4 주소 자동 탐지 함수
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const localIp = getLocalIpAddress();

// 1. 기본 설정 정보 조회
app.get("/api/config", (req, res) => {
  const host = req.get("host") || `${localIp}:${PORT}`;
  const protocol = req.protocol || "http";
  const baseUrl = `${protocol}://${host}`;

  res.json({
    schoolName: process.env.SCHOOL_NAME || "2026 청춘 학교 축제",
    subtitle: process.env.EVENT_SUBTITLE || "추억을 남기는 인생네컷",
    printerName: process.env.PRINTER_NAME || "Canon SELPHY CP1200",
    enableAutoPrint: process.env.AUTO_PRINT === "true",
    localIp,
    baseUrl,
  });
});

// 2. 모바일 다운로드 전용 페이지
app.get("/download/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(uploadDir, fileName);

  if (!fs.existsSync(filePath)) {
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

// 3. 사진 저장 및 처리 API (QR 코드 생성 & 인쇄)
app.post("/api/complete", async (req, res) => {
  try {
    const { imageBase64, printCount = 1, frameTheme = "classic" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "이미지 데이터가 없습니다." });
    }

    // Base64 데이터를 파일로 저장
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const fileName = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);
    const photoUrl = `/uploads/${fileName}`;

    // 스마트폰 스캔용 다운로드 URL
    const reqHost = req.get("host") || `${localIp}:${PORT}`;
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || (req.secure ? "https" : "http");
    const actualHost = (reqHost.includes("localhost") || reqHost.includes("127.0.0.1")) ? `${localIp}:${PORT}` : reqHost;
    const downloadUrl = `${protocol}://${actualHost}/download/${fileName}`;

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

    // 프린터 인쇄 처리
    if (printCount > 0) {
      const printerName = process.env.PRINTER_NAME || "Canon SELPHY CP1200";
      const psScriptPath = path.join(__dirname, "print-photo.ps1");

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

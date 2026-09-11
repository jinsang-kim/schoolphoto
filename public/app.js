// 상태 관리 객체
const state = {
  currentScreen: "home",
  layoutMode: "grid", // 'grid' (태블릿 2x2) 또는 'strip' (데스크탑 4x1 2줄)
  selectedTheme: "pink_heart",
  selectedFilter: "bright",
  printQuantity: 1,
  printerName: localStorage.getItem("photobooth_printer") || "EPSON L15150 Series",
  capturedImages: [],
  stream: null,
  isCapturing: false,
  finalImageBase64: null,
  resetTimerInterval: null,
};

// ⭐️ 10대 레퍼런스 실물 디자인 테마 (맞춤형 전용 폰트 & 타이포그래피 스타일 탑재)
const THEME_CONFIG = {
  pink_heart: {
    id: "pink_heart",
    name: "러브 하트드로잉 💖",
    subName: "SelfPhoto Heart",
    desc: "블랙 배경에 네온 핑크 하트 & 낙서 드로잉",
    icon: "💖",
    bgType: "solid",
    background: "#0c0d11",
    textColor: "#ff3b81",
    subTextColor: "#ffffff",
    border: "#ff3b81",
    cardBg: "#1a1c23",
    titleFont: "bold 58px 'Pacifico', cursive",
    subFont: "bold 26px 'Pretendard', sans-serif",
    titleText: "SelfPhoto",
    subText: "TWO HEARTS • FOREVER IN LOVE",
    stickers: ["💖", "XOXO", "💋", "★", "LOVE"],
    drawOverlay: "heart_drawing",
  },
  always_together: {
    id: "always_together",
    name: "올웨이즈 투게더 ☁️",
    subName: "Always Together",
    desc: "신비로운 핑크퍼플 구름 & 달빛 감성",
    icon: "☁️",
    bgType: "gradient",
    gradient: ["#4f46e5", "#ec4899"],
    textColor: "#ffffff",
    subTextColor: "#fef08a",
    border: "#ffffff",
    cardBg: "#ffffff",
    titleFont: "italic bold 54px 'Playfair Display', serif",
    subFont: "600 26px 'Pretendard', sans-serif",
    titleText: "Always Together!",
    subText: "언제나 함께하는 우리들의 빛나는 계절 🌙",
    stickers: ["🌙", "☁️", "✨", "💜", "⭐"],
    drawOverlay: "cloud_dream",
  },
  let_love_bloom: {
    id: "let_love_bloom",
    name: "렛러브 블룸 🌹",
    subName: "Let Love Bloom",
    desc: "볼드 타이포 & 웨딩/커플 감성 에디션",
    icon: "🌹",
    bgType: "gradient",
    gradient: ["#0284c7", "#0369a1"],
    textColor: "#ffffff",
    subTextColor: "#bae6fd",
    border: "#ffffff",
    cardBg: "#ffffff",
    titleFont: "900 52px 'Montserrat', sans-serif",
    subFont: "700 25px 'Montserrat', sans-serif",
    titleText: "LET LOVE BLOOM",
    subText: "BEST MOMENT IN LIFE • HAPPY FOREVER",
    stickers: ["🤍", "💐", "✨", "💍", "🌹"],
    drawOverlay: "bold_typo",
  },
  cute_doodle_rabbit: {
    id: "cute_doodle_rabbit",
    name: "큐트 토끼드로잉 🐰",
    subName: "Cute Rabbit & Flower",
    desc: "민트빛 파스텔 & 귀여운 토끼/보라꽃 손그림",
    icon: "🐰",
    bgType: "solid",
    background: "#7dd3fc",
    textColor: "#0f172a",
    subTextColor: "#0369a1",
    border: "#0f172a",
    cardBg: "#ffffff",
    titleFont: "bold 64px 'Gaegu', cursive",
    subFont: "bold 32px 'Gaegu', cursive",
    titleText: "BEST MEMORY EVER",
    subText: "행복한 하루 귀여운 우리들의 순간 🐰🌸",
    stickers: ["🐰", "🌸", "💜", "✨", "🌷"],
    drawOverlay: "doodle_char",
  },
  cyber_checker: {
    id: "cyber_checker",
    name: "체커보드 스마일 🏁",
    subName: "Green Checker Smile",
    desc: "트렌디 흑백 체커보드 & 네온그린 스마일",
    icon: "🏁",
    bgType: "checker",
    checkerColor1: "#ffffff",
    checkerColor2: "#0f172a",
    textColor: "#10b981",
    subTextColor: "#ffffff",
    border: "#10b981",
    cardBg: "#ffffff",
    titleFont: "900 54px 'Black Han Sans', sans-serif",
    subFont: "bold 26px 'Montserrat', sans-serif",
    titleText: "JUST CHEESE SMILE!",
    subText: "TRENDY STREET ARCHIVE 2026 🏁⚡",
    stickers: ["🏁", "😊", "💚", "⚡", "🍀"],
    drawOverlay: "checker_pattern",
  },
  polaroid_vintage: {
    id: "polaroid_vintage",
    name: "빈티지 시즈더데이 🎞️",
    subName: "Seize The Day",
    desc: "필름 카메라 날짜 스탬프 & 카키 빈티지",
    icon: "🎞️",
    bgType: "solid",
    background: "#a8a29e",
    textColor: "#292524",
    subTextColor: "#44403c",
    border: "#d6d3d1",
    cardBg: "#e7e5e4",
    titleFont: "bold 52px 'Playfair Display', serif",
    subFont: "bold 24px monospace",
    titleText: "SEIZE THE DAY",
    subText: "FILM ARCHIVE NO. 2026 • CARPE DIEM",
    stickers: ["🎞️", "📷", "🛵", "☕", "🏷️"],
    drawOverlay: "film_vintage",
  },
  birthday_party: {
    id: "birthday_party",
    name: "생일축하해 🎂",
    subName: "Happy Birthday Party",
    desc: "핑크 젤리베어 & 파티 캔디 프레임",
    icon: "🎂",
    bgType: "gradient",
    gradient: ["#fef08a", "#fbcfe8"],
    textColor: "#db2777",
    subTextColor: "#ea580c",
    border: "#f472b6",
    cardBg: "#ffffff",
    titleFont: "bold 60px 'Gaegu', cursive",
    subFont: "bold 30px 'Gaegu', cursive",
    titleText: "HAPPY BIRTHDAY!",
    subText: "오늘의 주인공은 바로 너! 행복한 생일 축하해 🎂🎉",
    stickers: ["🎂", "🧸", "🎁", "🎈", "💖"],
    drawOverlay: "birthday_candies",
  },
  cloud_blue_puppy: {
    id: "cloud_blue_puppy",
    name: "폭신 댕댕이 ☁️🐶",
    subName: "Happy Puppy & Cloud",
    desc: "몽글몽글 구름 프레임 & 스카이블루",
    icon: "🐶",
    bgType: "gradient",
    gradient: ["#93c5fd", "#60a5fa"],
    textColor: "#ffffff",
    subTextColor: "#1e3a8a",
    border: "#ffffff",
    cardBg: "#ffffff",
    titleFont: "bold 62px 'Gaegu', cursive",
    subFont: "bold 28px 'Gaegu', cursive",
    titleText: "HAPPY FLUFFY DAY",
    subText: "세상에서 제일 소중하고 귀여운 우리 🐾☁️",
    stickers: ["🐾", "☁️", "🐶", "🦴", "🩵"],
    drawOverlay: "cloud_scallop",
  },
  school_archive: {
    id: "school_archive",
    name: "스쿨 아카이브 🎓",
    subName: "All About Us Archive",
    desc: "교복/졸업/입학 미니멀 블랙 & 하트 뱃지",
    icon: "🎓",
    bgType: "solid",
    background: "#111827",
    textColor: "#ffffff",
    subTextColor: "#9ca3af",
    border: "#1f2937",
    cardBg: "#030712",
    titleFont: "900 50px 'Montserrat', sans-serif",
    subFont: "600 24px 'Pretendard', sans-serif",
    titleText: "ALL ABOUT US ARCHIVE",
    subText: "청춘의 찬란한 순간, 우리들의 이야기 🎓✨",
    stickers: ["🎓", "🖤", "★", "🏷️", "📷"],
    drawOverlay: "modern_badge",
  },
  bubble_manga: {
    id: "bubble_manga",
    name: "만화 컷 만생 💥",
    subName: "Comic Pop Art",
    desc: "비비드 블루 & 만화 말풍선 팝아트",
    icon: "💥",
    bgType: "gradient",
    gradient: ["#0284c7", "#06b6d4"],
    textColor: "#ffffff",
    subTextColor: "#fef08a",
    border: "#000000",
    cardBg: "#ffffff",
    titleFont: "900 56px 'Black Han Sans', sans-serif",
    subFont: "bold 26px 'Pretendard', sans-serif",
    titleText: "MY HERO COMICS!",
    subText: "오늘도 우당탕탕 즐거운 우리들의 대모험 💥🐹",
    stickers: ["💥", "💭", "⭐", "⚡", "📢"],
    drawOverlay: "comic_bubbles",
  },
};

// 10가지 색감 필터 설정
const FILTER_CONFIG = {
  original: { name: "원본 컬러", icon: "📷", css: "none" },
  bright: { name: "화사한 뽀샤시", icon: "✨", css: "brightness(1.15) contrast(1.04) saturate(1.12)" },
  grayscale: { name: "흑백 모노", icon: "🖤", css: "grayscale(100%) contrast(1.15)" },
  warm: { name: "따뜻한 웜톤", icon: "☀️", css: "sepia(22%) saturate(1.22) brightness(1.05)" },
  cool: { name: "쿨톤 아이스", icon: "❄️", css: "hue-rotate(185deg) saturate(0.9) brightness(1.08) contrast(1.05)" },
  retro90s: { name: "90s 레트로", icon: "🎞️", css: "contrast(1.2) brightness(0.95) sepia(35%) saturate(1.3)" },
  pink_blush: { name: "핑크 블러셔", icon: "🌸", css: "hue-rotate(330deg) saturate(1.25) brightness(1.06)" },
  sepia: { name: "감성 세피아", icon: "☕", css: "sepia(75%) contrast(1.1) brightness(0.98)" },
  vivid: { name: "비비드 팝", icon: "🎨", css: "saturate(1.5) contrast(1.12) brightness(1.02)" },
  cinematic: { name: "시네마틱", icon: "🎬", css: "contrast(1.25) saturate(1.15) brightness(0.92)" },
};

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  renderThemeList();
  renderFilterList();
  initPrinterConfig();
  
  // 웹폰트 로드 완료 후 캔버스 렌더링
  if (document.fonts) {
    document.fonts.ready.then(() => {
      renderLiveThemePreview();
    });
  } else {
    setTimeout(renderLiveThemePreview, 200);
  }

  if (window.lucide) {
    lucide.createIcons();
  }
});

// 테마 리스트 렌더링
function renderThemeList() {
  const container = document.getElementById("theme-grid-container");
  if (!container) return;

  container.innerHTML = Object.entries(THEME_CONFIG)
    .map(([key, theme]) => {
      const isActive = key === state.selectedTheme ? "active" : "";
      let bgStyle = theme.background || "#ffffff";
      if (theme.bgType === "gradient") {
        bgStyle = `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`;
      } else if (theme.bgType === "checker") {
        bgStyle = "repeating-conic-gradient(#ffffff 0% 25%, #0f172a 0% 50%) 50% / 12px 12px";
      }

      return `
        <div class="theme-card ${isActive}" data-theme="${key}" onclick="selectTheme('${key}')">
          <div class="theme-card-icon-badge">${theme.icon}</div>
          <div class="theme-preview-mini" style="background: ${bgStyle};">
            <div class="mini-cut-grid">
              <div class="mini-cut" style="border: 1px solid ${theme.border};"></div>
              <div class="mini-cut" style="border: 1px solid ${theme.border};"></div>
            </div>
            <div class="mini-stickers-row">
              <span>${theme.stickers[0]}</span>
              <span>${theme.stickers[1]}</span>
            </div>
          </div>
          <div class="theme-info-box">
            <h3>${theme.name}</h3>
            <p>${theme.subName}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

// 필터 리스트 렌더링
function renderFilterList() {
  const container = document.getElementById("filter-grid-container");
  if (!container) return;

  container.innerHTML = Object.entries(FILTER_CONFIG)
    .map(([key, filter]) => {
      const isActive = key === state.selectedFilter ? "active" : "";
      return `
        <div class="filter-chip-card ${isActive}" data-filter="${key}" onclick="setFilter('${key}')">
          <span class="filter-icon">${filter.icon}</span>
          <span>${filter.name}</span>
        </div>
      `;
    })
    .join("");
}

function selectModeAndStart(mode) {
  state.layoutMode = mode;
  const tag = document.getElementById("current-mode-tag");
  if (tag) {
    tag.innerText = mode === "grid" ? "태블릿 2×2 모드 (엽서형)" : "데스크탑 4×1 모드 (스트립)";
  }
  goToScreen("theme");
  renderLiveThemePreview();
}

function goToScreen(screenName) {
  state.currentScreen = screenName;
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(`screen-${screenName}`);
  if (target) {
    target.classList.add("active");
  }

  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 50);
  }

  if (screenName === "theme") {
    renderLiveThemePreview();
  }

  if (screenName !== "camera" && state.stream) {
    stopCamera();
  }
}

function selectTheme(themeKey) {
  state.selectedTheme = themeKey;
  document.querySelectorAll(".theme-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.theme === themeKey);
  });

  const badgeName = document.getElementById("selected-theme-badge-name");
  if (badgeName) {
    badgeName.innerText = THEME_CONFIG[themeKey]?.name || "선택된 테마";
  }

  renderLiveThemePreview();
}

function setFilter(filterKey) {
  state.selectedFilter = filterKey;
  document.querySelectorAll(".filter-chip-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.filter === filterKey);
  });

  const video = document.getElementById("webcam");
  if (video) {
    video.style.filter = FILTER_CONFIG[filterKey]?.css || "none";
  }

  renderLiveThemePreview();
}

// ⭐️ 실시간 인쇄 완성형 라이브 프리뷰 렌더링 (볼드 & 대형 타이포그래피 적용)
function renderLiveThemePreview() {
  const canvas = document.getElementById("theme-live-preview-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const W = 600;
  const H = 900;
  canvas.width = W;
  canvas.height = H;

  const theme = THEME_CONFIG[state.selectedTheme] || THEME_CONFIG.pink_heart;

  // 배경 렌더링
  drawBackground(ctx, theme, W, H);

  // 샘플 사진 슬롯 4개
  const sampleColors = ["#94a3b8", "#cbd5e1", "#94a3b8", "#cbd5e1"];
  const sampleAvatars = ["👩‍🎓", "🧑‍🎓", "👧", "👦"];

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  if (state.layoutMode === "grid") {
    // 2x2 태블릿 모드
    const padX = 26;
    const topMargin = 36;
    const gapX = 14;
    const gapY = 14;
    const photoW = (W - padX * 2 - gapX) / 2;
    const photoH = 335;

    const positions = [
      { x: padX, y: topMargin },
      { x: padX + photoW + gapX, y: topMargin },
      { x: padX, y: topMargin + photoH + gapY },
      { x: padX + photoW + gapX, y: topMargin + photoH + gapY },
    ];

    positions.forEach((pos, idx) => {
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      drawSampleCard(ctx, pos.x, pos.y, photoW, photoH, theme, sampleColors[idx], sampleAvatars[idx], idx + 1);
      ctx.shadowColor = "transparent";
    });

    drawThemeArtwork(ctx, theme, W, H, padX, topMargin, photoW, photoH, gapX, gapY, false);

    // 하단 볼드 & 대형 텍스트 영역
    const footerY = topMargin + photoH * 2 + gapY + 32;

    // 메인 타이틀 (대형)
    ctx.fillStyle = theme.textColor;
    ctx.font = theme.titleFont.replace(/\d+px/, "28px");
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.fillText(theme.titleText, W / 2, footerY);

    // 서브 문구 (대형)
    ctx.fillStyle = theme.subTextColor;
    ctx.font = theme.subFont.replace(/\d+px/, "15px");
    ctx.shadowBlur = 4;
    ctx.fillText(`${theme.subText} • ${dateStr}`, W / 2, footerY + 28);
    ctx.shadowColor = "transparent";

  } else {
    // 4x1 스트립 모드
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    const columns = [0, W / 2];
    const colWidth = W / 2;

    columns.forEach((colX) => {
      const padX = 16;
      const topMargin = 24;
      const photoW = colWidth - padX * 2;
      const photoH = 155;
      const gapY = 12;

      for (let idx = 0; idx < 4; idx++) {
        const x = colX + padX;
        const y = topMargin + idx * (photoH + gapY);

        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;

        drawSampleCard(ctx, x, y, photoW, photoH, theme, sampleColors[idx], sampleAvatars[idx], idx + 1);
        ctx.shadowColor = "transparent";
      }

      drawThemeArtwork(ctx, theme, colWidth, H, padX, topMargin, photoW, photoH, 0, gapY, true, colX);

      const footerY = topMargin + 4 * (photoH + gapY) + 18;

      ctx.fillStyle = theme.textColor;
      ctx.font = theme.titleFont.replace(/\d+px/, "18px");
      ctx.textAlign = "center";
      ctx.fillText(theme.titleText, colX + colWidth / 2, footerY + 8);

      ctx.fillStyle = theme.subTextColor;
      ctx.font = theme.subFont.replace(/\d+px/, "11px");
      ctx.fillText(`${dateStr} • ${theme.subName}`, colX + colWidth / 2, footerY + 28);
    });
  }
}

// 라이브 뷰어용 샘플 카드
function drawSampleCard(ctx, x, y, w, h, theme, color, avatar, num) {
  ctx.save();
  const radius = 8;

  ctx.fillStyle = theme.cardBg || "#ffffff";
  drawRoundRect(ctx, x - 2, y - 2, w + 4, h + 4, radius + 2);
  ctx.fill();

  ctx.beginPath();
  drawRoundRect(ctx, x, y, w, h, radius);
  ctx.clip();

  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);

  ctx.font = `${Math.min(w, h) * 0.35}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(avatar, x + w / 2, y + h / 2 - 6);

  ctx.font = "bold 11px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(`Photo ${num}`, x + w / 2, y + h / 2 + Math.min(w, h) * 0.28);

  ctx.restore();
}

// 카메라 및 촬영 시퀀스
async function startCameraAndCountdown() {
  goToScreen("camera");
  state.capturedImages = [];
  resetThumbnailSlots();

  try {
    const video = document.getElementById("webcam");
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });
    video.srcObject = state.stream;
    video.style.filter = FILTER_CONFIG[state.selectedFilter]?.css || "none";

    setTimeout(() => {
      runPhotoSequence(0);
    }, 1500);
  } catch (err) {
    console.error("카메라 접근 오류:", err);
    alert("카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.");
    goToScreen("theme");
  }
}

function stopCamera() {
  if (state.stream) {
    state.stream.getTracks().forEach((track) => track.stop());
    state.stream = null;
  }
}

function resetThumbnailSlots() {
  for (let i = 0; i < 4; i++) {
    const slot = document.getElementById(`thumb-${i}`);
    if (slot) slot.innerHTML = `<div class="slot-num">${i + 1}</div>`;
  }
}

async function runPhotoSequence(cutIndex) {
  if (cutIndex >= 4) {
    stopCamera();
    await renderLife4CutCanvas();
    goToScreen("preview");
    return;
  }

  const indicator = document.getElementById("cut-indicator");
  if (indicator) {
    indicator.innerHTML = `<span class="active">${cutIndex + 1}</span> / 4`;
  }

  const countdownEl = document.getElementById("countdown-display");
  countdownEl.classList.remove("hidden");

  for (let c = 3; c >= 1; c--) {
    countdownEl.innerText = c;
    await sleep(1000);
  }
  countdownEl.classList.add("hidden");

  triggerFlash();
  const capturedBlobUrl = captureCurrentFrame();
  state.capturedImages.push(capturedBlobUrl);

  const thumbSlot = document.getElementById(`thumb-${cutIndex}`);
  if (thumbSlot) {
    thumbSlot.innerHTML = `<img src="${capturedBlobUrl}" alt="Cut ${cutIndex + 1}">`;
  }

  await sleep(1800);
  runPhotoSequence(cutIndex + 1);
}

function triggerFlash() {
  const flash = document.getElementById("flash-overlay");
  flash.classList.add("active");
  setTimeout(() => {
    flash.classList.remove("active");
  }, 150);
}

function captureCurrentFrame() {
  const video = document.getElementById("webcam");
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = video.videoWidth || 1280;
  tempCanvas.height = video.videoHeight || 720;
  const ctx = tempCanvas.getContext("2d");

  ctx.translate(tempCanvas.width, 0);
  ctx.scale(-1, 1);

  const filterCss = FILTER_CONFIG[state.selectedFilter]?.css;
  if (filterCss && filterCss !== "none") {
    ctx.filter = filterCss;
  }

  ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
  return tempCanvas.toDataURL("image/jpeg", 0.88);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ⭐️ 4. 고해상도 최종 인생네컷 캔버스 합성 (대형 & 볼드 폰트 적용)
async function renderLife4CutCanvas() {
  const canvas = document.getElementById("output-canvas");
  const ctx = canvas.getContext("2d");

  // 4x6 인치 300 DPI 규격 (1200 x 1800 픽셀)
  const W = 1200;
  const H = 1800;
  canvas.width = W;
  canvas.height = H;

  const theme = THEME_CONFIG[state.selectedTheme] || THEME_CONFIG.pink_heart;

  drawBackground(ctx, theme, W, H);

  const loadedImages = await Promise.all(
    state.capturedImages.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    })
  );

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  if (state.layoutMode === "grid") {
    // ⭐️ 2x2 태블릿 모드
    const padX = 52;
    const topMargin = 72;
    const gapX = 26;
    const gapY = 26;
    const photoW = (W - padX * 2 - gapX) / 2;
    const photoH = 670;

    const positions = [
      { x: padX, y: topMargin },
      { x: padX + photoW + gapX, y: topMargin },
      { x: padX, y: topMargin + photoH + gapY },
      { x: padX + photoW + gapX, y: topMargin + photoH + gapY },
    ];

    loadedImages.forEach((img, idx) => {
      if (idx >= 4) return;
      const pos = positions[idx];

      ctx.shadowColor = "rgba(0,0,0,0.32)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;

      drawPhotoFrame(ctx, img, pos.x, pos.y, photoW, photoH, theme);
      ctx.shadowColor = "transparent";
    });

    drawThemeArtwork(ctx, theme, W, H, padX, topMargin, photoW, photoH, gapX, gapY, false);

    // 하단 대형 타이포그래피 영역
    const footerY = topMargin + photoH * 2 + gapY + 54;

    // 메인 타이틀 (눈에 확 띄는 초대형 폰트)
    ctx.fillStyle = theme.textColor;
    ctx.font = theme.titleFont;
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillText(theme.titleText, W / 2, footerY);

    // 서브 문구 (선명한 크기)
    ctx.fillStyle = theme.subTextColor;
    ctx.font = theme.subFont;
    ctx.shadowBlur = 6;
    ctx.fillText(`${theme.subText} • ${dateStr}`, W / 2, footerY + 48);
    ctx.shadowColor = "transparent";

  } else {
    // ⭐️ 4x1 스트립 모드
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    const columns = [0, W / 2];
    const colWidth = W / 2;

    columns.forEach((colX) => {
      const padX = 32;
      const topMargin = 48;
      const photoW = colWidth - padX * 2;
      const photoH = 308;
      const gapY = 22;

      loadedImages.forEach((img, idx) => {
        const x = colX + padX;
        const y = topMargin + idx * (photoH + gapY);

        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        drawPhotoFrame(ctx, img, x, y, photoW, photoH, theme);
        ctx.shadowColor = "transparent";
      });

      drawThemeArtwork(ctx, theme, colWidth, H, padX, topMargin, photoW, photoH, 0, gapY, true, colX);

      const footerY = topMargin + 4 * (photoH + gapY) + 32;

      ctx.fillStyle = theme.textColor;
      ctx.font = theme.titleFont.replace(/\d+px/, "34px");
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 6;
      ctx.fillText(theme.titleText, colX + colWidth / 2, footerY + 8);

      ctx.fillStyle = theme.subTextColor;
      ctx.font = theme.subFont.replace(/\d+px/, "18px");
      ctx.shadowBlur = 4;
      ctx.fillText(`${dateStr} • ${theme.subName}`, colX + colWidth / 2, footerY + 44);
      ctx.shadowColor = "transparent";
    });
  }

  state.finalImageBase64 = canvas.toDataURL("image/jpeg", 0.88);
}

// 배경 렌더링
function drawBackground(ctx, theme, W, H) {
  if (theme.bgType === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, theme.gradient[0]);
    grad.addColorStop(1, theme.gradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  } else if (theme.bgType === "checker") {
    ctx.fillStyle = theme.checkerColor1;
    ctx.fillRect(0, 0, W, H);
    const size = W > 800 ? 32 : 16;
    ctx.fillStyle = theme.checkerColor2;
    for (let y = 0; y < H; y += size) {
      for (let x = 0; x < W; x += size) {
        if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  } else {
    ctx.fillStyle = theme.background || "#ffffff";
    ctx.fillRect(0, 0, W, H);
  }
}

function drawPhotoFrame(ctx, img, x, y, w, h, theme) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx, sy, sw, sh;

  if (imgRatio > targetRatio) {
    sh = img.height;
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = img.width / targetRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.save();
  const radius = 10;

  ctx.fillStyle = theme.cardBg || "#ffffff";
  drawRoundRect(ctx, x - 4, y - 4, w + 8, h + 8, radius + 2);
  ctx.fill();

  ctx.beginPath();
  drawRoundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

function drawThemeArtwork(ctx, theme, W, H, padX, topMargin, photoW, photoH, gapX, gapY, isStrip, colOffset = 0) {
  ctx.save();
  const scaleFactor = W < 800 ? 0.52 : 1.0;

  if (theme.drawOverlay === "heart_drawing") {
    ctx.strokeStyle = "#ff3b81";
    ctx.lineWidth = (isStrip ? 5 : 7) * scaleFactor;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (!isStrip) {
      const cx = colOffset + W / 2;
      const cy = topMargin + photoH + gapY / 2 - (20 * scaleFactor);
      drawBigHandmadeHeart(ctx, cx, cy, photoW * 1.55, photoH * 1.7);

      ctx.font = `bold ${32 * scaleFactor}px 'Montserrat', sans-serif`;
      ctx.fillStyle = "#ff3b81";
      ctx.fillText("XOXO", padX + 25 * scaleFactor, topMargin + 35 * scaleFactor);
      ctx.fillText("LOVE", W - padX - 35 * scaleFactor, topMargin + 35 * scaleFactor);
      ctx.fillText("♥ 100%", padX + 35 * scaleFactor, topMargin + photoH * 2 + gapY - (15 * scaleFactor));
    } else {
      const cx = colOffset + W / 2;
      const cy = topMargin + photoH * 2;
      drawBigHandmadeHeart(ctx, cx, cy, photoW * 1.1, photoH * 1.8);
      ctx.font = `bold ${22 * scaleFactor}px 'Montserrat', sans-serif`;
      ctx.fillStyle = "#ff3b81";
      ctx.fillText("XOXO", colOffset + padX + 18 * scaleFactor, topMargin + 25 * scaleFactor);
    }

  } else if (theme.drawOverlay === "cloud_dream") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = `${(isStrip ? 30 : 42) * scaleFactor}px serif`;
    ctx.fillText("🌙", colOffset + (isStrip ? W - 32 * scaleFactor : W - padX - 25 * scaleFactor), topMargin - 14 * scaleFactor);
    ctx.fillText("✨", colOffset + padX + 25 * scaleFactor, topMargin - 14 * scaleFactor);

    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    for (let i = 0; i < (isStrip ? 5 : 8); i++) {
      ctx.beginPath();
      ctx.arc(colOffset + (i * 180 * scaleFactor), H - 110 * scaleFactor, 60 * scaleFactor, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (theme.drawOverlay === "doodle_char") {
    ctx.font = `${(isStrip ? 32 : 46) * scaleFactor}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("🌸", colOffset + padX + 20 * scaleFactor, topMargin - 14 * scaleFactor);
    ctx.fillText("💜", colOffset + W - padX - 20 * scaleFactor, topMargin - 14 * scaleFactor);
    
    const cx = colOffset + W / 2;
    const cy = topMargin + photoH + gapY / 2;
    ctx.fillText("🐰", cx, cy);

    ctx.font = `bold ${24 * scaleFactor}px 'Gaegu', cursive`;
    ctx.fillStyle = "#0f172a";
    ctx.fillText("BEST CUT ✌️", cx, topMargin + photoH * 2 + gapY + 14 * scaleFactor);

  } else if (theme.drawOverlay === "checker_pattern") {
    const cx = colOffset + W / 2;
    const cy = topMargin + photoH + gapY / 2;
    ctx.font = `${(isStrip ? 36 : 52) * scaleFactor}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("😊", cx, cy);
    ctx.font = `${(isStrip ? 28 : 40) * scaleFactor}px serif`;
    ctx.fillText("⚡", colOffset + padX + 22 * scaleFactor, topMargin - 14 * scaleFactor);
    ctx.fillText("🍀", colOffset + W - padX - 22 * scaleFactor, topMargin - 14 * scaleFactor);

  } else if (theme.drawOverlay === "film_vintage") {
    ctx.font = `bold ${24 * scaleFactor}px monospace`;
    ctx.fillStyle = "#292524";
    ctx.textAlign = "left";
    ctx.fillText("REC ● 00:04:26", colOffset + padX + 10 * scaleFactor, topMargin - 14 * scaleFactor);
    ctx.textAlign = "right";
    ctx.fillText("ISO 400", colOffset + W - padX - 10 * scaleFactor, topMargin - 14 * scaleFactor);
    
    ctx.font = `${28 * scaleFactor}px serif`;
    ctx.fillText("▶", colOffset + padX + 25 * scaleFactor, H - 120 * scaleFactor);

  } else if (theme.drawOverlay === "comic_bubbles") {
    ctx.font = `${(isStrip ? 34 : 46) * scaleFactor}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("💥", colOffset + padX + 22 * scaleFactor, topMargin - 14 * scaleFactor);
    ctx.fillText("💭", colOffset + W - padX - 22 * scaleFactor, topMargin - 14 * scaleFactor);
    ctx.fillText("⭐", colOffset + W / 2, topMargin + photoH + gapY / 2);

  } else {
    const stickers = theme.stickers || ["✨", "💖", "⭐"];
    ctx.font = `${(isStrip ? 28 : 40) * scaleFactor}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(stickers[0], colOffset + padX + 20 * scaleFactor, topMargin - 14 * scaleFactor);
    ctx.fillText(stickers[1], colOffset + W - padX - 20 * scaleFactor, topMargin - 14 * scaleFactor);
    ctx.fillText(stickers[2] || "✨", colOffset + W / 2, topMargin + photoH + gapY / 2);
  }

  ctx.restore();
}

function drawBigHandmadeHeart(ctx, x, y, width, height) {
  ctx.save();
  ctx.beginPath();
  const topCurveHeight = height * 0.3;
  ctx.moveTo(x, y + topCurveHeight);

  ctx.bezierCurveTo(
    x, y, 
    x - width / 2, y, 
    x - width / 2, y + topCurveHeight
  );

  ctx.bezierCurveTo(
    x - width / 2, y + (height + topCurveHeight) / 2, 
    x, y + (height + topCurveHeight) / 1.5, 
    x, y + height / 1.25
  );

  ctx.bezierCurveTo(
    x, y + (height + topCurveHeight) / 1.5, 
    x + width / 2, y + (height + topCurveHeight) / 2, 
    x + width / 2, y + topCurveHeight
  );

  ctx.bezierCurveTo(
    x + width / 2, y, 
    x, y, 
    x, y + topCurveHeight
  );

  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// 재촬영
function retakePhotos() {
  goToScreen("theme");
}

// 인쇄 매수 설정
function setPrintQty(qty, element) {
  state.printQuantity = qty;
  document.querySelectorAll(".qty-btn").forEach((btn) => btn.classList.remove("active"));
  if (element) element.classList.add("active");
}

// 최종 전송 및 QR 생성
// 최종 전송 및 QR 생성
async function submitFinal() {
  const submitBtn = document.getElementById("submit-complete-btn");

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> 처리 중입니다...`;

  try {
    let qrUrl = "";
    let isServerOk = false;

    try {
      const res = await fetch("/api/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: state.finalImageBase64,
          printCount: state.printQuantity,
          frameTheme: state.selectedTheme,
          layoutMode: state.layoutMode,
          printerName: state.printerName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.qrCodeDataUrl) {
          qrUrl = data.qrCodeDataUrl;
          isServerOk = true;
        }
      }
    } catch (netErr) {
      console.warn("서버 API 연결 불가 (웹 앱 단독 실행 또는 네트워크 환경):", netErr);
    }

    // 서버 미연결 또는 정적 웹앱(GitHub Pages 등) 환경일 경우 클라이언트 자체 QR 생성
    if (!qrUrl && typeof QRCode !== "undefined" && QRCode.toDataURL) {
      try {
        const fallbackTarget = window.location.href;
        qrUrl = await QRCode.toDataURL(fallbackTarget, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 320,
        });
      } catch (qrErr) {
        console.error("클라이언트 QR 생성 실패:", qrErr);
      }
    }

    goToScreen("finish");

    const qrImg = document.getElementById("qr-image");
    if (qrImg) {
      if (qrUrl) {
        qrImg.src = qrUrl;
        qrImg.style.display = "block";
      } else {
        qrImg.style.display = "none";
      }
    }

    // 다이렉트 저장 링크 설정
    const directDl = document.getElementById("direct-download-link");
    if (directDl && state.finalImageBase64) {
      directDl.href = state.finalImageBase64;
      directDl.download = `life4cut_${Date.now()}.jpg`;
      directDl.style.display = "inline-block";
    }

    const statusMsg = document.getElementById("finish-status-msg");
    if (isServerOk && state.printQuantity > 0) {
      statusMsg.innerText = `포토 프린터(${state.printerName})에서 ${state.printQuantity}장이 인쇄되고 있습니다. 🖨️\n스마트폰으로 QR코드를 스캔하여 저장하세요!`;
    } else {
      statusMsg.innerText = "스마트폰으로 QR을 스캔하거나 아래 링크로 저장하세요! 📱";
    }

    startAutoResetTimer(20);
  } catch (err) {
    console.error("최종 처리 오류:", err);
    goToScreen("finish");
    const directDl = document.getElementById("direct-download-link");
    if (directDl && state.finalImageBase64) {
      directDl.href = state.finalImageBase64;
      directDl.download = `life4cut_${Date.now()}.jpg`;
      directDl.style.display = "inline-block";
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i data-lucide="qr-code"></i> <span>인쇄 & QR코드 받기</span>`;
    if (window.lucide) lucide.createIcons();
  }
}

// 자동 초기화 타이머
function startAutoResetTimer(seconds = 15) {
  if (state.resetTimerInterval) clearInterval(state.resetTimerInterval);

  let remain = seconds;
  const countEl = document.getElementById("reset-counter");
  if (countEl) countEl.innerText = remain;

  state.resetTimerInterval = setInterval(() => {
    remain -= 1;
    if (countEl) countEl.innerText = remain;

    if (remain <= 0) {
      clearInterval(state.resetTimerInterval);
      resetToHome();
    }
  }, 1000);
}

function resetToHome() {
  if (state.resetTimerInterval) clearInterval(state.resetTimerInterval);
  state.capturedImages = [];
  state.finalImageBase64 = null;
  goToScreen("home");
}

// ====================================================
// ⚙️ 프린터 설정 관리 함수들
// ====================================================
async function initPrinterConfig() {
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const data = await res.json();
      if (data.printerName && !localStorage.getItem("photobooth_printer")) {
        state.printerName = data.printerName;
      }
    }
  } catch (e) {
    console.log("Config fetch note:", e.message);
  }
  updatePrinterUI();
}

function updatePrinterUI() {
  const displayEl = document.getElementById("current-printer-display");
  if (displayEl) {
    displayEl.innerText = state.printerName;
  }
  const inputEl = document.getElementById("input-printer-name");
  if (inputEl) {
    inputEl.value = state.printerName;
  }
}

function openSettingsModal() {
  const modal = document.getElementById("modal-settings");
  if (!modal) return;
  modal.classList.remove("hidden");
  updatePrinterUI();

  const feedback = document.getElementById("printer-save-feedback");
  if (feedback) feedback.style.display = "none";

  detectPrinters();
  if (window.lucide) lucide.createIcons();
}

function closeSettingsModal() {
  const modal = document.getElementById("modal-settings");
  if (modal) modal.classList.add("hidden");
}

function handleModalOverlayClick(event) {
  if (event.target && event.target.id === "modal-settings") {
    closeSettingsModal();
  }
}

function setPrinterInputValue(name) {
  const input = document.getElementById("input-printer-name");
  if (input) {
    input.value = name;
  }

  // 칩 활성화 표시
  document.querySelectorAll(".printer-chip, .preset-chip").forEach((chip) => {
    if (chip.innerText.includes(name)) {
      chip.classList.add("active");
    } else {
      chip.classList.remove("active");
    }
  });
}

async function detectPrinters() {
  const container = document.getElementById("detected-printers-container");
  const listEl = document.getElementById("detected-printers-list");
  if (!container || !listEl) return;

  listEl.innerHTML = `<span style="font-size: 12px; color: #94a3b8;">🔍 연결된 프린터 검색 중...</span>`;
  container.style.display = "block";

  try {
    const res = await fetch("/api/printers");
    if (res.ok) {
      const data = await res.json();
      if (data.printers && data.printers.length > 0) {
        listEl.innerHTML = data.printers
          .map((name) => {
            const isSel = name === (document.getElementById("input-printer-name")?.value || state.printerName);
            const safeName = name.replace(/'/g, "\\'");
            return `<button type="button" class="printer-chip ${isSel ? "active" : ""}" onclick="setPrinterInputValue('${safeName}')">🖨️ ${name}</button>`;
          })
          .join("");
        return;
      }
    }
  } catch (e) {
    console.log("Printer search note:", e.message);
  }

  listEl.innerHTML = `<span style="font-size: 12px; color: #94a3b8;">프린터 목록을 직접 입력하거나 아래 자주 쓰는 프린터를 선택하세요.</span>`;
}

async function savePrinterSettings() {
  const input = document.getElementById("input-printer-name");
  const newName = input?.value?.trim();

  if (!newName) {
    alert("프린터 이름을 입력해 주세요.");
    return;
  }

  state.printerName = newName;
  localStorage.setItem("photobooth_printer", newName);
  updatePrinterUI();

  try {
    await fetch("/api/config/printer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ printerName: newName }),
    });
  } catch (e) {
    console.warn("서버 프린터 설정 동기화 알림 (로컬 적용됨):", e.message);
  }

  const feedback = document.getElementById("printer-save-feedback");
  if (feedback) {
    feedback.innerText = `✅ 프린터가 '${newName}'(으)로 저장되었습니다!`;
    feedback.style.display = "block";
  }

  setTimeout(() => {
    closeSettingsModal();
  }, 700);
}

// 🖨️ 브라우저 직접 인쇄 (AirPrint / Wi-Fi / 로컬 프린터 대화상자)
function printFromBrowser() {
  if (!state.finalImageBase64) {
    alert("인쇄할 사진이 준비되지 않았습니다.");
    return;
  }

  const printImg = document.getElementById("print-target-image");
  if (printImg) {
    printImg.src = state.finalImageBase64;
  }

  setTimeout(() => {
    window.print();
  }, 200);
}

// 🧪 선택된 프린터로 테스트 인쇄 전송
async function testPrintCurrent() {
  const input = document.getElementById("input-printer-name");
  const printer = input?.value?.trim() || state.printerName;
  const feedback = document.getElementById("printer-save-feedback");

  if (!printer) {
    alert("프린터 이름을 먼저 입력하거나 선택해 주세요.");
    return;
  }

  if (feedback) {
    feedback.innerText = `⏳ '${printer}'(으)로 테스트 인쇄 명령 전송 중...`;
    feedback.style.display = "block";
    feedback.style.background = "rgba(59, 130, 246, 0.15)";
    feedback.style.borderColor = "rgba(59, 130, 246, 0.4)";
    feedback.style.color = "#93c5fd";
  }

  try {
    const res = await fetch("/api/test-print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ printerName: printer }),
    });

    const data = await res.json();
    if (feedback) {
      if (data.success) {
        feedback.innerText = `✅ ${data.message}`;
        feedback.style.background = "rgba(34, 197, 94, 0.15)";
        feedback.style.borderColor = "rgba(34, 197, 94, 0.4)";
        feedback.style.color = "#4ade80";
      } else {
        feedback.innerText = `ℹ️ ${data.message}`;
        feedback.style.background = "rgba(234, 179, 8, 0.15)";
        feedback.style.borderColor = "rgba(234, 179, 8, 0.4)";
        feedback.style.color = "#facc15";
      }
    }
  } catch (err) {
    console.warn("테스트 인쇄 오류:", err);
    if (feedback) {
      feedback.innerText = "ℹ️ 클라우드(Vercel) 환경에서는 브라우저 인쇄창을 이용해 주세요.";
      feedback.style.background = "rgba(59, 130, 246, 0.15)";
      feedback.style.borderColor = "rgba(59, 130, 246, 0.4)";
      feedback.style.color = "#93c5fd";
    }
  }
}

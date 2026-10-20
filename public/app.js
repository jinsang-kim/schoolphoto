// 상태 관리 객체
const state = {
  currentScreen: "home",
  layoutMode: "grid", // 'grid' (태블릿 2x2) 또는 'strip' (데스크탑 4x1 2줄)
  selectedTheme: "dokdo_sunrise",
  selectedFilter: "bright",
  printQuantity: 1,
  printerName: localStorage.getItem("photobooth_printer") || "EPSON L15150 Series",
  capturedImages: [],
  stream: null,
  isCapturing: false,
  finalImageBase64: null,
  resetTimerInterval: null,
};

// ⭐️ 독도의 날 4종 & 세계 문화 다양성의 날 4종 (포스터 일러스트 기반 맞춤형 테마 8종)
const THEME_CONFIG = {
  // ====================================================
  // 🇰🇷 [독도의 날 (10월 25일)] 테마 4종 (합천여자고등학교 유네스코 동아리)
  // ====================================================
  dokdo_sunrise: {
    id: "dokdo_sunrise",
    category: "dokdo",
    name: "독도 • 찬란한 일출 🌅",
    subName: "10.25 독도의 날 (일출)",
    desc: "황금빛 동해 일출과 동도·서도, 태극 수채화",
    icon: "🌅",
    bgType: "dokdo_sunrise",
    gradient: ["#1e40af", "#f59e0b", "#0284c7"],
    textColor: "#ffffff",
    subTextColor: "#fef08a",
    clubText: "합천여자고등학교 • 유네스코 동아리",
    border: "#fbbf24",
    cardBg: "#ffffff",
    titleFont: "900 54px 'Black Han Sans', sans-serif",
    subFont: "700 23px 'Pretendard', sans-serif",
    topBannerText: "2026년 10월 25일 독도의 날 • DOKDO IS KOREA",
    titleText: "2026 독도의 날",
    subText: "바다는 이어져도 주권은 하나, 독도는 대한민국입니다",
    stickers: ["🇰🇷", "🌅", "🕊️", "🌺", "🌊"],
    drawOverlay: "dokdo_sunrise_art",
  },
  dokdo_ocean: {
    id: "dokdo_ocean",
    category: "dokdo",
    name: "독도 • 푸른 바다와 주권 🌊",
    subName: "Same Ocean Dokdo",
    desc: "청량한 동해 파도와 태극기, 갈매기",
    icon: "🌊",
    bgType: "dokdo_ocean",
    gradient: ["#e0f2fe", "#0284c7", "#0369a1"],
    textColor: "#ffffff",
    subTextColor: "#bae6fd",
    clubText: "합천여자고등학교 • 유네스코 동아리 (UNESCO)",
    border: "#38bdf8",
    cardBg: "#ffffff",
    titleFont: "bold 52px 'Gowun Batang', serif",
    subFont: "700 22px 'Pretendard', sans-serif",
    topBannerText: "SAME OCEAN • SAME TOMORROW • DOKDO IS KOREA",
    titleText: "작지만 위대한 이름, 독도",
    subText: "푸른 오늘이 더 밝은 내일의 독도를 만듭니다",
    stickers: ["🌊", "🇰🇷", "🕊️", "⚓", "✨"],
    drawOverlay: "dokdo_ocean_art",
  },
  dokdo_mugunghwa: {
    id: "dokdo_mugunghwa",
    category: "dokdo",
    name: "독도 • 영원한 우리땅 무궁화 🌺",
    subName: "Mugunghwa & Dokdo",
    desc: "활짝 핀 무궁화와 독도 수호 표지석 감성",
    icon: "🌺",
    bgType: "dokdo_mugunghwa",
    gradient: ["#fffbeb", "#fde68a", "#0369a1"],
    textColor: "#ffffff",
    subTextColor: "#fde047",
    clubText: "합천여자고등학교 유네스코 동아리 • 평화로운 미래",
    border: "#f472b6",
    cardBg: "#ffffff",
    titleFont: "900 50px 'Black Han Sans', sans-serif",
    subFont: "700 23px 'Pretendard', sans-serif",
    topBannerText: "매년 10월 25일 • 독도는 오늘도 아름답습니다",
    titleText: "독도, 영원히 우리의 땅",
    subText: "지켜온 우리 이어갈 미래 • 합천여자고등학교",
    stickers: ["🌺", "🇰🇷", "🪨", "🕊️", "💛"],
    drawOverlay: "dokdo_mugunghwa_art",
  },
  dokdo_unesco: {
    id: "dokdo_unesco",
    category: "dokdo",
    name: "독도 • 별빛 등대와 평화 🏮",
    subName: "Dokdo Starlight & UNESCO",
    desc: "독도 등대가 비추는 동해 밤바다와 유네스코 정신",
    icon: "🏮",
    bgType: "dokdo_unesco",
    gradient: ["#0f172a", "#1e3a8a", "#0284c7"],
    textColor: "#fef08a",
    subTextColor: "#e0f2fe",
    clubText: "합천여자고등학교 유네스코 동아리 • UNESCO",
    border: "#fef08a",
    cardBg: "#ffffff",
    titleFont: "bold 52px 'Gowun Batang', serif",
    subFont: "600 22px 'Pretendard', sans-serif",
    topBannerText: "KOREA DOKDO • OUR TOMORROW • 10.25",
    titleText: "독도는 오늘도 아름답습니다",
    subText: "더 넓은 세상을 보는 눈, 평화로운 미래를 만드는 실천",
    stickers: ["🏮", "🌟", "🇰🇷", "🕊️", "🌊"],
    drawOverlay: "dokdo_unesco_art",
  },

  // ====================================================
  // 🌍 [세계 문화 다양성의 날 (5월 21일)] 테마 4종 (합천여자고등학교 또래상담 동아리)
  // ====================================================
  diversity_rainbow: {
    id: "diversity_rainbow",
    category: "diversity",
    name: "문화다양성 • 무지개 지구 🌈",
    subName: "5.21 세계 문화 다양성의 날",
    desc: "일곱빛깔 무지개와 푸른 지구, 봄꽃 축제",
    icon: "🌈",
    bgType: "diversity_rainbow",
    gradient: ["#bae6fd", "#fef9c3", "#fbcfe8"],
    textColor: "#1e3a8a",
    subTextColor: "#db2777",
    clubText: "합천여자고등학교 • 또래상담 동아리 💕",
    border: "#f472b6",
    cardBg: "#ffffff",
    titleFont: "400 54px 'Jua', sans-serif",
    subFont: "700 23px 'Pretendard', sans-serif",
    topBannerText: "매년 5월 21일 • 다름이 모여, 더 아름다운 세상 💕",
    titleText: "세계 문화 다양성의 날",
    subText: "다양한 문화가 만드는 더 큰 이야기, 함께 만드는 미래",
    stickers: ["🌈", "🌍", "🌸", "🕊️", "💖"],
    drawOverlay: "diversity_rainbow_art",
  },
  diversity_harmony: {
    id: "diversity_harmony",
    category: "diversity",
    name: "문화다양성 • 맞잡은 손 🤝",
    subName: "Together In Harmony",
    desc: "지구 위에서 다함께 맞잡은 따뜻한 손과 꽃밭",
    icon: "🤝",
    bgType: "diversity_harmony",
    gradient: ["#e0f2fe", "#dcfce7", "#fef3c7"],
    textColor: "#065f46",
    subTextColor: "#d97706",
    clubText: "합천여자고등학교 또래상담 동아리 • 존중과 공감",
    border: "#34d399",
    cardBg: "#ffffff",
    titleFont: "400 52px 'Jua', sans-serif",
    subFont: "700 22px 'Pretendard', sans-serif",
    topBannerText: "DIFFERENT PEOPLE • BRIGHTER TOMORROW 🌍",
    titleText: "다름이 모여 더 아름다운 세상",
    subText: "서로를 이해하는 마음이 더 따뜻한 세상을 만듭니다 ♥",
    stickers: ["🤝", "🌍", "🌱", "🌼", "🧡"],
    drawOverlay: "diversity_harmony_art",
  },
  diversity_respect: {
    id: "diversity_respect",
    category: "diversity",
    name: "문화다양성 • 존중과 공감 💐",
    subName: "Respect & Empathy",
    desc: "화사한 교정과 봄꽃, 존중·이해·공감 푯말",
    icon: "💐",
    bgType: "diversity_respect",
    gradient: ["#fce7f3", "#fff1f2", "#fef3c7"],
    textColor: "#be185d",
    subTextColor: "#0369a1",
    clubText: "합천여자고등학교♥ • 또래상담 동아리",
    border: "#f43f5e",
    cardBg: "#ffffff",
    titleFont: "bold 56px 'Gaegu', cursive",
    subFont: "700 23px 'Pretendard', sans-serif",
    topBannerText: "존중 • 이해 • 공감 • 함께 • 더 나은 우리 💕",
    titleText: "존중 • 이해 • 공감 • 함께",
    subText: "다른 우리가 만드는 더 아름다운 세상 • 합천여고",
    stickers: ["💐", "🌸", "🪧", "💞", "🕊️"],
    drawOverlay: "diversity_respect_art",
  },
  diversity_future: {
    id: "diversity_future",
    category: "diversity",
    name: "문화다양성 • 피어나는 지구 🌍",
    subName: "Brighter Tomorrow",
    desc: "새싹이 피어나는 푸른 지구와 파스텔 하트",
    icon: "🌍",
    bgType: "diversity_future",
    gradient: ["#dbeafe", "#ede9fe", "#fce7f3"],
    textColor: "#4338ca",
    subTextColor: "#be185d",
    clubText: "합천여자고등학교 • 또래상담 동아리 (5월 21일)",
    border: "#818cf8",
    cardBg: "#ffffff",
    titleFont: "400 52px 'Jua', sans-serif",
    subFont: "700 22px 'Pretendard', sans-serif",
    topBannerText: "WORLD DAY FOR CULTURAL DIVERSITY • MAY 21",
    titleText: "함께 만들어가는 더 나은 미래",
    subText: "서로를 이해하는 마음이 더 따뜻한 세상을 만듭니다",
    stickers: ["🌍", "🌱", "🌈", "🤍", "🌷"],
    drawOverlay: "diversity_future_art",
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
      if (theme.gradient && theme.gradient.length >= 2) {
        bgStyle = `linear-gradient(180deg, ${theme.gradient.join(", ")})`;
      }

      const categoryBadge = theme.category === "dokdo"
        ? `<span style="position:absolute; top:4px; left:4px; background:rgba(30,58,138,0.85); color:#fef08a; font-size:8px; font-weight:800; padding:1px 4px; border-radius:4px; z-index:2;">독도의 날</span>`
        : `<span style="position:absolute; top:4px; left:4px; background:rgba(219,39,119,0.85); color:#ffffff; font-size:8px; font-weight:800; padding:1px 4px; border-radius:4px; z-index:2;">문화다양성</span>`;

      return `
        <div class="theme-card ${isActive}" data-theme="${key}" onclick="selectTheme('${key}')">
          ${categoryBadge}
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

  const theme = THEME_CONFIG[state.selectedTheme] || THEME_CONFIG.dokdo_sunrise;

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
    const topMargin = 42;
    const gapX = 14;
    const gapY = 14;
    const photoW = (W - padX * 2 - gapX) / 2;
    const photoH = 322;

    // 상단 기념일 배너 텍스트
    if (theme.topBannerText) {
      ctx.save();
      ctx.font = "bold 12px 'Pretendard', sans-serif";
      ctx.fillStyle = theme.category === "dokdo" ? "#ffffff" : "#1e293b";
      ctx.textAlign = "center";
      ctx.shadowColor = theme.category === "dokdo" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(theme.topBannerText, W / 2, 24);
      ctx.restore();
    }

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
    const footerY = topMargin + photoH * 2 + gapY + 34;

    // 메인 타이틀 (대형)
    ctx.save();
    ctx.fillStyle = theme.textColor;
    ctx.font = theme.titleFont.replace(/\d+px/, "27px");
    ctx.textAlign = "center";
    ctx.shadowColor = theme.category === "dokdo" ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.9)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillText(theme.titleText, W / 2, footerY);

    // 서브 문구 (슬로건)
    ctx.fillStyle = theme.subTextColor;
    ctx.font = theme.subFont.replace(/\d+px/, "12.5px");
    ctx.shadowBlur = 5;
    ctx.fillText(theme.subText, W / 2, footerY + 23);

    // 학교 및 동아리 배지
    const clubLabel = `${theme.clubText || "합천여자고등학교"} • ${dateStr}`;
    ctx.font = "bold 11.5px 'Pretendard', sans-serif";
    ctx.fillStyle = theme.category === "dokdo" ? "#ffffff" : "#0f172a";
    ctx.fillText(clubLabel, W / 2, footerY + 43);
    ctx.restore();

  } else {
    // 4x1 스트립 모드
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
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
      const topMargin = 28;
      const photoW = colWidth - padX * 2;
      const photoH = 150;
      const gapY = 11;

      if (theme.topBannerText) {
        ctx.save();
        ctx.font = "bold 8.5px 'Pretendard', sans-serif";
        ctx.fillStyle = theme.category === "dokdo" ? "#ffffff" : "#1e293b";
        ctx.textAlign = "center";
        ctx.fillText(theme.subName, colX + colWidth / 2, 17);
        ctx.restore();
      }

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

      ctx.save();
      ctx.fillStyle = theme.textColor;
      ctx.font = theme.titleFont.replace(/\d+px/, "16.5px");
      ctx.textAlign = "center";
      ctx.shadowColor = theme.category === "dokdo" ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.9)";
      ctx.shadowBlur = 5;
      ctx.fillText(theme.titleText, colX + colWidth / 2, footerY + 6);

      ctx.fillStyle = theme.subTextColor;
      ctx.font = theme.subFont.replace(/\d+px/, "9.5px");
      ctx.fillText(theme.subText, colX + colWidth / 2, footerY + 22);

      ctx.fillStyle = theme.category === "dokdo" ? "#ffffff" : "#0f172a";
      ctx.font = "bold 9px 'Pretendard', sans-serif";
      ctx.fillText(theme.clubText || "합천여자고등학교", colX + colWidth / 2, footerY + 36);
      ctx.restore();
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

  const theme = THEME_CONFIG[state.selectedTheme] || THEME_CONFIG.dokdo_sunrise;

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
    const topMargin = 84;
    const gapX = 26;
    const gapY = 26;
    const photoW = (W - padX * 2 - gapX) / 2;
    const photoH = 644;

    if (theme.topBannerText) {
      ctx.save();
      ctx.font = "bold 24px 'Pretendard', sans-serif";
      ctx.fillStyle = theme.category === "dokdo" ? "#ffffff" : "#1e293b";
      ctx.textAlign = "center";
      ctx.shadowColor = theme.category === "dokdo" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)";
      ctx.shadowBlur = 8;
      ctx.fillText(theme.topBannerText, W / 2, 48);
      ctx.restore();
    }

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
    const footerY = topMargin + photoH * 2 + gapY + 66;

    // 메인 타이틀 (눈에 확 띄는 초대형 폰트)
    ctx.save();
    ctx.fillStyle = theme.textColor;
    ctx.font = theme.titleFont;
    ctx.textAlign = "center";
    ctx.shadowColor = theme.category === "dokdo" ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.9)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillText(theme.titleText, W / 2, footerY);

    // 서브 문구 (선명한 크기)
    ctx.fillStyle = theme.subTextColor;
    ctx.font = theme.subFont;
    ctx.shadowBlur = 8;
    ctx.fillText(theme.subText, W / 2, footerY + 46);

    // 학교 및 동아리 배지
    const clubLabel = `${theme.clubText || "합천여자고등학교"} • ${dateStr}`;
    ctx.font = "bold 23px 'Pretendard', sans-serif";
    ctx.fillStyle = theme.category === "dokdo" ? "#ffffff" : "#0f172a";
    ctx.fillText(clubLabel, W / 2, footerY + 86);
    ctx.restore();

  } else {
    // ⭐️ 4x1 스트립 모드
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
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
      const topMargin = 56;
      const photoW = colWidth - padX * 2;
      const photoH = 300;
      const gapY = 22;

      if (theme.topBannerText) {
        ctx.save();
        ctx.font = "bold 17px 'Pretendard', sans-serif";
        ctx.fillStyle = theme.category === "dokdo" ? "#ffffff" : "#1e293b";
        ctx.textAlign = "center";
        ctx.fillText(theme.subName, colX + colWidth / 2, 34);
        ctx.restore();
      }

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

      const footerY = topMargin + 4 * (photoH + gapY) + 34;

      ctx.save();
      ctx.fillStyle = theme.textColor;
      ctx.font = theme.titleFont.replace(/\d+px/, "32px");
      ctx.textAlign = "center";
      ctx.shadowColor = theme.category === "dokdo" ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.9)";
      ctx.shadowBlur = 8;
      ctx.fillText(theme.titleText, colX + colWidth / 2, footerY + 10);

      ctx.fillStyle = theme.subTextColor;
      ctx.font = theme.subFont.replace(/\d+px/, "17px");
      ctx.shadowBlur = 4;
      ctx.fillText(theme.subText, colX + colWidth / 2, footerY + 42);

      ctx.fillStyle = theme.category === "dokdo" ? "#ffffff" : "#0f172a";
      ctx.font = "bold 16px 'Pretendard', sans-serif";
      ctx.fillText(theme.clubText || "합천여자고등학교", colX + colWidth / 2, footerY + 70);
      ctx.restore();
    });
  }

  state.finalImageBase64 = canvas.toDataURL("image/jpeg", 0.88);
}

// ====================================================
// 🎨 독도의 날 & 세계 문화 다양성의 날 전용 배경 일러스트 엔진
// ====================================================
function drawBackground(ctx, theme, W, H) {
  ctx.save();
  const s = W / 1200; // 1200px 기준 스케일 팩터

  if (theme.bgType === "dokdo_sunrise") {
    // 1. 독도의 날 - 찬란한 황금 일출과 동해 바다, 구름
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1e3a8a");
    grad.addColorStop(0.28, "#3b82f6");
    grad.addColorStop(0.55, "#f59e0b");
    grad.addColorStop(0.75, "#0284c7");
    grad.addColorStop(1, "#0c4a6e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 태양 광채 (우측 일출)
    const sunX = W * 0.82;
    const sunY = H * 0.56;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 10 * s, sunX, sunY, 450 * s);
    sunGrad.addColorStop(0, "rgba(255, 251, 235, 0.95)");
    sunGrad.addColorStop(0.3, "rgba(253, 224, 71, 0.55)");
    sunGrad.addColorStop(0.7, "rgba(251, 146, 60, 0.2)");
    sunGrad.addColorStop(1, "rgba(251, 146, 60, 0)");
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, W, H);

    // 좌측 상단 수채화 태극 문양 (1번 포스터 이미지 오마주)
    drawTaegeukWatermark(ctx, 135 * s, 125 * s, 110 * s, 0.42);

    // 하단 독도 동도 & 서도 실루엣과 바다 물결
    drawDokdoIslands(ctx, W, H, s, "#1e293b", "#15803d", true);
    drawOceanWaves(ctx, W, H, s, "#0369a1", "#bae6fd");

  } else if (theme.bgType === "dokdo_ocean") {
    // 2. 독도의 날 - 푸른 바다와 주권 (청량한 하늘 & 코발트블루 동해)
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#bae6fd");
    grad.addColorStop(0.35, "#38bdf8");
    grad.addColorStop(0.7, "#0284c7");
    grad.addColorStop(1, "#075985");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 구름 결
    drawSoftClouds(ctx, W, H * 0.25, s, "rgba(255,255,255,0.45)");
    drawTaegeukWatermark(ctx, W - 130 * s, 120 * s, 95 * s, 0.38);

    // 독도 섬과 흰 파도 포말
    drawDokdoIslands(ctx, W, H, s, "#334155", "#16a34a", false);
    drawOceanWaves(ctx, W, H, s, "#0284c7", "#ffffff");

  } else if (theme.bgType === "dokdo_mugunghwa") {
    // 3. 독도의 날 - 무궁화와 독도 표지석, 따뜻한 노을 바다
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#fef3c7");
    grad.addColorStop(0.35, "#fde68a");
    grad.addColorStop(0.65, "#38bdf8");
    grad.addColorStop(1, "#0369a1");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawTaegeukWatermark(ctx, 130 * s, 120 * s, 100 * s, 0.35);
    drawDokdoIslands(ctx, W, H, s, "#475569", "#15803d", true);
    drawOceanWaves(ctx, W, H, s, "#0369a1", "#e0f2fe");

    // 무궁화 꽃장식 (좌/우 하단)
    drawMugunghwaFlower(ctx, 90 * s, H - 95 * s, 48 * s);
    drawMugunghwaFlower(ctx, 175 * s, H - 55 * s, 38 * s);
    drawMugunghwaFlower(ctx, W - 95 * s, H - 90 * s, 46 * s);

  } else if (theme.bgType === "dokdo_unesco") {
    // 4. 독도의 날 - 별빛 등대와 평화 (밤바다 & 황금 등대 불빛)
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#090d16");
    grad.addColorStop(0.4, "#1e3a8a");
    grad.addColorStop(0.78, "#0369a1");
    grad.addColorStop(1, "#0c4a6e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 반짝이는 별빛
    ctx.fillStyle = "rgba(254, 240, 138, 0.8)";
    const stars = [
      [120, 90], [280, 60], [450, 110], [750, 70], [980, 95], [1080, 150],
      [90, 280], [1120, 320], [600, 55], [880, 180]
    ];
    stars.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx * s, sy * s, 3.5 * s, 0, Math.PI * 2);
      ctx.fill();
    });

    // 등대 불빛 빔
    ctx.save();
    const beamGrad = ctx.createLinearGradient(W * 0.72, H * 0.84, W * 0.2, H * 0.65);
    beamGrad.addColorStop(0, "rgba(254, 240, 138, 0.55)");
    beamGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(W * 0.72, H * 0.84);
    ctx.lineTo(W * 0.1, H * 0.60);
    ctx.lineTo(W * 0.1, H * 0.76);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    drawDokdoIslands(ctx, W, H, s, "#0f172a", "#065f46", true);
    drawOceanWaves(ctx, W, H, s, "#075985", "#7dd3fc");

  } else if (theme.bgType === "diversity_rainbow") {
    // 5. 세계 문화 다양성의 날 - 무지개 아치와 푸른 지구, 봄꽃 (2번 포스터 메인 오마주)
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#bae6fd");
    grad.addColorStop(0.35, "#e0f2fe");
    grad.addColorStop(0.75, "#fef9c3");
    grad.addColorStop(1, "#dcfce7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 상단 대형 파스텔 무지개 아치
    drawRainbowArch(ctx, W / 2, H * 0.28, 620 * s, 26 * s, 0.55);
    // 하단 푸른 지구 반원 일러스트
    drawEarthGlobeBottom(ctx, W / 2, H + 120 * s, 340 * s);
    // 좌우 화사한 꽃장식
    drawSpringFlowersBorder(ctx, W, H, s);

  } else if (theme.bgType === "diversity_harmony") {
    // 6. 세계 문화 다양성의 날 - 맞잡은 손과 화합의 초록 지구
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#e0f2fe");
    grad.addColorStop(0.5, "#f0fdf4");
    grad.addColorStop(1, "#dcfce7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawRainbowArch(ctx, W / 2, H * 0.24, 580 * s, 20 * s, 0.4);
    drawEarthGlobeBottom(ctx, W / 2, H + 110 * s, 330 * s);
    drawSpringFlowersBorder(ctx, W, H, s);

  } else if (theme.bgType === "diversity_respect") {
    // 7. 세계 문화 다양성의 날 - 존중·이해·공감 핑크빛 봄날과 교정 감성
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#fce7f3");
    grad.addColorStop(0.45, "#fff1f2");
    grad.addColorStop(1, "#fef3c7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawRainbowArch(ctx, W / 2, H * 0.3, 600 * s, 22 * s, 0.45);
    drawSpringFlowersBorder(ctx, W, H, s);

  } else if (theme.bgType === "diversity_future") {
    // 8. 세계 문화 다양성의 날 - 새싹이 피어나는 지구와 밝은 내일
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#dbeafe");
    grad.addColorStop(0.5, "#ede9fe");
    grad.addColorStop(1, "#fce7f3");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawRainbowArch(ctx, W / 2, H * 0.25, 600 * s, 24 * s, 0.5);
    drawEarthGlobeBottom(ctx, W / 2, H + 125 * s, 330 * s);
    drawSpringFlowersBorder(ctx, W, H, s);

  } else {
    ctx.fillStyle = theme.background || "#ffffff";
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();
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
  const radius = 12;

  // 외곽 테마 컬러 보더 및 화이트 프레임
  ctx.fillStyle = theme.cardBg || "#ffffff";
  drawRoundRect(ctx, x - 5, y - 5, w + 10, h + 10, radius + 3);
  ctx.fill();

  if (theme.border) {
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 3;
    drawRoundRect(ctx, x - 5, y - 5, w + 10, h + 10, radius + 3);
    ctx.stroke();
  }

  ctx.beginPath();
  drawRoundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

// ====================================================
// 🎨 테마별 포스터 디테일 오버레이 아트워크 (스티커, 푯말, 갈매기, 무궁화, 지구 등)
// ====================================================
function drawThemeArtwork(ctx, theme, W, H, padX, topMargin, photoW, photoH, gapX, gapY, isStrip, colOffset = 0) {
  ctx.save();
  const scaleFactor = W < 800 ? 0.5 : 1.0;
  const cx = colOffset + W / 2;
  const cy = isStrip ? (topMargin + photoH * 2 + gapY * 1.5) : (topMargin + photoH + gapY / 2);

  if (theme.category === "dokdo") {
    // 1. 갈매기 실루엣 날아다니는 연출 (포스터 우측 상단 모티프)
    drawSeagull(ctx, colOffset + W - padX - 85 * scaleFactor, topMargin - 20 * scaleFactor, 22 * scaleFactor, "#ffffff");
    drawSeagull(ctx, colOffset + W - padX - 40 * scaleFactor, topMargin - 34 * scaleFactor, 16 * scaleFactor, "#fef08a");

    // 2. 좌/우 상단 코너 엠블럼
    ctx.font = `${(isStrip ? 26 : 38) * scaleFactor}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🇰🇷", colOffset + padX + 22 * scaleFactor, topMargin - 20 * scaleFactor);

    // 3. 중앙 배지 (동도·서도 / 무궁화 / 등대 / 태극)
    if (theme.drawOverlay === "dokdo_sunrise_art") {
      drawCenterBadgePill(ctx, cx, cy, "🌅 10.25 독도의 날", "#1e3a8a", "#fef08a", scaleFactor);
    } else if (theme.drawOverlay === "dokdo_ocean_art") {
      drawCenterBadgePill(ctx, cx, cy, "🌊 DOKDO IS KOREA", "#0369a1", "#ffffff", scaleFactor);
    } else if (theme.drawOverlay === "dokdo_mugunghwa_art") {
      drawCenterBadgePill(ctx, cx, cy, "🌺 영원히 우리의 땅, 독도", "#9d174d", "#fef08a", scaleFactor);
    } else if (theme.drawOverlay === "dokdo_unesco_art") {
      drawCenterBadgePill(ctx, cx, cy, "🏮 UNESCO • 평화의 섬 독도", "#0f172a", "#fef08a", scaleFactor);
    }

    // 4. 좌측 하단 '독도, 지금도 그리고 영원히 우리의 땅' 바위 표지석 모티프 (2x2 모드)
    if (!isStrip) {
      drawDokdoStonePlaque(ctx, colOffset + padX + 75 * scaleFactor, topMargin + photoH * 2 + gapY + 58 * scaleFactor, scaleFactor);
      drawUnescoStamp(ctx, colOffset + W - padX - 85 * scaleFactor, topMargin + photoH * 2 + gapY + 58 * scaleFactor, scaleFactor);
    }

  } else if (theme.category === "diversity") {
    // 세계 문화 다양성의 날 아트워크 (2번 포스터 모티프)
    // 1. 평화의 비둘기 & 꽃 장식
    ctx.font = `${(isStrip ? 26 : 38) * scaleFactor}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🕊️", colOffset + padX + 24 * scaleFactor, topMargin - 22 * scaleFactor);
    ctx.fillText("🌈", colOffset + W - padX - 24 * scaleFactor, topMargin - 22 * scaleFactor);

    // 2. 중앙 새싹 지구 & 하트 배지
    if (theme.drawOverlay === "diversity_rainbow_art") {
      drawCenterBadgePill(ctx, cx, cy, "🌍 5.21 세계 문화 다양성의 날", "#2563eb", "#ffffff", scaleFactor);
    } else if (theme.drawOverlay === "diversity_harmony_art") {
      drawCenterBadgePill(ctx, cx, cy, "🤝 다름이 모여 더 아름다운 세상", "#059669", "#ffffff", scaleFactor);
    } else if (theme.drawOverlay === "diversity_respect_art") {
      drawCenterBadgePill(ctx, cx, cy, "💖 존중 • 이해 • 공감 • 함께", "#db2777", "#ffffff", scaleFactor);
    } else if (theme.drawOverlay === "diversity_future_art") {
      drawCenterBadgePill(ctx, cx, cy, "🌱 서로를 이해하는 따뜻한 마음", "#4f46e5", "#ffffff", scaleFactor);
    }

    // 3. 포스터 속 나무 푯말 (좌: 다른 우리가 만드는 세상 / 우: 존중·이해·공감·함께)
    if (!isStrip) {
      drawWoodenSignpost(
        ctx,
        colOffset + padX + 75 * scaleFactor,
        topMargin + photoH * 2 + gapY + 56 * scaleFactor,
        ["다른 우리가 만드는", "더 아름다운 세상 ♥"],
        scaleFactor
      );
      drawWoodenSignpost(
        ctx,
        colOffset + W - padX - 75 * scaleFactor,
        topMargin + photoH * 2 + gapY + 56 * scaleFactor,
        ["존중 • 이해 • 공감", "더 나은 우리 💕"],
        scaleFactor
      );
    }
  }

  ctx.restore();
}

// ====================================================
// 🖌️ 일러스트 헬퍼 함수 모음 (태극, 독도, 무궁화, 무지개, 지구, 푯말 등)
// ====================================================

// 1. 수채화풍 태극 문양 (1번 포스터 좌측 상단)
function drawTaegeukWatermark(ctx, cx, cy, r, alpha = 0.4) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // 상단 붉은 태극
  ctx.fillStyle = "#e11d48";
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.arc(cx + r / 2, cy, r / 2, 0, Math.PI, false);
  ctx.arc(cx - r / 2, cy, r / 2, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();

  // 하단 푸른 태극
  ctx.fillStyle = "#1d4ed8";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI, false);
  ctx.arc(cx - r / 2, cy, r / 2, Math.PI, 0, false);
  ctx.arc(cx + r / 2, cy, r / 2, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// 2. 독도 동도 & 서도 바위섬과 하얀 등대 일러스트
function drawDokdoIslands(ctx, W, H, s, rockColor, greenColor, hasLighthouse) {
  ctx.save();
  const baseY = H - 85 * s;

  // 서도 (왼쪽 웅장한 봉우리)
  ctx.fillStyle = rockColor;
  ctx.beginPath();
  ctx.moveTo(W * 0.14, baseY);
  ctx.lineTo(W * 0.24, baseY - 115 * s);
  ctx.lineTo(W * 0.31, baseY - 155 * s);
  ctx.lineTo(W * 0.39, baseY - 95 * s);
  ctx.lineTo(W * 0.46, baseY);
  ctx.closePath();
  ctx.fill();

  // 서도 초록 식생 터치
  ctx.fillStyle = greenColor;
  ctx.beginPath();
  ctx.moveTo(W * 0.24, baseY - 110 * s);
  ctx.lineTo(W * 0.31, baseY - 155 * s);
  ctx.lineTo(W * 0.36, baseY - 90 * s);
  ctx.lineTo(W * 0.28, baseY - 60 * s);
  ctx.closePath();
  ctx.fill();

  // 동도 (오른쪽 봉우리 + 독도 등대)
  ctx.fillStyle = rockColor;
  ctx.beginPath();
  ctx.moveTo(W * 0.56, baseY);
  ctx.lineTo(W * 0.63, baseY - 85 * s);
  ctx.lineTo(W * 0.72, baseY - 110 * s);
  ctx.lineTo(W * 0.79, baseY - 90 * s);
  ctx.lineTo(W * 0.86, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = greenColor;
  ctx.beginPath();
  ctx.moveTo(W * 0.64, baseY - 80 * s);
  ctx.lineTo(W * 0.72, baseY - 110 * s);
  ctx.lineTo(W * 0.78, baseY - 82 * s);
  ctx.lineTo(W * 0.69, baseY - 48 * s);
  ctx.closePath();
  ctx.fill();

  // 동도 정상 하얀 등대
  if (hasLighthouse) {
    const lx = W * 0.72;
    const ly = baseY - 110 * s;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(lx - 6 * s, ly - 22 * s, 12 * s, 22 * s);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(lx - 8 * s, ly - 26 * s, 16 * s, 5 * s);
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(lx, ly - 29 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// 3. 동해 바다 물결 & 파도 포말
function drawOceanWaves(ctx, W, H, s, seaColor, foamColor) {
  ctx.save();
  ctx.fillStyle = seaColor;
  ctx.beginPath();
  ctx.moveTo(0, H - 95 * s);
  for (let x = 0; x <= W; x += 120 * s) {
    ctx.quadraticCurveTo(x + 60 * s, H - 112 * s, x + 120 * s, H - 95 * s);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = foamColor;
  ctx.lineWidth = 4 * s;
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.moveTo(0, H - 75 * s);
  for (let x = 0; x <= W; x += 100 * s) {
    ctx.quadraticCurveTo(x + 50 * s, H - 90 * s, x + 100 * s, H - 75 * s);
  }
  ctx.stroke();
  ctx.restore();
}

// 4. 무궁화 꽃 일러스트
function drawMugunghwaFlower(ctx, cx, cy, r) {
  ctx.save();
  const petalColors = ["#f9a8d4", "#f472b6"];
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const px = cx + Math.cos(angle) * (r * 0.45);
    const py = cy + Math.sin(angle) * (r * 0.45);
    ctx.fillStyle = petalColors[i % 2];
    ctx.beginPath();
    ctx.arc(px, py, r * 0.52, 0, Math.PI * 2);
    ctx.fill();
  }
  // 무궁화 중심 단심 (붉은 중심 + 수술)
  ctx.fillStyle = "#be123c";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 5. 갈매기 실루엣
function drawSeagull(ctx, x, y, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.14);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size, y + size * 0.2);
  ctx.quadraticCurveTo(x - size * 0.4, y - size * 0.45, x, y);
  ctx.quadraticCurveTo(x + size * 0.4, y - size * 0.45, x + size, y + size * 0.2);
  ctx.stroke();
  ctx.restore();
}

// 6. 독도 바위 표지석 ('독도, 지금도 그리고 영원히 우리의 땅')
function drawDokdoStonePlaque(ctx, cx, cy, s) {
  ctx.save();
  ctx.fillStyle = "#78716c";
  ctx.strokeStyle = "#d6d3d1";
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 78 * s, 36 * s, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${13 * s}px 'Gowun Batang', serif`;
  ctx.textAlign = "center";
  ctx.fillText("독도, 영원히 우리의 땅", cx, cy + 4 * s);
  ctx.restore();
}

// 7. 유네스코 스탬프 배지
function drawUnescoStamp(ctx, cx, cy, s) {
  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
  ctx.strokeStyle = "#fef08a";
  ctx.lineWidth = 2 * s;
  drawRoundRect(ctx, cx - 76 * s, cy - 26 * s, 152 * s, 52 * s, 10 * s);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fef08a";
  ctx.font = `bold ${13 * s}px 'Montserrat', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("🏛️ UNESCO CLUB", cx, cy - 4 * s);
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${11 * s}px 'Pretendard', sans-serif`;
  ctx.fillText("합천여자고등학교", cx, cy + 14 * s);
  ctx.restore();
}

// 8. 세계 문화 다양성의 날 - 파스텔 무지개 아치
function drawRainbowArch(ctx, cx, cy, radius, bandWidth, alpha = 0.5) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const colors = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#38bdf8", "#818cf8", "#e879f9"];
  colors.forEach((col, i) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = bandWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - i * bandWidth, Math.PI, 0, false);
    ctx.stroke();
  });
  ctx.restore();
}

// 9. 세계 문화 다양성의 날 - 하단 푸른 지구 일러스트
function drawEarthGlobeBottom(ctx, cx, cy, r) {
  ctx.save();
  // 푸른 바다 구체
  const globeGrad = ctx.createRadialGradient(cx, cy - r * 0.3, r * 0.1, cx, cy, r);
  globeGrad.addColorStop(0, "#38bdf8");
  globeGrad.addColorStop(1, "#0284c7");
  ctx.fillStyle = globeGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.fill();

  // 초록 대륙 형태
  ctx.fillStyle = "#4ade80";
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, cy - r * 0.55, r * 0.32, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.3, cy - r * 0.62, r * 0.28, 0, Math.PI * 2);
  ctx.arc(cx, cy - r * 0.78, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // 지구 외곽 밝은 빛 테두리
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.stroke();
  ctx.restore();
}

// 10. 봄꽃 테두리 장식
function drawSpringFlowersBorder(ctx, W, H, s) {
  ctx.save();
  const flowerPositions = [
    [55 * s, H - 55 * s, "#f472b6", 24 * s],
    [115 * s, H - 35 * s, "#facc15", 20 * s],
    [165 * s, H - 60 * s, "#fb7185", 18 * s],
    [W - 55 * s, H - 55 * s, "#f472b6", 24 * s],
    [W - 115 * s, H - 35 * s, "#38bdf8", 20 * s],
    [W - 165 * s, H - 60 * s, "#facc15", 18 * s],
  ];
  flowerPositions.forEach(([fx, fy, col, rad]) => {
    ctx.save();
    ctx.translate(fx, fy);
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.ellipse(0, -rad * 0.55, rad * 0.42, rad * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = "#fef08a";
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

// 11. 나무 푯말 일러스트 (2번 포스터 좌/우 푯말 모티프)
function drawWoodenSignpost(ctx, cx, cy, lines, s) {
  ctx.save();
  const bw = 168 * s;
  const bh = 54 * s;
  ctx.fillStyle = "#fef3c7";
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 2.5 * s;
  drawRoundRect(ctx, cx - bw / 2, cy - bh / 2, bw, bh, 10 * s);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#78350f";
  ctx.font = `bold ${12.5 * s}px 'Pretendard', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(lines[0], cx, cy - 6 * s);
  ctx.fillStyle = "#be185d";
  ctx.fillText(lines[1], cx, cy + 13 * s);
  ctx.restore();
}

// 12. 중앙 라운드 배지 필(Pill)
function drawCenterBadgePill(ctx, cx, cy, text, bgColor, textColor, s) {
  ctx.save();
  ctx.font = `bold ${22 * s}px 'Pretendard', sans-serif`;
  const textWidth = ctx.measureText(text).width;
  const pw = textWidth + 44 * s;
  const ph = 44 * s;

  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 10 * s;
  ctx.shadowOffsetY = 3 * s;

  ctx.fillStyle = bgColor;
  drawRoundRect(ctx, cx - pw / 2, cy - ph / 2, pw, ph, ph / 2);
  ctx.fill();

  ctx.strokeStyle = textColor;
  ctx.lineWidth = 2.5 * s;
  drawRoundRect(ctx, cx - pw / 2, cy - ph / 2, pw, ph, ph / 2);
  ctx.stroke();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy + 1 * s);
  ctx.restore();
}

// 13. 부드러운 구름
function drawSoftClouds(ctx, W, y, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc((120 + i * 210) * s, y + (i % 2) * 25 * s, 65 * s, 0, Math.PI * 2);
    ctx.fill();
  }
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

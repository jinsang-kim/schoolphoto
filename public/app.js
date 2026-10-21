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

// ⭐️ 고해상도 일러스트 배경 이미지 프리로드 캐시
const THEME_IMAGES = {};

// ⭐️ 독도의 날 4종 & 세계 문화 다양성의 날 4종 (여고생 감성 하이틴/수채화 일러스트 테마 8종)
const THEME_CONFIG = {
  // ====================================================
  // 🇰🇷 [독도의 날 (10월 25일)] 테마 4종 (합천여자고등학교 유네스코 동아리)
  // ====================================================
  dokdo_sunrise: {
    id: "dokdo_sunrise",
    category: "dokdo",
    name: "독도 • 찬란한 일출 🌅",
    subName: "10.25 독도의 날 (수채화 일출)",
    desc: "황금빛 동해 일출과 동도·서도, 태극 수채화와 무궁화",
    icon: "🌅",
    bgType: "dokdo_sunrise",
    bgImageUrl: "/frames/dokdo_sunrise.jpg",
    gradient: ["#3b82f6", "#fde68a", "#0284c7"],
    textColor: "#0f172a",
    titleStroke: "#ffffff",
    accentColor: "#be123c",
    subTextColor: "#1e3a8a",
    clubName: "합천여자고등학교",
    clubSub: "유네스코 동아리",
    clubMotto: "더 넓은 세상을 보는 눈, 평화로운 미래를 만드는 우리의 작은 실천",
    border: "#fbbf24",
    tapeColor: "rgba(254, 240, 138, 0.78)",
    ribbonColor: "#f472b6",
    cardBg: "#ffffff",
    titleFont: "800 56px 'Gowun Batang', serif",
    subFont: "700 21px 'Pretendard', sans-serif",
    dateBadgeText: "매년 10월 25일 • 2026년 독도의 날",
    titleText: "독도의 날",
    subText: "푸른 오늘이, 더 밝은 내일의 독도를 만듭니다",
    sideQuoteLeft: "바다는 이어져도 주권은 하나, 독도는 대한민국입니다",
    sideQuoteRight: "“독도는 오늘도 아름답습니다.”",
    stickers: ["🇰🇷", "🌺", "🕊️", "✨"],
    cutLabels: ["DOKDO 10.25", "EAST SEA", "OUR LAND", "KOREA 🇰🇷"],
    drawOverlay: "dokdo_sunrise_art",
  },
  dokdo_ocean: {
    id: "dokdo_ocean",
    category: "dokdo",
    name: "독도 • 핑크 노을과 윤슬 🎀",
    subName: "Romantic Sunset Dokdo",
    desc: "여고생 취향저격 로맨틱 파스텔 핑크·라벤더 노을과 윤슬",
    icon: "🎀",
    bgType: "dokdo_ocean",
    bgImageUrl: "/frames/dokdo_ocean.jpg",
    gradient: ["#f9a8d4", "#fed7aa", "#7dd3fc"],
    textColor: "#831843",
    titleStroke: "#ffffff",
    accentColor: "#db2777",
    subTextColor: "#9d174d",
    clubName: "합천여자고등학교",
    clubSub: "유네스코 동아리",
    clubMotto: "지켜온 우리, 이어갈 미래 • DOKDO IS KOREA",
    border: "#f9a8d4",
    tapeColor: "rgba(249, 168, 212, 0.78)",
    ribbonColor: "#f472b6",
    cardBg: "#ffffff",
    titleFont: "700 50px 'Gowun Batang', serif",
    subFont: "700 21px 'Pretendard', sans-serif",
    dateBadgeText: "OCTOBER 25 • ROMANTIC DOKDO SUNSET",
    titleText: "작지만 위대한 이름, 독도",
    subText: "“독도는 오늘도 아름답습니다” • 반짝이는 우리의 바다",
    sideQuoteLeft: "KOREA • DOKDO • OUR TOMORROW",
    sideQuoteRight: "영원히 빛날 우리의 아름다운 섬 💕",
    stickers: ["🎀", "🌺", "✨", "🕊️"],
    cutLabels: ["PINK SUNSET", "SHINING SEA", "DOKDO LOVE", "FOREVER 💕"],
    drawOverlay: "dokdo_ocean_art",
  },
  dokdo_mugunghwa: {
    id: "dokdo_mugunghwa",
    category: "dokdo",
    name: "독도 • 무궁화 다꾸 정원 🌺",
    subName: "Mugunghwa Diary Deco",
    desc: "수채화 무궁화 꽃가랜드와 파스텔 블루 리본 하이틴 감성",
    icon: "🌺",
    bgType: "dokdo_mugunghwa",
    bgImageUrl: "/frames/dokdo_mugunghwa.jpg",
    gradient: ["#e0f2fe", "#ffffff", "#fce7f3"],
    textColor: "#1e3a8a",
    titleStroke: "#ffffff",
    accentColor: "#e11d48",
    subTextColor: "#be185d",
    clubName: "합천여자고등학교",
    clubSub: "유네스코 동아리",
    clubMotto: "바다는 이어져도 주권은 하나, 독도는 대한민국입니다",
    border: "#93c5fd",
    tapeColor: "rgba(186, 230, 253, 0.82)",
    ribbonColor: "#60a5fa",
    cardBg: "#ffffff",
    titleFont: "700 48px 'Gowun Batang', serif",
    subFont: "700 21px 'Pretendard', sans-serif",
    dateBadgeText: "10월 25일 독도의 날 • MUGUNGHWA GARDEN",
    titleText: "독도, 영원히 우리의 땅",
    subText: "활짝 핀 무궁화처럼 언제나 피어나는 대한민국의 자부심",
    sideQuoteLeft: "SAME OCEAN • SAME TOMORROW",
    sideQuoteRight: "독도, 지금도 그리고 영원히 🌺",
    stickers: ["🌺", "🎀", "🇰🇷", "💧"],
    cutLabels: ["MUGUNGHWA", "BLUE RIBBON", "PURE OCEAN", "DOKDO DAY"],
    drawOverlay: "dokdo_mugunghwa_art",
  },
  dokdo_unesco: {
    id: "dokdo_unesco",
    category: "dokdo",
    name: "독도 • 별빛 등대와 은하수 🌌",
    subName: "Starlight Night Dokdo",
    desc: "별똥별 쏟아지는 보랏빛 은하수와 밤바다를 비추는 독도 등대",
    icon: "🌌",
    bgType: "dokdo_unesco",
    bgImageUrl: "/frames/dokdo_unesco.jpg",
    gradient: ["#1e1b4b", "#6d28d9", "#0284c7"],
    textColor: "#fef08a",
    titleStroke: "#1e1b4b",
    accentColor: "#f472b6",
    subTextColor: "#f5d0fe",
    clubName: "합천여자고등학교",
    clubSub: "유네스코 동아리",
    clubMotto: "더 넓은 세상을 보는 눈, 평화로운 미래를 만드는 우리의 작은 실천",
    border: "#c4b5fd",
    tapeColor: "rgba(216, 180, 254, 0.78)",
    ribbonColor: "#c084fc",
    cardBg: "#ffffff",
    titleFont: "700 50px 'Gowun Batang', serif",
    subFont: "700 21px 'Pretendard', sans-serif",
    dateBadgeText: "STARLIGHT OVER DOKDO • 2026. 10. 25",
    titleText: "별빛이 지키는 아름다운 독도",
    subText: "밤바다를 밝히는 등대처럼 영원히 빛날 우리의 땅",
    sideQuoteLeft: "EDUCATION FOR A MORE PEACEFUL WORLD",
    sideQuoteRight: "별빛 아래 더욱 빛나는 독도 ✨",
    stickers: ["🌙", "✨", "🏮", "🌺"],
    cutLabels: ["STARLIGHT", "MILKY WAY", "LIGHTHOUSE", "PEACE 🌙"],
    drawOverlay: "dokdo_unesco_art",
  },

  // ====================================================
  // 🌍 [세계 문화 다양성의 날 (5월 21일)] 테마 4종 (합천여자고등학교 또래상담 동아리)
  // ====================================================
  diversity_rainbow: {
    id: "diversity_rainbow",
    category: "diversity",
    name: "문화다양성 • 무지개 봄꽃 지구 🌈",
    subName: "5.21 세계 문화 다양성의 날",
    desc: "파스텔 무지개와 흰 비둘기, 코스모스·데이지가 피어난 푸른 지구",
    icon: "🌈",
    bgType: "diversity_rainbow",
    bgImageUrl: "/frames/diversity_rainbow.jpg",
    gradient: ["#bae6fd", "#fef9c3", "#bbf7d0"],
    textColor: "#1d4ed8",
    titleStroke: "#ffffff",
    accentColor: "#ec4899",
    subTextColor: "#be185d",
    clubName: "합천여자고등학교",
    clubSub: "또래상담 동아리",
    clubMotto: "서로를 이해하는 마음이 더 따뜻한 세상을 만듭니다 ♥",
    border: "#f472b6",
    tapeColor: "rgba(251, 207, 232, 0.82)",
    ribbonColor: "#f472b6",
    cardBg: "#ffffff",
    titleFont: "400 54px 'Jua', sans-serif",
    subFont: "700 21px 'Pretendard', sans-serif",
    dateBadgeText: "♥ 다름이 모여, 더 아름다운 세상 • 매년 5월 21일 ♥",
    titleText: "세계 문화 다양성의 날",
    subText: "다양한 문화가 만드는 더 큰 이야기, 함께 만들어가는 더 나은 미래 ♥",
    sideQuoteLeft: "다른 우리가 만드는 더 아름다운 세상 ♥",
    sideQuoteRight: "존중 • 이해 • 공감 • 함께 ♥",
    stickers: ["🌈", "🕊️", "🌸", "🌍"],
    cutLabels: ["RESPECT ♥", "EMPATHY 🌸", "HARMONY 🌈", "TOGETHER 🌍"],
    drawOverlay: "diversity_rainbow_art",
  },
  diversity_harmony: {
    id: "diversity_harmony",
    category: "diversity",
    name: "문화다양성 • 벚꽃 하이틴 교정 🌸",
    subName: "High-Teen Blossom Campus",
    desc: "핑크 깅엄체크 리본과 벚꽃 피는 합천여고 교정, 새싹 지구",
    icon: "🌸",
    bgType: "diversity_harmony",
    bgImageUrl: "/frames/diversity_harmony.jpg",
    gradient: ["#fce7f3", "#fff1f2", "#dcfce7"],
    textColor: "#be185d",
    titleStroke: "#ffffff",
    accentColor: "#f43f5e",
    subTextColor: "#9d174d",
    clubName: "합천여자고등학교 ♥",
    clubSub: "또래상담 동아리",
    clubMotto: "존중 • 이해 • 공감 • 함께 더 나은 우리 💕",
    border: "#f9a8d4",
    tapeColor: "rgba(254, 205, 211, 0.85)",
    ribbonColor: "#fb7185",
    cardBg: "#ffffff",
    titleFont: "400 50px 'Jua', sans-serif",
    subFont: "700 21px 'Pretendard', sans-serif",
    dateBadgeText: "HAPCHEON GIRLS’ HIGH SCHOOL • MAY 21 💕",
    titleText: "다름이 모여 더 아름다운 세상",
    subText: "따뜻한 공감으로 꽃피는 우리들의 핑크빛 봄날 🌸",
    sideQuoteLeft: "Different People, Brighter Tomorrow ♥",
    sideQuoteRight: "합천여자고등학교 또래상담 동아리 ♥",
    stickers: ["🎀", "🌸", "🌱", "💖"],
    cutLabels: ["CAMPUS 🌸", "BEST FRIENDS", "SWEET EMPATHY", "OUR SPRING 🎀"],
    drawOverlay: "diversity_harmony_art",
  },
  diversity_respect: {
    id: "diversity_respect",
    category: "diversity",
    name: "문화다양성 • 요정의 클로버 정원 🍀",
    subName: "Fairy Clover & Wildflowers",
    desc: "네잎클로버와 나비, 수채화 야생화 가랜드가 감싸는 페어리 가든",
    icon: "🍀",
    bgType: "diversity_respect",
    bgImageUrl: "/frames/diversity_respect.jpg",
    gradient: ["#d1fae5", "#e0f2fe", "#f3e8ff"],
    textColor: "#047857",
    titleStroke: "#ffffff",
    accentColor: "#ec4899",
    subTextColor: "#0369a1",
    clubName: "합천여자고등학교",
    clubSub: "또래상담 동아리",
    clubMotto: "서로를 이해하는 마음이 더 따뜻한 세상을 만듭니다 ♥",
    border: "#6ee7b7",
    tapeColor: "rgba(167, 243, 208, 0.82)",
    ribbonColor: "#f9a8d4",
    cardBg: "#ffffff",
    titleFont: "400 50px 'Jua', sans-serif",
    subFont: "700 21px 'Pretendard', sans-serif",
    dateBadgeText: "🍀 LUCKY CLOVER & CULTURAL DIVERSITY • 05.21 🦋",
    titleText: "존중 • 이해 • 공감 • 함께",
    subText: "각기 다른 꽃들이 모여 가장 아름다운 정원을 이룹니다",
    sideQuoteLeft: "다른 우리가 만드는 더 아름다운 세상 🍀",
    sideQuoteRight: "함께 자라나는 따뜻한 마음 🦋",
    stickers: ["🍀", "🦋", "🌼", "🎀"],
    cutLabels: ["LUCKY 🍀", "KIND HEART", "BUTTERFLY 🦋", "BLOOMING 🌼"],
    drawOverlay: "diversity_respect_art",
  },
  diversity_future: {
    id: "diversity_future",
    category: "diversity",
    name: "문화다양성 • 몽환 파스텔 하트구름 💜",
    subName: "Dreamy Y2K Pastel Heart",
    desc: "통통한 3D 파스텔 하트와 진주 가랜드, 솜사탕 구름 속 귀여운 지구",
    icon: "💜",
    bgType: "diversity_future",
    bgImageUrl: "/frames/diversity_future.jpg",
    gradient: ["#e9d5ff", "#fbcfe8", "#fef08a"],
    textColor: "#6d28d9",
    titleStroke: "#ffffff",
    accentColor: "#ec4899",
    subTextColor: "#be185d",
    clubName: "합천여자고등학교",
    clubSub: "또래상담 동아리",
    clubMotto: "다양한 문화가 만드는 더 큰 이야기, 함께 만들어가는 더 나은 미래 ♥",
    border: "#c4b5fd",
    tapeColor: "rgba(233, 213, 255, 0.85)",
    ribbonColor: "#f472b6",
    cardBg: "#ffffff",
    titleFont: "400 50px 'Jua', sans-serif",
    subFont: "700 21px 'Pretendard', sans-serif",
    dateBadgeText: "✨ WORLD DAY FOR CULTURAL DIVERSITY • 5.21 💜",
    titleText: "함께 만들어가는 더 나은 미래",
    subText: "서로의 빛깔을 존중할 때 가장 반짝이는 우리들의 지구 ✨",
    sideQuoteLeft: "WE ARE ONE SHINING EARTH 💜",
    sideQuoteRight: "서로를 이해하는 따뜻한 마음 💕",
    stickers: ["💜", "🎀", "🌷", "✨"],
    cutLabels: ["DREAMY 💜", "SHINING ✨", "TULIP LOVE 🌷", "PEER CLUB 💕"],
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

// 테마 배경 이미지 사전 로드
function preloadThemeImages() {
  Object.entries(THEME_CONFIG).forEach(([key, theme]) => {
    if (theme.bgImageUrl && !THEME_IMAGES[key]) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        THEME_IMAGES[key] = img;
        if (state.selectedTheme === key) {
          renderLiveThemePreview();
        }
      };
      img.src = theme.bgImageUrl;
    }
  });
}

function ensureThemeImageLoaded(themeKey) {
  return new Promise((resolve) => {
    if (THEME_IMAGES[themeKey] && THEME_IMAGES[themeKey].complete) {
      resolve(THEME_IMAGES[themeKey]);
      return;
    }
    const theme = THEME_CONFIG[themeKey];
    if (!theme || !theme.bgImageUrl) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      THEME_IMAGES[themeKey] = img;
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = theme.bgImageUrl;
  });
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  preloadThemeImages();
  renderThemeList();
  renderFilterList();
  initPrinterConfig();
  updateModeDisplay();

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

// 테마 리스트 렌더링 (실제 일러스트 썸네일 반영)
function renderThemeList() {
  const container = document.getElementById("theme-grid-container");
  if (!container) return;

  container.innerHTML = Object.entries(THEME_CONFIG)
    .map(([key, theme]) => {
      const isActive = key === state.selectedTheme ? "active" : "";
      let bgStyle = theme.background || "#ffffff";
      if (theme.bgImageUrl) {
        bgStyle = `url('${theme.bgImageUrl}') center/cover no-repeat`;
      } else if (theme.gradient && theme.gradient.length >= 2) {
        bgStyle = `linear-gradient(180deg, ${theme.gradient.join(", ")})`;
      }

      const categoryBadge =
        theme.category === "dokdo"
          ? `<span style="position:absolute; top:4px; left:4px; background:linear-gradient(135deg,#1e3a8a,#2563eb); color:#fef08a; font-size:8.5px; font-weight:800; padding:1.5px 5px; border-radius:999px; z-index:2; box-shadow:0 2px 5px rgba(0,0,0,0.35);">독도의 날</span>`
          : `<span style="position:absolute; top:4px; left:4px; background:linear-gradient(135deg,#ec4899,#8b5cf6); color:#ffffff; font-size:8.5px; font-weight:800; padding:1.5px 5px; border-radius:999px; z-index:2; box-shadow:0 2px 5px rgba(0,0,0,0.35);">문화다양성</span>`;

      return `
        <div class="theme-card ${isActive}" data-theme="${key}" onclick="selectTheme('${key}')">
          ${categoryBadge}
          <div class="theme-card-icon-badge">${theme.icon}</div>
          <div class="theme-preview-mini" style="background: ${bgStyle};">
            <div class="mini-cut-grid" style="margin-top: 8px; margin-bottom: 14px;">
              <div class="mini-cut" style="border: 1px solid ${theme.border}; background: rgba(255,255,255,0.72);"></div>
              <div class="mini-cut" style="border: 1px solid ${theme.border}; background: rgba(255,255,255,0.72);"></div>
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
  updateModeDisplay();
  goToScreen("theme");
  renderLiveThemePreview();
}

function updateModeDisplay() {
  const isGrid = state.layoutMode === "grid";
  const tag = document.getElementById("current-mode-tag");
  if (tag) {
    tag.innerText = isGrid ? "4×6인치 엽서형 (2×2)" : "4×6인치 스트립 (2줄)";
  }

  const ratioTag = document.getElementById("viewer-ratio-tag");
  if (ratioTag) {
    ratioTag.innerText = isGrid ? "4×6인치 엽서형" : "4×6인치 스트립 (2줄)";
  }

  const badge = document.getElementById("current-size-badge");
  if (badge) {
    badge.innerText = isGrid ? "4×6인치 엽서형 (2×2)" : "4×6인치 스트립 (2줄)";
  }

  const btnGrid = document.getElementById("btn-size-grid");
  const btnStrip = document.getElementById("btn-size-strip");
  if (btnGrid) btnGrid.classList.toggle("active", isGrid);
  if (btnStrip) btnStrip.classList.toggle("active", !isGrid);

  const cardGrid = document.getElementById("card-mode-grid");
  const cardStrip = document.getElementById("card-mode-strip");
  if (cardGrid) cardGrid.classList.toggle("active-pulse", isGrid);
  if (cardStrip) cardStrip.classList.toggle("active-pulse", !isGrid);

  const hint = document.getElementById("print-layout-hint");
  if (hint) {
    hint.innerText = isGrid
      ? "※ 4×6인치(10×15cm) 엽서형 포토 인화지로 인쇄됩니다."
      : "※ 4×6인치 인화지에 2줄로 인쇄되어 친구와 반 잘라 나눌 수 있습니다.";
  }
}

// ⭐️ 결과 화면에서 사진 사이즈 실시간 변경 (4×6 엽서형 vs 4×6 스트립)
async function changePhotoSize(newMode) {
  if (state.layoutMode === newMode) return;
  state.layoutMode = newMode;
  updateModeDisplay();

  showToast(newMode === "grid" ? "📐 4×6인치 엽서형(2×2)으로 변경되었습니다." : "📐 4×6인치 스트립(2줄)으로 변경되었습니다.");

  // 촬영된 사진이 있으면 실시간 재합성
  if (state.capturedImages && state.capturedImages.length > 0) {
    await renderLife4CutCanvas();
  }
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

// ⭐️ 실시간 인쇄 완성형 라이브 프리뷰 렌더링 (600x900)
function renderLiveThemePreview() {
  const canvas = document.getElementById("theme-live-preview-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const W = 600;
  const H = 900;
  canvas.width = W;
  canvas.height = H;

  const theme = THEME_CONFIG[state.selectedTheme] || THEME_CONFIG.dokdo_sunrise;
  renderCompositeFrame(ctx, theme, W, H, null);
}

// 📐 실제 인화 영역 뷰파인더 사각형 크기 및 비율 계산
function updateViewfinderSize() {
  const box = document.getElementById("viewfinder-box");
  const wrapper = document.querySelector(".camera-wrapper");
  const label = document.getElementById("viewfinder-label-text");
  if (!box || !wrapper) return;

  const isGrid = state.layoutMode === "grid";
  // 인화 사진 슬롯의 실제 가로/세로 비율 (grid: 534/692 ≈ 0.7717, strip: 520/340 ≈ 1.5294)
  const targetRatio = isGrid ? (534 / 692) : (520 / 340);

  if (label) {
    label.innerText = isGrid
      ? "📸 실제 인화 영역 (4×6 엽서형 2×2)"
      : "📸 실제 인화 영역 (4×6 스트립 2줄)";
  }

  const cw = wrapper.clientWidth || window.innerWidth;
  const ch = wrapper.clientHeight || window.innerHeight;

  // 상단 컷 인디케이터(~80px)와 하단 썸네일바(~90px)를 피하는 최대 가용 공간
  const availW = Math.max(220, cw - 40);
  const availH = Math.max(200, ch - 170);

  let boxW, boxH;
  if (availW / availH > targetRatio) {
    boxH = Math.min(availH, isGrid ? 640 : 420);
    boxW = Math.round(boxH * targetRatio);
  } else {
    boxW = Math.min(availW, 900);
    boxH = Math.round(boxW / targetRatio);
  }

  box.style.width = `${boxW}px`;
  box.style.height = `${boxH}px`;
}

// 윈도우 리사이즈 및 회전 시 뷰파인더 비율 동기화
window.addEventListener("resize", () => {
  if (state.currentScreen === "camera") {
    updateViewfinderSize();
  }
});
window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    if (state.currentScreen === "camera") {
      updateViewfinderSize();
    }
  }, 200);
});

// 카메라 및 촬영 시퀀스
async function startCameraAndCountdown() {
  goToScreen("camera");
  state.capturedImages = [];
  resetThumbnailSlots();
  updateViewfinderSize();

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

    video.onloadedmetadata = () => {
      updateViewfinderSize();
    };

    setTimeout(() => {
      updateViewfinderSize();
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
  const box = document.getElementById("viewfinder-box");
  if (flash) flash.classList.add("active");
  if (box) box.classList.add("flash-pulse");

  setTimeout(() => {
    if (flash) flash.classList.remove("active");
    if (box) box.classList.remove("flash-pulse");
  }, 180);
}

// ⭐️ 뷰파인더 사각형 내부의 인화 영역만 100% 일치하도록 정밀 캡처
function captureCurrentFrame() {
  const video = document.getElementById("webcam");
  const box = document.getElementById("viewfinder-box");
  const tempCanvas = document.createElement("canvas");

  const Vw = video.videoWidth || 1280;
  const Vh = video.videoHeight || 720;

  const isGrid = state.layoutMode === "grid";
  const targetRatio = isGrid ? (534 / 692) : (520 / 340);

  let cropX = 0;
  let cropY = 0;
  let cropW = Vw;
  let cropH = Vh;

  if (box && video.clientWidth > 0 && video.clientHeight > 0) {
    const vRect = video.getBoundingClientRect();
    const bRect = box.getBoundingClientRect();

    const Dw = video.clientWidth;
    const Dh = video.clientHeight;

    // object-fit: cover 스케일 계산
    const scale = Math.max(Dw / Vw, Dh / Vh);
    const Sw = Vw * scale;
    const Sh = Vh * scale;

    const Ox = (Dw - Sw) / 2;
    const Oy = (Dh - Sh) / 2;

    const Bx = bRect.left - vRect.left;
    const By = bRect.top - vRect.top;
    const Bw = bRect.width;
    const Bh = bRect.height;

    // 비디오는 좌우 반전(scaleX(-1))되어 표시되므로 시각적 X 위치를 미러링하여 센서 원본 좌표 추출
    const visualBx = Dw - (Bx + Bw);

    cropX = (visualBx - Ox) / scale;
    cropY = (By - Oy) / scale;
    cropW = Bw / scale;
    cropH = Bh / scale;

    // 경계 클램핑
    cropX = Math.max(0, Math.min(cropX, Vw - 10));
    cropY = Math.max(0, Math.min(cropY, Vh - 10));
    cropW = Math.max(10, Math.min(cropW, Vw - cropX));
    cropH = Math.max(10, Math.min(cropH, Vh - cropY));
  } else {
    if (Vw / Vh > targetRatio) {
      cropH = Vh;
      cropW = Vh * targetRatio;
      cropX = (Vw - cropW) / 2;
      cropY = 0;
    } else {
      cropW = Vw;
      cropH = Vw / targetRatio;
      cropX = 0;
      cropY = (Vh - cropH) / 2;
    }
  }

  // 1200px 기준 고화질 캡처 캔버스 (타겟 인화 비율과 1:1 일치)
  tempCanvas.width = 1200;
  tempCanvas.height = Math.round(1200 / targetRatio);
  const ctx = tempCanvas.getContext("2d");

  // 사용자 시각과 동일한 거울 모드 좌우 반전
  ctx.translate(tempCanvas.width, 0);
  ctx.scale(-1, 1);

  const filterCss = FILTER_CONFIG[state.selectedFilter]?.css;
  if (filterCss && filterCss !== "none") {
    ctx.filter = filterCss;
  }

  ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, tempCanvas.width, tempCanvas.height);
  return tempCanvas.toDataURL("image/jpeg", 0.92);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ⭐️ 고해상도 최종 인생네컷 캔버스 합성 (1200 x 1800, 300 DPI)
async function renderLife4CutCanvas() {
  const canvas = document.getElementById("output-canvas");
  const ctx = canvas.getContext("2d");

  const W = 1200;
  const H = 1800;
  canvas.width = W;
  canvas.height = H;

  const theme = THEME_CONFIG[state.selectedTheme] || THEME_CONFIG.dokdo_sunrise;
  await ensureThemeImageLoaded(theme.id);

  const loadedImages = await Promise.all(
    state.capturedImages.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    })
  );

  renderCompositeFrame(ctx, theme, W, H, loadedImages);
  state.finalImageBase64 = canvas.toDataURL("image/jpeg", 0.92);
}

// ====================================================
// 🎨 하이틴 여고생 감성 포토부스 통합 렌더링 엔진 (미리보기 & 최종 인쇄 공용)
// ====================================================
function renderCompositeFrame(ctx, theme, W, H, loadedImages) {
  const s = W / 1200; // 1200x1800 기준 스케일 팩터 (프리뷰는 0.5, 인쇄본은 1.0)
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  if (state.layoutMode === "grid") {
    // 1. 전체 배경 일러스트 렌더링
    drawBackgroundIllustration(ctx, theme, 0, 0, W, H);

    // 2. 상단 여백 제거 (사진이 상단 topMargin = 48*s 부터 시원하게 바로 시작)
    const padX = 54 * s;
    const topMargin = 48 * s;
    const gapX = 24 * s;
    const gapY = 24 * s;
    const photoW = (W - padX * 2 - gapX) / 2; // 534 * s
    const photoH = 692 * s; // 48 + 692*2 + 24 = 1456*s (하단 카드에 충분한 공간 제공)

    const positions = [
      { x: padX, y: topMargin },
      { x: padX + photoW + gapX, y: topMargin },
      { x: padX, y: topMargin + photoH + gapY },
      { x: padX + photoW + gapX, y: topMargin + photoH + gapY },
    ];

    positions.forEach((pos, idx) => {
      if (loadedImages && loadedImages[idx]) {
        drawPolaroidPhotoSlot(ctx, loadedImages[idx], pos.x, pos.y, photoW, photoH, theme, idx, s);
      } else {
        drawKawaiiSampleSlot(ctx, pos.x, pos.y, photoW, photoH, theme, idx, s);
      }
    });

    // 3. 여고생 다꾸 스티커 오버레이 (파스텔 마스킹 테이프, 새틴 리본, 3D 하트, 진주)
    drawHighTeenDecoOverlays(ctx, theme, 0, W, H, padX, topMargin, photoW, photoH, gapX, gapY, s, false);

    // 4. 하단 통합 정보 카드 (기념일 배지, 메인 타이틀, 서브 슬로건, 학교/동아리 시그니처, 촬영일자)
    drawBottomOrganizedInfo(ctx, theme, 0, W, H, dateStr, s, false);

  } else {
    // ⭐️ 4x1 스트립 모드 (좌/우 2줄 분할 인쇄)
    const colWidth = W / 2;
    const columns = [0, colWidth];

    columns.forEach((colX) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(colX, 0, colWidth, H);
      ctx.clip();

      // 각 스트립마다 일러스트 배경 렌더링
      drawBackgroundIllustration(ctx, theme, colX, 0, colWidth, H);

      // 상단 여백 제거 (사진이 topMargin = 48*s 부터 바로 시작)
      const padX = 40 * s;
      const topMargin = 48 * s;
      const photoW = colWidth - padX * 2; // 520 * s
      const photoH = 340 * s; // 48 + 340*4 + 16*3 = 1456*s
      const gapY = 16 * s;

      for (let idx = 0; idx < 4; idx++) {
        const x = colX + padX;
        const y = topMargin + idx * (photoH + gapY);
        if (loadedImages && loadedImages[idx]) {
          drawPolaroidPhotoSlot(ctx, loadedImages[idx], x, y, photoW, photoH, theme, idx, s * 0.78);
        } else {
          drawKawaiiSampleSlot(ctx, x, y, photoW, photoH, theme, idx, s * 0.78);
        }
      }

      drawHighTeenDecoOverlays(ctx, theme, colX, colWidth, H, padX, topMargin, photoW, photoH, 0, gapY, s, true);
      drawBottomOrganizedInfo(ctx, theme, colX, colWidth, H, dateStr, s, true);

      ctx.restore();
    });

    // 중앙 절취선
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2 * s;
    ctx.setLineDash([8 * s, 8 * s]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.restore();
  }
}

// 1. 고해상도 일러스트 배경 그리기 (Cover Fit + 폴백 그라데이션)
function drawBackgroundIllustration(ctx, theme, x, y, w, h) {
  ctx.save();
  const bgImg = THEME_IMAGES[theme.id];
  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
    const targetRatio = w / h;
    let sx, sy, sw, sh;
    if (imgRatio > targetRatio) {
      sh = bgImg.naturalHeight;
      sw = sh * targetRatio;
      sx = (bgImg.naturalWidth - sw) / 2;
      sy = 0;
    } else {
      sw = bgImg.naturalWidth;
      sh = sw / targetRatio;
      sx = 0;
      sy = (bgImg.naturalHeight - sh) / 2;
    }
    ctx.drawImage(bgImg, sx, sy, sw, sh, x, y, w, h);
  } else {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    const cols = theme.gradient || ["#bae6fd", "#fce7f3", "#fef08a"];
    grad.addColorStop(0, cols[0]);
    grad.addColorStop(0.5, cols[1] || cols[0]);
    grad.addColorStop(1, cols[2] || cols[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

// 2. 상단 포스터 감성 헤더 (기념일 배지 + 외곽선 광채 메인 타이틀 + 서브 슬로건)
function drawTopAestheticHeader(ctx, theme, colX, W, s, isStrip) {
  ctx.save();
  const cx = colX + W / 2;
  const st = isStrip ? s * 0.62 : s;

  // 상단 반투명 글래스 빛무리 (글자 가독성을 높여주면서 일러스트를 가리지 않음)
  const glowGrad = ctx.createRadialGradient(cx, 72 * s, 10 * st, cx, 72 * s, 360 * st);
  if (theme.id === "dokdo_unesco") {
    glowGrad.addColorStop(0, "rgba(15, 23, 42, 0.58)");
    glowGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
  } else {
    glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.72)");
    glowGrad.addColorStop(0.7, "rgba(255, 255, 255, 0.25)");
    glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  }
  ctx.fillStyle = glowGrad;
  ctx.fillRect(colX, 0, W, 155 * s);

  // (1) 상단 날짜/기념일 캡슐 필 배지
  ctx.font = `800 ${15 * st}px 'Pretendard', sans-serif`;
  const badgeText = theme.dateBadgeText;
  const bw = ctx.measureText(badgeText).width + 32 * st;
  const bh = 26 * st;
  const by = 16 * s;

  ctx.fillStyle = theme.category === "dokdo"
    ? (theme.id === "dokdo_unesco" ? "rgba(30, 27, 75, 0.85)" : "rgba(255, 255, 255, 0.88)")
    : "rgba(255, 255, 255, 0.9)";
  drawRoundRect(ctx, cx - bw / 2, by, bw, bh, bh / 2);
  ctx.fill();

  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 1.8 * st;
  drawRoundRect(ctx, cx - bw / 2, by, bw, bh, bh / 2);
  ctx.stroke();

  ctx.fillStyle = theme.id === "dokdo_unesco" ? "#fef08a" : theme.accentColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, cx, by + bh / 2 + 1 * st);

  // (2) 메인 타이틀 (두꺼운 화이트/네이비 아웃라인 + 드롭섀도우로 일러스트 위에서 선명하게)
  const titleY = isStrip ? 66 * s : 72 * s;
  const fontSize = isStrip ? Math.round(28 * s) : Math.round(44 * s);
  ctx.font = theme.titleFont.replace(/\d+px/, `${fontSize}px`);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.shadowColor = theme.id === "dokdo_unesco" ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.95)";
  ctx.shadowBlur = 12 * st;
  ctx.lineJoin = "round";
  ctx.lineWidth = 8 * st;
  ctx.strokeStyle = theme.titleStroke || "#ffffff";
  ctx.strokeText(theme.titleText, cx, titleY);

  ctx.shadowBlur = 0;
  ctx.fillStyle = theme.textColor;
  ctx.fillText(theme.titleText, cx, titleY);

  // 양옆 반짝이 스파클 포인트
  const titleHalfW = ctx.measureText(theme.titleText).width / 2;
  drawTwinkleStar(ctx, cx - titleHalfW - 22 * st, titleY - 6 * st, 11 * st, "#facc15");
  drawTwinkleStar(ctx, cx + titleHalfW + 22 * st, titleY - 6 * st, 11 * st, "#f472b6");

  // (3) 서브 슬로건
  const subY = isStrip ? 108 * s : 118 * s;
  ctx.font = `700 ${16 * st}px 'Pretendard', sans-serif`;
  ctx.lineWidth = 4 * st;
  ctx.strokeStyle = theme.id === "dokdo_unesco" ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.95)";
  ctx.strokeText(theme.subText, cx, subY);
  ctx.fillStyle = theme.subTextColor;
  ctx.fillText(theme.subText, cx, subY);

  ctx.restore();
}

// 3. 폴라로이드 & 하이틴 프레임 포토 슬롯 (실제 촬영 사진)
function drawPolaroidPhotoSlot(ctx, img, x, y, w, h, theme, idx, s) {
  ctx.save();
  const radius = 14 * s;
  const borderPad = 8 * s;

  // 부드러운 입체 그림자
  ctx.shadowColor = "rgba(15, 23, 42, 0.26)";
  ctx.shadowBlur = 18 * s;
  ctx.shadowOffsetY = 7 * s;

  // 폴라로이드 화이트 프레임 카드
  ctx.fillStyle = "#ffffff";
  drawRoundRect(ctx, x - borderPad, y - borderPad, w + borderPad * 2, h + borderPad * 2, radius + 4 * s);
  ctx.fill();

  // 파스텔 테두리 라인
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = theme.border || "#f9a8d4";
  ctx.lineWidth = 2.5 * s;
  drawRoundRect(ctx, x - borderPad, y - borderPad, w + borderPad * 2, h + borderPad * 2, radius + 4 * s);
  ctx.stroke();

  // 사진 Cover Fit 클리핑
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

  ctx.beginPath();
  drawRoundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();

  // 사진 우측 하단 감성 미니 캡션 스탬프
  ctx.save();
  const label = (theme.cutLabels && theme.cutLabels[idx]) || `CUT 0${idx + 1}`;
  ctx.font = `800 ${11 * s}px 'Montserrat', 'Pretendard', sans-serif`;
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 4 * s;
  ctx.fillText(label, x + w - 10 * s, y + h - 10 * s);
  ctx.restore();
}

// 4. 프리뷰 화면용 여고생 하이틴 감성 샘플 포토 슬롯
function drawKawaiiSampleSlot(ctx, x, y, w, h, theme, idx, s) {
  ctx.save();
  const radius = 14 * s;
  const borderPad = 8 * s;

  ctx.shadowColor = "rgba(15, 23, 42, 0.22)";
  ctx.shadowBlur = 16 * s;
  ctx.shadowOffsetY = 6 * s;

  ctx.fillStyle = "#ffffff";
  drawRoundRect(ctx, x - borderPad, y - borderPad, w + borderPad * 2, h + borderPad * 2, radius + 4 * s);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = theme.border || "#f9a8d4";
  ctx.lineWidth = 2.5 * s;
  drawRoundRect(ctx, x - borderPad, y - borderPad, w + borderPad * 2, h + borderPad * 2, radius + 4 * s);
  ctx.stroke();

  ctx.beginPath();
  drawRoundRect(ctx, x, y, w, h, radius);
  ctx.clip();

  // 하루필름/포토이즘 스튜디오 파스텔 조명 그라데이션
  const studioGrads = [
    ["#fdf2f8", "#fce7f3", "#fbcfe8"],
    ["#f0f9ff", "#e0f2fe", "#bae6fd"],
    ["#fefce8", "#fef3c7", "#fde68a"],
    ["#f5f3ff", "#ede9fe", "#ddd6fe"],
  ];
  const gCols = studioGrads[idx % 4];
  const sg = ctx.createLinearGradient(x, y, x + w, y + h);
  sg.addColorStop(0, gCols[0]);
  sg.addColorStop(0.5, gCols[1]);
  sg.addColorStop(1, gCols[2]);
  ctx.fillStyle = sg;
  ctx.fillRect(x, y, w, h);

  // 은은한 스튜디오 보케 원
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.beginPath();
  ctx.arc(x + w * 0.25, y + h * 0.28, w * 0.16, 0, Math.PI * 2);
  ctx.arc(x + w * 0.78, y + h * 0.72, w * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // 귀여운 하이틴 여고생 캐릭터 일러스트 실루엣 & 포즈 가이드
  const cx = x + w / 2;
  const cy = y + h * 0.46;
  drawCuteGirlAvatar(ctx, cx, cy, Math.min(w, h) * 0.28, idx);

  // 포즈 추천 캡션 필
  const poseNames = ["✨ 1컷 • 브이 포즈", "💕 2컷 • 손하트", "🌸 3컷 • 볼하트", "🎀 4컷 • 우정샷"];
  const pText = poseNames[idx];
  ctx.font = `700 ${17 * s}px 'Pretendard', sans-serif`;
  const pw = ctx.measureText(pText).width + 26 * s;
  const ph = 30 * s;
  const py = y + h - 42 * s;

  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  drawRoundRect(ctx, cx - pw / 2, py, pw, ph, ph / 2);
  ctx.fill();

  ctx.fillStyle = "#be185d";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(pText, cx, py + ph / 2 + 1 * s);

  ctx.restore();
}

// 프리뷰 슬롯 내 귀여운 여고생 일러스트 아이콘
function drawCuteGirlAvatar(ctx, cx, cy, r, idx) {
  ctx.save();
  // 뒷머리 (단발/긴머리)
  ctx.fillStyle = idx % 2 === 0 ? "#3f2e21" : "#5c4033";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.05, Math.PI * 0.85, Math.PI * 0.15, false);
  ctx.lineTo(cx + r * 0.95, cy + r * 0.95);
  ctx.quadraticCurveTo(cx, cy + r * 1.1, cx - r * 0.95, cy + r * 0.95);
  ctx.closePath();
  ctx.fill();

  // 교복 셔츠 & 리본 칼라
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy + r * 1.18, r * 0.72, Math.PI, 0, false);
  ctx.fill();
  ctx.fillStyle = "#f43f5e";
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.72);
  ctx.lineTo(cx - r * 0.22, cy + r * 0.92);
  ctx.lineTo(cx + r * 0.22, cy + r * 0.92);
  ctx.closePath();
  ctx.fill();

  // 얼굴
  ctx.fillStyle = "#ffe4e1";
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.05, r * 0.74, 0, Math.PI * 2);
  ctx.fill();

  // 앞머리
  ctx.fillStyle = idx % 2 === 0 ? "#3f2e21" : "#5c4033";
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.05, r * 0.76, Math.PI, 0, false);
  ctx.fill();

  // 발그레한 볼터치
  ctx.fillStyle = "rgba(244, 114, 182, 0.48)";
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.36, cy + r * 0.16, r * 0.15, r * 0.09, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + r * 0.36, cy + r * 0.16, r * 0.15, r * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  // 웃는 눈매 & 미소
  ctx.strokeStyle = "#3f2e21";
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx - r * 0.26, cy + r * 0.06, r * 0.12, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + r * 0.26, cy + r * 0.06, r * 0.12, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  ctx.strokeStyle = "#e11d48";
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.18, r * 0.14, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  // 머리 위 귀여운 리본/하트 포인트
  drawGlossy3DHeart(ctx, cx + r * 0.65, cy - r * 0.58, r * 0.28, "#f472b6");
  ctx.restore();
}

// 4. 여고생 다꾸(다이어리 꾸미기) 오버레이 아트워크 (마스킹테이프, 리본, 3D 하트, 진주)
function drawHighTeenDecoOverlays(ctx, theme, colX, W, H, padX, topMargin, photoW, photoH, gapX, gapY, s, isStrip) {
  ctx.save();
  const cx = colX + W / 2;

  if (!isStrip) {
    // (1) 상단 좌/우 사진 코너 파스텔 마스킹 테이프
    drawPastelMaskingTape(ctx, colX + padX + 36 * s, topMargin - 4 * s, 92 * s, 22 * s, -0.22, theme.tapeColor);
    drawPastelMaskingTape(ctx, colX + W - padX - 36 * s, topMargin - 4 * s, 92 * s, 22 * s, 0.22, theme.tapeColor);

    // (2) 2x2 사진 교차점 중앙 귀여운 새틴 리본 & 보석 브로치
    const gridCenterY = topMargin + photoH + gapY / 2;
    drawSatinRibbonBow(ctx, cx, gridCenterY, 34 * s, theme.ribbonColor || "#f472b6");

    // (3) 사진 모서리 통통한 3D 하트 & 진주 & 무궁화/봄꽃 스티커
    drawGlossy3DHeart(ctx, colX + padX - 8 * s, topMargin + photoH * 0.5, 22 * s, "#f472b6");
    drawGlossy3DHeart(ctx, colX + W - padX + 8 * s, topMargin + photoH * 1.5 + gapY, 22 * s, "#fb7185");
    drawPearlCluster(ctx, colX + W - padX + 4 * s, topMargin + 38 * s, 7 * s);
    drawPearlCluster(ctx, colX + padX - 4 * s, topMargin + photoH * 2 + gapY - 24 * s, 7 * s);

    // (4) 하단 정보 카드 상단 좌/우 귀여운 리본 & 하트 포인트
    drawSatinRibbonBow(ctx, colX + padX + 36 * s, 1472 * s, 22 * s, theme.ribbonColor || "#f472b6");
    drawGlossy3DHeart(ctx, colX + W - padX - 36 * s, 1472 * s, 18 * s, "#f472b6");
  } else {
    // 스트립 모드용 아기자기한 리본 & 마스킹테이프
    const st = s * 0.72;
    drawPastelMaskingTape(ctx, cx, topMargin - 4 * s, 76 * st, 18 * st, -0.06, theme.tapeColor);
    drawSatinRibbonBow(ctx, colX + padX + 10 * st, topMargin + photoH * 2 + gapY * 1.5, 22 * st, theme.ribbonColor || "#f472b6");
    drawGlossy3DHeart(ctx, colX + W - padX - 8 * st, topMargin + photoH + gapY * 0.5, 18 * st, "#f472b6");
  }

  ctx.restore();
}

// 5. 하단 감성 브랜딩 (투박한 사각 박스를 완전히 제거하고, 일러스트와 자연스럽게 어우러지는 하루필름/포토이즘 감성 디자인)
function drawBottomOrganizedInfo(ctx, theme, colX, W, H, dateStr, s, isStrip) {
  ctx.save();
  const cx = colX + W / 2;
  const st = isStrip ? s * 0.72 : s;
  const isNight = theme.id === "dokdo_unesco";

  // 1. 투박한 사각 박스 대신, 일러스트가 그대로 드러나면서 텍스트 가독성을 높여주는 부드러운 빛무리(미스트)
  const mistGrad = ctx.createLinearGradient(0, 1450 * s, 0, 1800 * s);
  if (isNight) {
    mistGrad.addColorStop(0, "rgba(15, 23, 42, 0)");
    mistGrad.addColorStop(0.3, "rgba(15, 23, 42, 0.45)");
    mistGrad.addColorStop(1, "rgba(15, 23, 42, 0.75)");
  } else {
    mistGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
    mistGrad.addColorStop(0.25, "rgba(255, 255, 255, 0.35)");
    mistGrad.addColorStop(0.65, "rgba(255, 255, 255, 0.58)");
    mistGrad.addColorStop(1, "rgba(255, 255, 255, 0.75)");
  }
  ctx.fillStyle = mistGrad;
  ctx.fillRect(colX, 1450 * s, W, 350 * s);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 2. [Tag] 여고생 감성 미니 스티커 캡슐 태그
  const badgeText = theme.category === "dokdo" ? "✦ 10.25 독도의 날 ✦" : "✦ 5.21 세계 문화 다양성의 날 ✦";
  ctx.font = `800 ${14.5 * st}px 'Pretendard', sans-serif`;
  const bw = ctx.measureText(badgeText).width + (isStrip ? 28 * st : 36 * st);
  const bh = (isStrip ? 24 : 28) * st;
  const by = (isStrip ? 1485 : 1488) * s;

  // 글로시 캡슐 스티커 배경
  ctx.save();
  ctx.shadowColor = isNight ? "rgba(0,0,0,0.5)" : "rgba(244, 114, 182, 0.35)";
  ctx.shadowBlur = 10 * st;
  ctx.shadowOffsetY = 3 * st;

  ctx.fillStyle = isNight ? "rgba(30, 27, 75, 0.88)" : "rgba(255, 255, 255, 0.95)";
  drawRoundRect(ctx, cx - bw / 2, by, bw, bh, bh / 2);
  ctx.fill();

  ctx.strokeStyle = isNight ? "#c084fc" : (theme.border || "#f472b6");
  ctx.lineWidth = 1.8 * st;
  drawRoundRect(ctx, cx - bw / 2, by, bw, bh, bh / 2);
  ctx.stroke();

  // 캡슐 상단 윤광 하이라이트
  ctx.beginPath();
  drawRoundRect(ctx, cx - bw / 2 + 4 * st, by + 2 * st, bw - 8 * st, bh / 2 - 2 * st, (bh / 2 - 2 * st) / 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = isNight ? "#fef08a" : (theme.accentColor || "#e11d48");
  ctx.fillText(badgeText, cx, by + bh / 2 + 0.5 * st);

  // 3. [Title] 포토이즘/하루필름 스타일 감성 메인 레터링 타이틀
  const titleY = (isStrip ? 1545 : 1552) * s;
  const titleFontSize = Math.round((isStrip ? 25 : 36) * s);
  ctx.font = `800 ${titleFontSize}px 'Gowun Batang', 'Jua', serif`;

  // 부드러운 화이트 외곽선 + 드롭섀도우로 일러스트 위에서 또렷하게 반짝임
  ctx.save();
  ctx.shadowColor = isNight ? "rgba(0,0,0,0.85)" : "rgba(255, 255, 255, 0.95)";
  ctx.shadowBlur = 12 * st;
  ctx.lineJoin = "round";
  ctx.lineWidth = (isStrip ? 6 : 8) * st;
  ctx.strokeStyle = isNight ? "rgba(15, 23, 42, 0.92)" : "#ffffff";
  ctx.strokeText(theme.titleText, cx, titleY);

  ctx.shadowBlur = 0;
  ctx.fillStyle = isNight ? "#fef08a" : (theme.textColor || "#0f172a");
  ctx.fillText(theme.titleText, cx, titleY);
  ctx.restore();

  // 타이틀 양옆 반짝이는 스파클 & 하트 포인트
  const titleHalfW = ctx.measureText(theme.titleText).width / 2;
  const starDist = titleHalfW + (isStrip ? 20 : 26) * st;
  drawTwinkleStar(ctx, cx - starDist, titleY - 3 * st, (isStrip ? 10 : 13) * st, "#facc15");
  drawTwinkleStar(ctx, cx + starDist, titleY - 3 * st, (isStrip ? 10 : 13) * st, "#f472b6");

  // 4. [Sub] 감성 인용구 슬로건
  const subY = (isStrip ? 1585 : 1598) * s;
  ctx.font = `700 ${(isStrip ? 13 : 16) * st}px 'Gowun Batang', 'Pretendard', sans-serif`;
  ctx.save();
  ctx.lineWidth = 4 * st;
  ctx.strokeStyle = isNight ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.95)";
  ctx.strokeText(`“${theme.subText}”`, cx, subY);
  ctx.fillStyle = isNight ? "#f5d0fe" : (theme.subTextColor || "#be185d");
  ctx.fillText(`“${theme.subText}”`, cx, subY);
  ctx.restore();

  // 5. [Divider] 러블리 도트 & 하트 포인트 라인
  const sepY = (isStrip ? 1622 : 1642) * s;
  const sepW = isStrip ? 260 * s : 480 * s;
  ctx.save();
  ctx.strokeStyle = isNight ? "rgba(255, 255, 255, 0.25)" : "rgba(244, 114, 182, 0.35)";
  ctx.lineWidth = 1.5 * s;
  ctx.setLineDash([4 * s, 4 * s]);
  ctx.beginPath();
  ctx.moveTo(cx - sepW / 2, sepY);
  ctx.lineTo(cx + sepW / 2, sepY);
  ctx.stroke();
  ctx.restore();

  // 구분선 중앙 미니 입체 하트
  drawGlossy3DHeart(ctx, cx, sepY, (isStrip ? 10 : 13) * st, theme.accentColor || "#ec4899");

  // 6. [Club] 학교명 • 동아리 시그니처 (세련된 하이틴 브랜드 감성)
  const clubY = (isStrip ? 1664 : 1688) * s;
  const clubFontSize = Math.round((isStrip ? 18 : 25) * s);
  ctx.font = `800 ${clubFontSize}px 'Gowun Batang', 'Pretendard', serif`;

  const clubHeader = `합천여자고등학교   ♡   ${theme.clubSub}`;
  ctx.save();
  ctx.lineWidth = 5 * st;
  ctx.strokeStyle = isNight ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.95)";
  ctx.strokeText(clubHeader, cx, clubY);
  ctx.fillStyle = isNight ? "#ffffff" : "#0f172a";
  ctx.fillText(clubHeader, cx, clubY);
  ctx.restore();

  const headerHalfW = ctx.measureText(clubHeader).width / 2;
  const iconDist = headerHalfW + (isStrip ? 20 : 26) * st;
  if (theme.category === "dokdo") {
    drawMiniUnescoIcon(ctx, cx - iconDist, clubY - 1 * st, (isStrip ? 12 : 15) * st, isNight ? "#fef08a" : (theme.accentColor || "#e11d48"));
    drawMiniMugunghwaPin(ctx, cx + iconDist, clubY - 1 * st, (isStrip ? 11 : 14) * st);
  } else {
    drawGlossy3DHeart(ctx, cx - iconDist, clubY - 1 * st, (isStrip ? 11 : 14) * st, "#ec4899");
    drawGlossy3DHeart(ctx, cx + iconDist, clubY - 1 * st, (isStrip ? 11 : 14) * st, "#ec4899");
  }

  // 7. [Date & Motto] 레트로 필름 카메라 스타일 날짜 스탬프
  const footerY = (isStrip ? 1704 : 1734) * s;
  ctx.font = `700 ${(isStrip ? 12 : 14.5) * st}px 'Montserrat', 'Pretendard', sans-serif`;
  const footerText = `DATE. ${dateStr}   •   ${theme.clubMotto}`;
  ctx.save();
  ctx.lineWidth = 4 * st;
  ctx.strokeStyle = isNight ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.95)";
  ctx.strokeText(footerText, cx, footerY);
  ctx.fillStyle = isNight ? "#cbd5e1" : "#475569";
  ctx.fillText(footerText, cx, footerY);
  ctx.restore();

  // 8. 하단 좌/우 몽환적인 진주 & 3D 하트 데코
  if (!isStrip) {
    drawPearlCluster(ctx, cx - sepW / 2 - 20 * s, sepY, 6 * s);
    drawPearlCluster(ctx, cx + sepW / 2 + 20 * s, sepY, 6 * s);
    drawGlossy3DHeart(ctx, colX + 80 * s, 1720 * s, 16 * s, "#f472b6");
    drawGlossy3DHeart(ctx, colX + W - 80 * s, 1720 * s, 16 * s, "#fb7185");
  }

  ctx.restore();
}

// ====================================================
// 🎀 하이틴 다꾸 스티커 & 일러스트 컴포넌트 함수들
// ====================================================

// 1. 파스텔 마스킹 테이프 (와시 테이프)
function drawPastelMaskingTape(ctx, cx, cy, w, h, angle, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = color || "rgba(251, 207, 232, 0.82)";
  ctx.fillRect(-w / 2, -h / 2, w, h);

  // 귀여운 도트 무늬
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  for (let x = -w / 2 + 12; x < w / 2 - 8; x += 18) {
    ctx.beginPath();
    ctx.arc(x, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// 2. 입체 새틴 리본 브로치 🎀
function drawSatinRibbonBow(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowColor = "rgba(0,0,0,0.22)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = color;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(1.5, size * 0.08);

  // 왼쪽 리본 날개
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.9, -size * 0.75, -size * 1.15, size * 0.55, 0, size * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 오른쪽 리본 날개
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.9, -size * 0.75, size * 1.15, size * 0.55, 0, size * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 아래로 늘어지는 리본 꼬리
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, size * 0.1);
  ctx.quadraticCurveTo(-size * 0.45, size * 0.75, -size * 0.65, size * 0.95);
  ctx.lineTo(-size * 0.28, size * 0.88);
  ctx.quadraticCurveTo(-size * 0.15, size * 0.5, 0, size * 0.15);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(size * 0.1, size * 0.1);
  ctx.quadraticCurveTo(size * 0.45, size * 0.75, size * 0.65, size * 0.95);
  ctx.lineTo(size * 0.28, size * 0.88);
  ctx.quadraticCurveTo(size * 0.15, size * 0.5, 0, size * 0.15);
  ctx.fill();
  ctx.stroke();

  // 중앙 진주 하트 매듭
  ctx.fillStyle = "#fff1f2";
  ctx.beginPath();
  ctx.arc(0, size * 0.04, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 3. 통통한 3D 글로시 하트 스티커 💕
function drawGlossy3DHeart(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = color || "#f472b6";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(1.5, size * 0.12);

  ctx.beginPath();
  ctx.moveTo(0, size * 0.35);
  ctx.bezierCurveTo(-size * 0.85, -size * 0.2, -size * 0.55, -size * 0.85, 0, -size * 0.35);
  ctx.bezierCurveTo(size * 0.55, -size * 0.85, size * 0.85, -size * 0.2, 0, size * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 하이라이트 윤광
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.beginPath();
  ctx.ellipse(-size * 0.24, -size * 0.28, size * 0.13, size * 0.07, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 4. 진주 파츠 클러스터
function drawPearlCluster(ctx, cx, cy, r) {
  ctx.save();
  const offsets = [
    [0, 0, r],
    [-r * 1.4, r * 0.9, r * 0.75],
    [r * 1.3, -r * 0.8, r * 0.7],
  ];
  offsets.forEach(([ox, oy, pr]) => {
    const g = ctx.createRadialGradient(cx + ox - pr * 0.3, cy + oy - pr * 0.3, pr * 0.1, cx + ox, cy + oy, pr);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.7, "#fdf2f8");
    g.addColorStop(1, "#fbcfe8");
    ctx.fillStyle = g;
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(cx + ox, cy + oy, pr, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// 5. 반짝이는 4각 별 스파클 ✨
function drawTwinkleStar(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color || "#fef08a";
  ctx.shadowColor = color || "#fef08a";
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(0, 0, size, 0);
  ctx.quadraticCurveTo(0, 0, 0, size);
  ctx.quadraticCurveTo(0, 0, -size, 0);
  ctx.quadraticCurveTo(0, 0, 0, -size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 6. 1번 포스터 모티프: 독도 표지석 다꾸 스티커 ('독도, 지금도 그리고 영원히, 우리의 땅')
function drawDokdoPlaqueSticker(ctx, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.04);

  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 10 * s;
  ctx.shadowOffsetY = 4 * s;

  // 귀여운 화이트 스티커 테두리 + 자연석 질감 배지
  const rx = 108 * s;
  const ry = 40 * s;
  ctx.fillStyle = "#57534e";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4 * s;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#fef08a";
  ctx.font = `700 ${14 * s}px 'Gowun Batang', serif`;
  ctx.textAlign = "center";
  ctx.fillText("독도, 지금도 그리고", 0, -6 * s);
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${15 * s}px 'Gowun Batang', serif`;
  ctx.fillText("영원히, 우리의 땅 🇰🇷", 0, 14 * s);

  drawMiniMugunghwaPin(ctx, -rx + 12 * s, -10 * s, 16 * s);
  ctx.restore();
}

// 7. 감성 인용구 태그 스티커 ('“독도는 오늘도 아름답습니다.”')
function drawAestheticQuoteTag(ctx, cx, cy, text, bg, textCol, borderCol, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.03);

  ctx.font = `700 ${15.5 * s}px 'Gowun Batang', serif`;
  const tw = ctx.measureText(text).width + 36 * s;
  const th = 42 * s;

  ctx.shadowColor = "rgba(0,0,0,0.22)";
  ctx.shadowBlur = 8 * s;
  ctx.shadowOffsetY = 3 * s;

  ctx.fillStyle = bg;
  drawRoundRect(ctx, -tw / 2, -th / 2, tw, th, th / 2);
  ctx.fill();

  ctx.strokeStyle = borderCol;
  ctx.lineWidth = 2.5 * s;
  drawRoundRect(ctx, -tw / 2, -th / 2, tw, th, th / 2);
  ctx.stroke();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = textCol;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 1 * s);
  ctx.restore();
}

// 8. 2번 포스터 모티프: 나무 푯말 다꾸 스티커 ('다른 우리가 만드는 더 아름다운 세상 ♥')
function drawCuteSignpostSticker(ctx, cx, cy, lines, s, tilt = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);

  const bw = 196 * s;
  const bh = 62 * s;

  ctx.shadowColor = "rgba(0,0,0,0.22)";
  ctx.shadowBlur = 8 * s;
  ctx.shadowOffsetY = 3 * s;

  // 나무 기둥
  ctx.fillStyle = "#b45309";
  ctx.fillRect(-7 * s, bh / 2 - 4 * s, 14 * s, 22 * s);

  // 크림 우드 보드 + 화이트 다꾸 스티커 라인
  ctx.fillStyle = "#fef3c7";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4 * s;
  drawRoundRect(ctx, -bw / 2, -bh / 2, bw, bh, 12 * s);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 1.8 * s;
  drawRoundRect(ctx, -bw / 2 + 3 * s, -bh / 2 + 3 * s, bw - 6 * s, bh - 6 * s, 9 * s);
  ctx.stroke();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#78350f";
  ctx.font = `700 ${14 * s}px 'Pretendard', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(lines[0], 0, -7 * s);

  ctx.fillStyle = "#db2777";
  ctx.font = `800 ${14.5 * s}px 'Pretendard', sans-serif`;
  ctx.fillText(lines[1], 0, 14 * s);

  ctx.restore();
}

// 9. 미니 무궁화 브로치 아이콘
function drawMiniMugunghwaPin(ctx, cx, cy, r) {
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    ctx.fillStyle = i % 2 === 0 ? "#f9a8d4" : "#f472b6";
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r * 0.42, cy + Math.sin(a) * r * 0.42, r * 0.48, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#be123c";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 10. 미니 UNESCO 신전 아이콘
function drawMiniUnescoIcon(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, size * 0.12);

  // 지붕 삼각형
  ctx.beginPath();
  ctx.moveTo(cx - size, cy - size * 0.35);
  ctx.lineTo(cx, cy - size * 0.85);
  ctx.lineTo(cx + size, cy - size * 0.35);
  ctx.closePath();
  ctx.stroke();

  // 기둥 4개
  for (let i = -1.5; i <= 1.5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx + i * size * 0.45, cy - size * 0.3);
    ctx.lineTo(cx + i * size * 0.45, cy + size * 0.55);
    ctx.stroke();
  }

  // 바닥 받침
  ctx.fillRect(cx - size, cy + size * 0.55, size * 2, size * 0.16);
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

// 📱 태블릿 Epson Smart Panel 앱 연동 인쇄
async function printViaEpsonApp() {
  if (!state.finalImageBase64) {
    alert("인쇄할 사진이 준비되지 않았습니다.");
    return;
  }

  // 1. 우선 태블릿 갤러리에 4x6 고화질 사진 저장
  savePhotoToDevice();

  const isGrid = state.layoutMode === "grid";
  const sizeName = isGrid ? "4x6인치_엽서형" : "4x6인치_스트립";
  const fileName = `청춘네컷_${sizeName}_${Date.now()}.jpg`;

  try {
    const res = await fetch(state.finalImageBase64);
    const blob = await res.blob();
    const file = new File([blob], fileName, { type: "image/jpeg" });

    // 2. 태블릿 Web Share API 지원 시 (공유 창에서 Epson Smart Panel 선택)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Epson Smart Panel 4×6 인쇄",
          text: "Epson Smart Panel 앱을 선택하여 4×6인치(10×15cm)로 인쇄하세요!",
        });
        showToast("📱 Epson Smart Panel 앱을 선택해 인쇄를 완료하세요!");
        return;
      } catch (shareErr) {
        if (shareErr.name === "AbortError") {
          // 사용자가 공유 창을 닫은 경우 가이드 모달 띄우기
          openEpsonGuideModal();
          return;
        }
        console.warn("Web Share 오류:", shareErr);
      }
    }

    // 3. Web Share 미지원 브라우저 또는 PC: 가이드 모달 열기
    openEpsonGuideModal();
  } catch (err) {
    console.error("엡손 인쇄 처리 실패:", err);
    openEpsonGuideModal();
  }
}

// 🚀 Epson Smart Panel 앱 직접 실행
function launchEpsonSmartPanelApp() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  showToast("🚀 Epson Smart Panel 앱을 실행합니다...");

  if (isAndroid) {
    // 안드로이드 패키지명: com.epson.epsonsmart
    window.location.href =
      "intent://#Intent;package=com.epson.epsonsmart;scheme=epsonsmart;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.epson.epsonsmart;end;";
  } else if (isIOS) {
    window.location.href = "https://apps.apple.com/app/epson-smart-panel/id1477796092";
  } else {
    window.open("https://www.epson.co.kr/epson-smart-panel", "_blank");
  }
}

// 💾 태블릿 / 기기에 사진 직접 저장
function savePhotoToDevice() {
  if (!state.finalImageBase64) return;
  const isGrid = state.layoutMode === "grid";
  const sizeName = isGrid ? "4x6인치_엽서형" : "4x6인치_스트립";
  const link = document.createElement("a");
  link.href = state.finalImageBase64;
  link.download = `청춘네컷_${sizeName}_${Date.now()}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("💾 4×6인치 사진이 갤러리에 저장되었습니다!\nEpson Smart Panel 앱의 [사진 인쇄]에서 출력하세요.");
}

// 📱 Epson Smart Panel 앱 안내 모달 제어
function openEpsonGuideModal() {
  const modal = document.getElementById("modal-epson-guide");
  if (modal) {
    modal.classList.remove("hidden");
    if (window.lucide) lucide.createIcons();
  }
}

function closeEpsonGuideModal() {
  const modal = document.getElementById("modal-epson-guide");
  if (modal) {
    modal.classList.add("hidden");
  }
}

function handleEpsonGuideOverlayClick(event) {
  if (event.target && event.target.id === "modal-epson-guide") {
    closeEpsonGuideModal();
  }
}

// 🔔 토스트 알림 메시지
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("app-toast");
  if (!toast) return;

  toast.innerText = message;
  toast.classList.remove("hidden");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3200);
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

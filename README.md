# 📸 학교 축제 인생네컷 포토부스 시스템 (Life 4-Cut Photobooth)

태블릿/데스크탑과 포토 프린터(Epson L15150 / Canon Selphy 등)를 활용하여 학교 축제, 졸업식, 입학식 등 다양한 행사에서 운영할 수 있는 풀스택 인생네컷 시스템입니다.

---

## 🌟 주요 기능 및 특징

1. **📱 멀티 디바이스 모드 지원**:
   - **태블릿 모드 (2×2 엽서형)**: 4×6인치 엽서 비율에 4장의 사진이 2×2 그리드로 배치되는 인기 포토카드 디자인
   - **데스크탑 모드 (4×1 스트립형 × 2줄)**: 4×6인치 인쇄 후 가운데를 잘라 2명이 나눠가질 수 있는 전통 인생네컷 듀얼 스트립
2. **🎨 10가지 고퀄리티 테마 프레임 & 스티커**:
   - 졸업식 (Graduation) 🎓
   - 입학식 (Entrance) 🌸
   - 학교 축제 (Festival) 🎪
   - 생일 축하 (Birthday) 🎂
   - Y2K 레트로 픽셀 (Y2K Retro) 👾
   - 하이틴 팝 (High Teen) 💖
   - 빈티지 필름 (Vintage Film) 🎞️
   - 네온 나이트 (Neon Cyber) ⚡
   - 클래식 화이트 (Classic White) 🤍
   - 시크 블랙 (Chic Black) 🖤
3. **🪄 10가지 감성 컬러 필터**:
   - 원본 (Original), 내추럴 화사 (Warm Tone), 뽀샤시 (Cool Tone), 흑백 (Classic B&W), 빈티지 세피아 (Sepia), 레트로 필름 (Retro), 비비드 (Vivid), 파스텔 (Pastel), 사이버 네온 (Cyber), 무디 (Moody)
4. **👁️ 실시간 4×6 프레임 라이브 미리보기**:
   - 스타일 선택 화면에서 프레임과 필터를 변경할 때마다 실제 인쇄될 결과물을 실시간으로 프리뷰
5. **📸 자동 4컷 촬영 & 플래시 효과**:
   - 3초 카운트다운 타이머, 경쾌한 플래시 효과 및 촬영 진행도 표시
6. **🖨️ 무인 자동 인쇄 (Epson L15150 / Canon 등)**:
   - Windows PowerShell .NET 인쇄 엔진 (`print-photo.ps1`) 연동으로 4×6인치 (Postcard / 100×148mm) 여백 없음(Borderless) 자동 출력
7. **📲 스마트폰 QR 코드 실시간 다운로드**:
   - 촬영 완료 화면에서 스마트폰으로 QR 코드를 스캔하면 고화질 원본 사진을 즉시 다운로드 가능

---

## 🚀 빠른 시작 가이드

### 1. 의존성 패키지 설치
```bash
cd school-photobooth
npm install
```

### 2. 환경 설정 (.env)
`.env.example` 파일을 복사하여 `.env` 파일을 생성하거나 수정합니다:
```env
PORT=3000
SCHOOL_NAME=2026 청춘 학교 축제
EVENT_SUBTITLE=소중한 추억을 남기는 인생네컷

# 프린터 이름 (제어판 > 프린터 및 스캐너에 등록된 이름)
PRINTER_NAME=EPSON L15150 Series
AUTO_PRINT=true
```

### 3. 서버 실행
```bash
npm start
```

---

## 📱 태블릿 / 모바일 접속 가이드

- **로컬 네트워크 접속**: 동일한 Wi-Fi에 연결된 기기에서 `http://[노트북IP]:3000` 접속
- **HTTPS 보안 터널 접속 (카메라 권한 간편 허용)**:
  ```bash
  npx cloudflared tunnel --url http://localhost:3000
  ```
  생성된 `https://xxx.trycloudflare.com` 주소로 태블릿 브라우저에서 접속 시 별도 설정 없이 카메라 권한이 즉시 허용됩니다.

---

## 🖨️ 프린터 권장 설정 (Epson L15150)

1. **용지 크기**: 4×6 in (100 × 148 mm / 엽서)
2. **용지 종류**: 프리미엄 광택 인화지 (Photo Paper Glossy)
3. **인쇄 옵션**: 여백 없음 (Borderless) 활성화

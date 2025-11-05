# GIS 타일맵 뷰어

Next.js와 OpenLayers를 사용한 웹 기반 GIS 타일맵 뷰어 프로젝트입니다.

## 📖 프로젝트 소개

이 프로젝트는 커스텀 타일맵 서버의 지도를 웹 브라우저에서 표시하고 다양한 GIS 기능을 제공하는 뷰어입니다.

### 주요 기능

- 🗺️ **타일맵 표출**: XYZ 형식의 래스터 타일 지도 표시
- 🎯 **지도 컨트롤**: 줌 인/아웃, 홈 버튼, 회전
- 📂 **레이어 관리**: 레이어 켜기/끄기 토글
- 📍 **실시간 좌표 표시**: 마우스 위치의 경도/위도 표시
- 📏 **축척 표시**: 현재 지도의 축척 정보
- 🧭 **북쪽 방향**: 지도 회전 시 북쪽 방향 표시
- 🖥️ **풀스크린 모드**: 전체화면으로 지도 보기

## 🚀 시작하기

### 필수 요구사항

- Node.js 20.x 이상
- pnpm 8.x 이상
- WSL2 (Windows 사용자)

### 설치

```bash
# 저장소 클론
git clone https://github.com/LEEJINKYU-TELOS/gis.git
cd gis

# 의존성 설치
pnpm install
```

### 개발 서버 실행

```bash
# 개발 서버 시작
pnpm dev
```

브라우저에서 `http://localhost:3000`을 열어 지도를 확인하세요.

### 외부 네트워크 접근 (선택사항)

WSL2 환경에서 다른 기기에서 접속하려면 [WSL 포트 포워딩 가이드](./docs/WSL_PORT_FORWARDING.md)를 참고하세요.

## 🏗️ 기술 스택

### 프론트엔드
- **Next.js 15.5.6**: React 프레임워크
- **React 19.2.0**: UI 라이브러리
- **TypeScript 5.x**: 타입 안정성
- **Tailwind CSS 4.x**: 스타일링

### GIS 라이브러리
- **OpenLayers 10.6.1**: 오픈소스 지도 라이브러리
  - 타일 레이어 관리
  - 벡터 레이어 지원
  - 다양한 좌표계 지원

### 개발 도구
- **pnpm**: 빠르고 효율적인 패키지 매니저
- **ESLint**: 코드 품질 관리

## 📂 프로젝트 구조

```
gis/
├── docs/                          # 문서
│   ├── REQUIREMENTS.md            # 기능 정의서
│   ├── WSL_PORT_FORWARDING.md     # 포트 포워딩 가이드
│   ├── GIS_BASICS.md              # GIS 기본 개념 (학습용)
│   ├── OPENLAYERS_GUIDE.md        # OpenLayers 가이드 (학습용)
│   └── COMPONENT_GUIDE.md         # 컴포넌트 상세 설명 (학습용)
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx               # 메인 페이지
│   │   ├── layout.tsx             # 레이아웃
│   │   └── globals.css            # 전역 스타일
│   │
│   ├── components/                # React 컴포넌트
│   │   └── Map/                   # 지도 관련 컴포넌트
│   │       ├── MapContainer.tsx   # 지도 컨테이너 (핵심)
│   │       ├── ZoomControl.tsx    # 줌 컨트롤 버튼
│   │       ├── MapInfo.tsx        # 좌표/줌 정보 패널
│   │       ├── LayerControl.tsx   # 레이어 토글 패널
│   │       ├── NorthArrow.tsx     # 북쪽 방향 표시
│   │       └── FullscreenControl.tsx  # 풀스크린 버튼
│   │
│   ├── lib/                       # 유틸리티 및 설정
│   │   └── map/
│   │       └── mapConfig.ts       # 지도 설정 (타일 URL 등)
│   │
│   └── types/                     # TypeScript 타입 정의
│       └── map.ts                 # 지도 관련 타입
│
├── public/                        # 정적 파일
├── package.json                   # 프로젝트 설정
├── tsconfig.json                  # TypeScript 설정
├── tailwind.config.ts             # Tailwind 설정
└── next.config.ts                 # Next.js 설정
```

## 🎓 학습 자료

GIS와 OpenLayers가 처음이신가요? 다음 문서들을 순서대로 읽어보세요:

1. **[GIS 기본 개념](./docs/GIS_BASICS.md)** ⭐ 시작은 여기서!
   - GIS가 무엇인지
   - 타일맵의 작동 원리
   - 좌표계와 줌 레벨 이해하기

2. **[OpenLayers 가이드](./docs/OPENLAYERS_GUIDE.md)**
   - OpenLayers 핵심 개념
   - Map, View, Layer 구조
   - 실습 예제

3. **[컴포넌트 상세 가이드](./docs/COMPONENT_GUIDE.md)**
   - 각 컴포넌트의 역할과 구조
   - 코드 흐름 이해하기
   - 커스터마이징 방법

## ⚙️ 설정

### 타일맵 서버 변경

타일맵 소스를 변경하려면 `src/lib/map/mapConfig.ts` 파일을 수정하세요:

```typescript
export const MAP_CONFIG = {
  // 타일 서버 URL (현재: OpenStreetMap)
  tileUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',

  // 실제 타일 서버로 변경
  // tileUrl: 'http://192.168.0.140:8082/tiles/SD/L{z}/{x}/{y}.png',

  // 초기 뷰 설정
  initialView: {
    center: [127.5, 36.5], // [경도, 위도]
    zoom: 7,
  },

  // 줌 레벨 제한
  minZoom: 6,
  maxZoom: 19,
};
```

### 초기 지도 위치 변경

원하는 위치로 지도 중심을 변경할 수 있습니다:

```typescript
initialView: {
  center: [126.9784, 37.5665], // 서울 시청
  zoom: 12,
},
```

좌표는 [경도, 위도] 순서입니다. (⚠️ 위도, 경도 아님!)

## 🎨 UI 커스터마이징

### 컨트롤 버튼 위치 변경

`src/components/Map/MapContainer.tsx`에서 컨트롤 위치를 조정할 수 있습니다:

```tsx
{/* 우측 상단 컨트롤 그룹 */}
<div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
  {/* top-4, right-4를 변경하여 위치 조정 */}
```

### 다크모드 스타일

Tailwind의 `dark:` 클래스로 다크모드를 지원합니다:

```tsx
className="bg-white dark:bg-zinc-800"
```

## 🧪 빌드 및 배포

### 프로덕션 빌드

```bash
# 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

### 정적 사이트 생성 (선택사항)

지도 데이터가 정적인 경우 Next.js의 Static Export 사용 가능:

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
};
```

## 📚 참고 자료

### 공식 문서
- [Next.js 문서](https://nextjs.org/docs)
- [OpenLayers 문서](https://openlayers.org/)
- [Tailwind CSS 문서](https://tailwindcss.com/)

### GIS 관련
- [OpenStreetMap Wiki](https://wiki.openstreetmap.org/)
- [Slippy Map Tilenames](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames) - 타일 좌표 체계

### 고급 기능 구현 예정
- [ ] shadcn/ui 통합 (UI 컴포넌트 라이브러리)
- [ ] 마커 레이어 (GeoJSON)
- [ ] 클러스터링
- [ ] 도로 네트워크 (벡터 타일)
- [ ] 측정 도구
- [ ] 검색 기능

## 🐛 트러블슈팅

### 지도가 표시되지 않아요

1. **개발 서버가 실행 중인지 확인**
   ```bash
   pnpm dev
   ```

2. **타일 URL이 올바른지 확인**
   - 브라우저 개발자 도구(F12) > Network 탭에서 타일 요청 확인
   - 404 에러가 나면 타일 서버 URL이 잘못되었거나 서버가 다운된 것

3. **CORS 에러**
   - 타일 서버에서 CORS 설정 필요
   - 또는 `crossOrigin: 'anonymous'` 옵션 확인

### WSL2에서 외부 접속이 안 돼요

[WSL 포트 포워딩 가이드](./docs/WSL_PORT_FORWARDING.md)를 참고하세요.

### 줌이 너무 빨라요/느려요

`MapContainer.tsx`에서 줌 애니메이션 속도 조정:

```typescript
view.animate({ zoom: currentZoom + 1, duration: 250 }); // duration 변경
```

## 🤝 기여

이슈와 PR은 언제나 환영합니다!

## 📝 라이선스

MIT License

## 👤 작성자

**이진규 (LEE JINKYU)**
- GitHub: [@LEEJINKYU-TELOS](https://github.com/LEEJINKYU-TELOS)

---

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**

# 컴포넌트 구조 상세 가이드

프로젝트의 모든 컴포넌트를 분석하고 어떻게 동작하는지 설명합니다.

---

## 목차

1. [전체 구조 개요](#1-전체-구조-개요)
2. [MapContainer - 핵심 컴포넌트](#2-mapcontainer---핵심-컴포넌트)
3. [UI 컴포넌트들](#3-ui-컴포넌트들)
4. [설정 파일](#4-설정-파일)
5. [커스터마이징 가이드](#5-커스터마이징-가이드)

---

## 1. 전체 구조 개요

### 1.1 컴포넌트 트리

```
page.tsx (메인 페이지)
  └─ MapContainer (지도 컨테이너)
       ├─ OpenLayers Map (지도)
       ├─ LayerControl (레이어 토글)
       ├─ ZoomControl (줌 버튼들)
       ├─ NorthArrow (북쪽 화살표)
       ├─ FullscreenControl (풀스크린)
       └─ MapInfo (좌표/줌 정보)
```

### 1.2 데이터 흐름

```
mapConfig.ts
    ↓ 설정 읽기
MapContainer
    ↓ 지도 생성
OpenLayers Map
    ↓ 이벤트 발생
React State 업데이트
    ↓ 리렌더링
UI 컴포넌트 업데이트
```

### 1.3 파일 구조

```
src/
├── app/
│   └── page.tsx              # 엔트리 포인트
│
├── components/Map/
│   ├── MapContainer.tsx      # 🔥 핵심 - 지도 + 모든 UI
│   ├── ZoomControl.tsx       # 줌 버튼 (+ - 🏠)
│   ├── LayerControl.tsx      # 레이어 토글 (📂)
│   ├── MapInfo.tsx           # 좌표/줌 표시
│   ├── NorthArrow.tsx        # 북쪽 방향
│   └── FullscreenControl.tsx # 풀스크린 버튼
│
├── lib/map/
│   └── mapConfig.ts          # 지도 설정
│
└── types/
    └── map.ts                # TypeScript 타입
```

---

## 2. MapContainer - 핵심 컴포넌트

### 2.1 전체 코드 흐름

`src/components/Map/MapContainer.tsx`는 모든 것을 담당합니다:

```typescript
'use client';

// 1️⃣ Import
import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
// ...

export default function MapContainer() {
  // 2️⃣ Refs와 State
  const mapRef = useRef<HTMLDivElement>(null);          // DOM 요소
  const mapInstanceRef = useRef<Map | null>(null);      // 지도 인스턴스
  const [coordinates, setCoordinates] = useState(...);  // 좌표 상태
  const [zoom, setZoom] = useState(...);                // 줌 상태
  const [rotation, setRotation] = useState(...);        // 회전 상태
  const [layers, setLayers] = useState(...);            // 레이어 상태

  // 3️⃣ 지도 초기화 (마운트 시 한 번)
  useEffect(() => {
    // OpenLayers 지도 생성
    // 이벤트 리스너 등록
    // 클린업 함수 반환
  }, []);

  // 4️⃣ 이벤트 핸들러
  const handleZoomIn = () => { /* ... */ };
  const handleZoomOut = () => { /* ... */ };
  // ...

  // 5️⃣ 렌더링
  return (
    <div>
      <div ref={mapRef} />  {/* 지도 */}
      <ZoomControl />       {/* UI */}
      <MapInfo />           {/* UI */}
      {/* ... */}
    </div>
  );
}
```

### 2.2 단계별 상세 분석

#### Step 1: Refs 생성

```typescript
const mapRef = useRef<HTMLDivElement>(null);
const containerRef = useRef<HTMLDivElement>(null);
const mapInstanceRef = useRef<Map | null>(null);
```

**역할**:
- `mapRef`: OpenLayers가 지도를 렌더링할 DOM 요소
- `containerRef`: 풀스크린 컨테이너
- `mapInstanceRef`: 생성된 지도를 저장 (다른 함수에서 사용)

**왜 useRef?**
- `useState`는 변경 시 리렌더링 → 지도가 재생성됨
- `useRef`는 변경해도 리렌더링 안 됨 → 지도 유지됨

#### Step 2: State 생성

```typescript
const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
const [zoom, setZoom] = useState<number>(7);
const [rotation, setRotation] = useState<number>(0);
const [layers, setLayers] = useState<Layer[]>([]);
```

**역할**: UI에 표시할 데이터 저장

**왜 useState?**
- UI가 변경되어야 함 → 리렌더링 필요
- 예: 마우스 이동 → 좌표 변경 → MapInfo 업데이트

#### Step 3: 지도 초기화

```typescript
useEffect(() => {
  if (!mapRef.current) return;

  // 1. 타일 레이어 생성
  const tileLayer = new TileLayer({
    source: new XYZ({
      url: MAP_CONFIG.tileUrl,
      crossOrigin: 'anonymous',
    }),
  });

  // 2. 지도 생성
  const map = new Map({
    target: mapRef.current,  // DOM 요소
    layers: [tileLayer],     // 레이어들
    view: new View({         // 뷰 설정
      center: fromLonLat(MAP_CONFIG.initialView.center),
      zoom: MAP_CONFIG.initialView.zoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
    }),
  });

  // 3. 컨트롤 추가
  const scaleLine = new ScaleLine({
    units: 'metric',
  });
  map.addControl(scaleLine);

  // 4. 이벤트 리스너 등록
  map.on('pointermove', (event) => {
    const lonLat = toLonLat(event.coordinate);
    setCoordinates([lonLat[0], lonLat[1]]);
  });

  map.getView().on('change:resolution', () => {
    setZoom(map.getView().getZoom()!);
  });

  // 5. 지도 저장
  mapInstanceRef.current = map;

  // 6. 클린업
  return () => {
    map.setTarget(undefined);
    mapInstanceRef.current = null;
  };
}, []); // 빈 배열 = 마운트 시 한 번만
```

**핵심 포인트**:
- `if (!mapRef.current) return`: DOM이 없으면 중단
- `[]` 의존성 배열: 컴포넌트 마운트 시 한 번만 실행
- 클린업 함수: 언마운트 시 지도 정리

#### Step 4: 이벤트 핸들러

```typescript
const handleZoomIn = () => {
  const map = mapInstanceRef.current;
  if (!map) return;

  const view = map.getView();
  const currentZoom = view.getZoom();
  if (currentZoom !== undefined) {
    view.animate({ zoom: currentZoom + 1, duration: 250 });
  }
};
```

**패턴**:
1. `mapInstanceRef.current`로 지도 가져오기
2. null 체크
3. View 가져오기
4. 현재 값 가져오기
5. `animate()`로 부드러운 전환

#### Step 5: 렌더링

```typescript
return (
  <div ref={containerRef} className="relative w-full h-full">
    {/* 지도 영역 */}
    <div ref={mapRef} className="w-full h-full" />

    {/* UI 컨트롤들 */}
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <LayerControl />
      <ZoomControl />
      <NorthArrow />
      <FullscreenControl />
    </div>

    <MapInfo />
  </div>
);
```

**레이아웃**:
- `relative`: 부모 (컨테이너)
- `absolute`: 자식들 (UI 컨트롤)
- `ref={mapRef}`: OpenLayers가 여기에 렌더링

---

## 3. UI 컴포넌트들

### 3.1 ZoomControl

`src/components/Map/ZoomControl.tsx`

**역할**: 줌 인/아웃, 홈 버튼

```typescript
interface ZoomControlProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onHome: () => void;
}

export default function ZoomControl({ onZoomIn, onZoomOut, onHome }) {
  return (
    <>
      <button onClick={onZoomIn}>+</button>
      <button onClick={onZoomOut}>−</button>
      <button onClick={onHome}>🏠</button>
    </>
  );
}
```

**사용법**:
```typescript
<ZoomControl
  onZoomIn={handleZoomIn}
  onZoomOut={handleZoomOut}
  onHome={handleHome}
/>
```

**Props 전달 방식**:
- MapContainer에서 함수 정의
- Props로 함수 전달
- 버튼 클릭 시 함수 실행

### 3.2 LayerControl

`src/components/Map/LayerControl.tsx`

**역할**: 레이어 켜기/끄기

```typescript
interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

export default function LayerControl({ layers, onLayerToggle }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>📂</button>

      {isOpen && (
        <div>
          {layers.map((layer) => (
            <label key={layer.id}>
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={() => onLayerToggle(layer.id)}
              />
              {layer.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
```

**상태 관리**:
- `isOpen`: 컴포넌트 내부 상태 (패널 열림/닫힘)
- `layers`: 부모로부터 받은 Props
- `onLayerToggle`: 부모의 함수 호출

### 3.3 MapInfo

`src/components/Map/MapInfo.tsx`

**역할**: 좌표와 줌 표시

```typescript
export default function MapInfo({ coordinates, zoom }) {
  return (
    <div>
      <div>
        좌표: {coordinates?.[0].toFixed(6)}, {coordinates?.[1].toFixed(6)}
      </div>
      <div>
        줌: {zoom.toFixed(2)}
      </div>
    </div>
  );
}
```

**Pure Component**:
- Props만 받아서 표시
- 자체 상태 없음
- 부모가 업데이트하면 자동 리렌더링

### 3.4 NorthArrow

`src/components/Map/NorthArrow.tsx`

**역할**: 북쪽 방향 표시

```typescript
export default function NorthArrow({ rotation }) {
  return (
    <div
      className="text-2xl"
      style={{ transform: `rotate(${-rotation}rad)` }}
    >
      ⬆
    </div>
  );
}
```

**CSS Transform**:
- `rotation`: 지도 회전 각도 (라디안)
- `-rotation`: 반대 방향으로 회전 (항상 북쪽 가리킴)
- `rotate(Nrad)`: CSS transform

### 3.5 FullscreenControl

`src/components/Map/FullscreenControl.tsx`

**역할**: 풀스크린 전환

```typescript
export default function FullscreenControl({ onToggle }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
    };
  }, []);

  return (
    <button onClick={onToggle}>⛶</button>
  );
}
```

**Fullscreen API**:
- `element.requestFullscreen()`: 전체화면 진입
- `document.exitFullscreen()`: 전체화면 종료
- `fullscreenchange` 이벤트: 상태 변경 감지

---

## 4. 설정 파일

### 4.1 mapConfig.ts

`src/lib/map/mapConfig.ts`

```typescript
export const MAP_CONFIG = {
  tileUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',

  initialView: {
    center: [127.5, 36.5],
    zoom: 7,
  },

  minZoom: 6,
  maxZoom: 19,

  tileSize: 256,

  projection: 'EPSG:3857',
} as const;
```

**as const**:
- TypeScript에게 "이 값은 변하지 않는다" 알림
- 더 정확한 타입 추론
- 자동완성 개선

**사용법**:
```typescript
import { MAP_CONFIG } from '@/lib/map/mapConfig';

// 타입 안전성
MAP_CONFIG.zoom;  // ✅ 7 (number literal)
MAP_CONFIG.zoom = 10;  // ❌ 에러: readonly
```

### 4.2 타입 정의

`src/types/map.ts`

```typescript
import type Map from 'ol/Map';

export interface MapContainerProps {
  className?: string;
}

export interface MapInstance {
  map: Map | null;
}
```

**타입 import**:
- `import type`: 런타임에 포함 안 됨 (번들 크기 절약)
- 타입 체크만 사용

---

## 5. 커스터마이징 가이드

### 5.1 타일 소스 변경

```typescript
// src/lib/map/mapConfig.ts
export const MAP_CONFIG = {
  // 변경 전
  tileUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',

  // 변경 후
  tileUrl: 'http://192.168.0.140:8082/tiles/SD/L{z}/{x}/{y}.png',
};
```

### 5.2 초기 위치 변경

```typescript
// 서울 시청
initialView: {
  center: [126.9784, 37.5665],
  zoom: 12,
}

// 부산
initialView: {
  center: [129.0756, 35.1796],
  zoom: 11,
}
```

### 5.3 UI 위치 조정

```typescript
// MapContainer.tsx

// 우측 상단 → 좌측 상단
<div className="absolute top-4 left-4 flex flex-col gap-2">

// 우측 하단 → 좌측 하단
<MapInfo className="absolute bottom-4 left-4" />
```

### 5.4 버튼 스타일 변경

```typescript
// ZoomControl.tsx

// 기본 스타일
className="w-10 h-10 bg-white dark:bg-zinc-800 ..."

// 큰 버튼
className="w-14 h-14 bg-white dark:bg-zinc-800 ..."

// 둥근 버튼
className="w-10 h-10 rounded-full bg-white ..."
```

### 5.5 새 레이어 추가

```typescript
// MapContainer.tsx useEffect 안에

// 기존 타일 레이어
const baseLayer = new TileLayer({ /* ... */ });

// 새 오버레이 레이어
const overlayLayer = new TileLayer({
  source: new XYZ({
    url: 'http://서버/overlay/{z}/{x}/{y}.png',
  }),
  opacity: 0.5,  // 반투명
});

// 지도에 추가
const map = new Map({
  layers: [baseLayer, overlayLayer],  // 순서 중요!
  // ...
});

// layers 상태에도 추가
setLayers([
  { id: 'base', name: '기본 지도', visible: true, layer: baseLayer },
  { id: 'overlay', name: '오버레이', visible: true, layer: overlayLayer },
]);
```

### 5.6 새 컨트롤 추가

```typescript
// 1. 컴포넌트 생성
// src/components/Map/MyControl.tsx
export default function MyControl({ onClick }) {
  return <button onClick={onClick}>🔍</button>;
}

// 2. MapContainer에 추가
const handleMyControl = () => {
  console.log('클릭!');
};

return (
  <div className="absolute top-4 right-4 ...">
    {/* 기존 컨트롤 */}
    <LayerControl />
    <ZoomControl />

    {/* 새 컨트롤 */}
    <MyControl onClick={handleMyControl} />
  </div>
);
```

---

## 6. 디버깅 팁

### 6.1 지도가 안 보일 때

```typescript
// 1. mapRef 확인
useEffect(() => {
  console.log('mapRef:', mapRef.current);  // null이면 문제
  if (!mapRef.current) return;
  // ...
}, []);

// 2. 지도 생성 확인
const map = new Map({ /* ... */ });
console.log('지도 생성됨:', map);
mapInstanceRef.current = map;

// 3. 타일 로딩 확인
// 브라우저 개발자 도구 > Network 탭 > PNG 필터
```

### 6.2 이벤트가 안 될 때

```typescript
// 1. 이벤트 등록 확인
map.on('click', (event) => {
  console.log('클릭:', event.coordinate);  // 로그 출력되나?
});

// 2. mapInstanceRef 확인
const handleZoomIn = () => {
  console.log('mapInstanceRef:', mapInstanceRef.current);  // null?
  const map = mapInstanceRef.current;
  if (!map) return;
  // ...
};
```

### 6.3 상태 업데이트 확인

```typescript
// useState에 로그 추가
const [zoom, setZoom] = useState(() => {
  console.log('초기 줌:', MAP_CONFIG.initialView.zoom);
  return MAP_CONFIG.initialView.zoom;
});

useEffect(() => {
  console.log('줌 변경:', zoom);
}, [zoom]);
```

---

## 7. 다음 단계

### 7.1 학습 완료!

축하합니다! 다음을 배웠습니다:

✅ GIS 기본 개념 (타일맵, 좌표계, 줌 레벨)
✅ OpenLayers 사용법 (Map, View, Layer)
✅ 프로젝트 구조와 각 컴포넌트의 역할
✅ 커스터마이징 방법

### 7.2 실습 과제

1. **초기 위치 변경**: 자신의 동네로 중심 설정
2. **버튼 추가**: 특정 위치로 이동하는 버튼 만들기
3. **스타일 변경**: 컨트롤 버튼 디자인 바꾸기
4. **이벤트 추가**: 지도 클릭 시 alert 띄우기

### 7.3 고급 기능 구현

다음 단계로 구현할 수 있는 기능들:

- **마커 추가**: GeoJSON으로 포인트 표시
- **팝업 표시**: 마커 클릭 시 정보 표시
- **그리기 도구**: 선, 면 그리기
- **측정 도구**: 거리, 면적 측정

---

**[README로 돌아가기 ←](../README.md)**

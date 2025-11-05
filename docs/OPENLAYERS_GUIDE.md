# OpenLayers 가이드

OpenLayers의 핵심 개념과 사용법을 Next.js 프로젝트 관점에서 설명합니다.

---

## 목차

1. [OpenLayers란?](#1-openlayers란)
2. [핵심 구조: Map, View, Layer](#2-핵심-구조-map-view-layer)
3. [타일 레이어 만들기](#3-타일-레이어-만들기)
4. [이벤트 처리](#4-이벤트-처리)
5. [컨트롤과 인터랙션](#5-컨트롤과-인터랙션)
6. [Next.js와의 통합](#6-nextjs와의-통합)

---

## 1. OpenLayers란?

### 1.1 개요

**OpenLayers**는 웹 브라우저에서 동적이고 인터랙티브한 지도를 표시하기 위한 오픈소스 JavaScript 라이브러리입니다.

**다른 지도 라이브러리와 비교**:

| 라이브러리 | 특징 | 라이선스 | 적합한 경우 |
|----------|------|---------|-----------|
| **OpenLayers** | 매우 강력, 복잡 | BSD (무료) | 고급 GIS 기능 필요 |
| Leaflet | 가볍고 간단 | BSD (무료) | 간단한 지도 표시 |
| Mapbox GL | 빠름, 예쁨 | 부분 유료 | 벡터 타일, 상업용 |
| Google Maps | 익숙함 | 유료 (무료 티어) | 구글 서비스 연동 |

### 1.2 주요 기능

- ✅ 다양한 타일 소스 지원 (XYZ, WMS, WMTS 등)
- ✅ 벡터 레이어 (GeoJSON, KML, GPX 등)
- ✅ 좌표계 변환 (EPSG:3857, EPSG:4326 등)
- ✅ 그리기 도구, 측정 도구
- ✅ 애니메이션 지원

### 1.3 설치

```bash
pnpm add ol
```

---

## 2. 핵심 구조: Map, View, Layer

OpenLayers는 3가지 핵심 개념으로 구성됩니다.

### 2.1 전체 구조

```
┌─────────────────────────────────┐
│          Map (지도)             │  ← 최상위 컨테이너
│  ┌───────────────────────────┐  │
│  │      View (뷰)            │  │  ← 카메라 (중심, 줌)
│  └───────────────────────────┘  │
│                                  │
│  ┌─ Layer 1 (배경 타일)      ┐  │
│  ├─ Layer 2 (도로)           │  │  ← 레이어들 (겹쳐짐)
│  ├─ Layer 3 (마커)           │  │
│  └─ Layer 4 (폴리곤)         ┘  │
└─────────────────────────────────┘
```

### 2.2 Map (지도 컨테이너)

**역할**: 모든 것을 담는 최상위 컨테이너

```typescript
import Map from 'ol/Map';

const map = new Map({
  target: 'map',           // HTML 요소 ID 또는 DOM 요소
  layers: [layer1, layer2], // 표시할 레이어들
  view: view,              // 뷰 (카메라)
});
```

**React/Next.js에서**:

```typescript
const mapRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const map = new Map({
    target: mapRef.current!, // ref로 DOM 요소 전달
    // ...
  });
}, []);

return <div ref={mapRef} className="w-full h-full" />;
```

### 2.3 View (카메라)

**역할**: 지도의 중심, 줌 레벨, 회전 등 "무엇을 어떻게 볼지" 결정

```typescript
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';

const view = new View({
  center: fromLonLat([127.5, 36.5]),  // 중심 좌표 (경도, 위도)
  zoom: 7,                            // 줌 레벨
  minZoom: 6,                         // 최소 줌
  maxZoom: 19,                        // 최대 줌
  rotation: 0,                        // 회전 (라디안)
});
```

**좌표 변환 필수**:
```typescript
// ❌ 잘못된 방법 - GPS 좌표를 그대로 사용
center: [127.5, 36.5]  // Web Mercator 좌표가 아님!

// ✅ 올바른 방법 - fromLonLat으로 변환
center: fromLonLat([127.5, 36.5])  // → [14193833, 4518386]
```

### 2.4 Layer (레이어)

**역할**: 실제 지도 데이터를 표시하는 층

**레이어 종류**:

```typescript
// 1. 타일 레이어 (래스터 이미지)
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

const tileLayer = new TileLayer({
  source: new XYZ({
    url: 'http://서버/tiles/{z}/{x}/{y}.png'
  })
});

// 2. 벡터 레이어 (GeoJSON 등)
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

const vectorLayer = new VectorLayer({
  source: new VectorSource({
    url: '/data/markers.geojson',
    format: new GeoJSON()
  })
});
```

---

## 3. 타일 레이어 만들기

### 3.1 기본 타일 레이어

우리 프로젝트의 타일 레이어 구조:

```typescript
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

// Source (데이터 출처)
const source = new XYZ({
  url: 'http://192.168.0.140:8082/tiles/SD/L{z}/{x}/{y}.png',
  crossOrigin: 'anonymous',  // CORS 허용
});

// Layer (표시 방법)
const layer = new TileLayer({
  source: source,
});
```

### 3.2 Layer와 Source의 관계

```
Layer (어떻게 표시할까?)
  │
  ├─ opacity: 투명도
  ├─ visible: 보이기/숨기기
  ├─ zIndex: 레이어 순서
  │
  └─ Source (데이터는 어디서?)
       │
       ├─ XYZ: 타일 URL
       ├─ WMS: 지도 서버
       ├─ Vector: GeoJSON 등
       └─ ...
```

### 3.3 URL 템플릿 문법

OpenLayers는 URL에서 `{z}`, `{x}`, `{y}`를 자동으로 치환합니다:

```typescript
// 템플릿
url: 'http://서버/tiles/{z}/{x}/{y}.png'

// 실제 요청될 URL 예시
// http://서버/tiles/7/100/50.png
// http://서버/tiles/7/101/50.png
// http://서버/tiles/8/200/100.png
```

**다중 서버 로드 밸런싱**:
```typescript
url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
// → a.tile.openstreetmap.org
// → b.tile.openstreetmap.org
// → c.tile.openstreetmap.org
```

---

## 4. 이벤트 처리

### 4.1 마우스 이벤트

```typescript
// 지도 클릭
map.on('click', (event) => {
  const coordinate = event.coordinate;  // 클릭한 좌표 (Web Mercator)
  const lonLat = toLonLat(coordinate);  // GPS 좌표로 변환
  console.log('클릭:', lonLat);
});

// 마우스 이동
map.on('pointermove', (event) => {
  const coordinate = event.coordinate;
  // 실시간 좌표 표시
});

// 마우스 드래그
map.on('moveend', () => {
  const center = map.getView().getCenter();
  console.log('지도 이동 완료:', center);
});
```

### 4.2 React 상태와 연동

```typescript
const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

useEffect(() => {
  // ...
  map.on('pointermove', (event) => {
    const lonLat = toLonLat(event.coordinate);
    setCoordinates([lonLat[0], lonLat[1]]);
  });
}, []);

// 컴포넌트에서 사용
return <div>좌표: {coordinates?.[0]}, {coordinates?.[1]}</div>;
```

### 4.3 View 이벤트

```typescript
// 줌 변경 감지
map.getView().on('change:resolution', () => {
  const zoom = map.getView().getZoom();
  console.log('현재 줌:', zoom);
});

// 회전 변경 감지
map.getView().on('change:rotation', () => {
  const rotation = map.getView().getRotation();
  console.log('회전:', rotation);
});
```

---

## 5. 컨트롤과 인터랙션

### 5.1 기본 컨트롤

OpenLayers는 기본적으로 몇 가지 컨트롤을 제공합니다:

```typescript
import { defaults as defaultControls, ScaleLine } from 'ol/control';

const map = new Map({
  controls: defaultControls({
    zoom: true,        // 줌 버튼
    attribution: true, // 저작권 표시
    rotate: true,      // 회전 리셋 버튼
  }),
  // ...
});

// 축척 표시 추가
const scaleLine = new ScaleLine({
  units: 'metric',  // 미터법
});
map.addControl(scaleLine);
```

### 5.2 커스텀 컨트롤 (React로)

OpenLayers 컨트롤 대신 React 컴포넌트로 구현:

```typescript
// ❌ OpenLayers 기본 줌 컨트롤
import { Zoom } from 'ol/control';
map.addControl(new Zoom());

// ✅ React 컴포넌트로 구현 (우리 프로젝트 방식)
const handleZoomIn = () => {
  const view = map.getView();
  view.animate({ zoom: view.getZoom()! + 1 });
};

return <button onClick={handleZoomIn}>+</button>;
```

**장점**:
- React 스타일링 (Tailwind CSS)
- 상태 관리 용이
- UI 커스터마이징 자유도

### 5.3 인터랙션

```typescript
// 기본 인터랙션 (자동으로 활성화됨)
import { defaults as defaultInteractions } from 'ol/interaction';

const map = new Map({
  interactions: defaultInteractions({
    doubleClickZoom: true,   // 더블클릭 줌
    mouseWheelZoom: true,     // 마우스 휠 줌
    dragPan: true,            // 드래그 이동
    pinchRotate: true,        // 핀치 회전 (모바일)
    pinchZoom: true,          // 핀치 줌 (모바일)
  }),
});
```

---

## 6. Next.js와의 통합

### 6.1 클라이언트 컴포넌트로 만들기

OpenLayers는 브라우저 전용이므로 `'use client'` 필수:

```typescript
'use client';  // ← 필수!

import { useEffect, useRef } from 'react';
import Map from 'ol/Map';

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      // ...
    });

    // 클린업
    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return <div ref={mapRef} className="w-full h-full" />;
}
```

### 6.2 왜 useEffect를 사용하나?

```typescript
// ❌ 잘못된 방법 - 렌더링 중에 지도 생성
export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);

  // 컴포넌트가 렌더링될 때마다 새 지도 생성!
  const map = new Map({
    target: mapRef.current,  // 첫 렌더링 시 null!
  });

  return <div ref={mapRef} />;
}

// ✅ 올바른 방법 - useEffect 사용
export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // DOM이 준비된 후 한 번만 실행
    const map = new Map({
      target: mapRef.current!,  // DOM 요소가 존재함
    });

    return () => map.setTarget(undefined);  // 클린업
  }, []);  // 빈 배열 = 마운트 시 한 번만

  return <div ref={mapRef} />;
}
```

### 6.3 지도 인스턴스 관리

```typescript
const mapInstanceRef = useRef<Map | null>(null);

useEffect(() => {
  const map = new Map({ /* ... */ });
  mapInstanceRef.current = map;  // 저장

  return () => {
    map.setTarget(undefined);
    mapInstanceRef.current = null;
  };
}, []);

// 다른 함수에서 사용
const handleZoom = () => {
  const map = mapInstanceRef.current;
  if (!map) return;

  map.getView().setZoom(10);
};
```

### 6.4 TypeScript 타입

```typescript
import type Map from 'ol/Map';
import type View from 'ol/View';
import type { Coordinate } from 'ol/coordinate';

// Ref 타입
const mapRef = useRef<HTMLDivElement>(null);
const mapInstanceRef = useRef<Map | null>(null);

// 좌표 타입
const coordinates: Coordinate = [127.5, 36.5];
const [state, setState] = useState<Coordinate | null>(null);
```

---

## 7. 실전 예제

### 7.1 최소 지도 코드

```typescript
'use client';

import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';

export default function SimpleMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([127.5, 36.5]),
        zoom: 7,
      }),
    });

    return () => map.setTarget(undefined);
  }, []);

  return <div ref={mapRef} className="w-full h-screen" />;
}
```

### 7.2 설정 파일로 분리

```typescript
// lib/map/mapConfig.ts
export const MAP_CONFIG = {
  tileUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  initialView: {
    center: [127.5, 36.5],
    zoom: 7,
  },
  minZoom: 6,
  maxZoom: 19,
} as const;

// components/Map/MapContainer.tsx
import { MAP_CONFIG } from '@/lib/map/mapConfig';

const map = new Map({
  // ...
  view: new View({
    center: fromLonLat(MAP_CONFIG.initialView.center),
    zoom: MAP_CONFIG.initialView.zoom,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom,
  }),
});
```

---

## 8. 다음 단계

### 8.1 배운 내용 정리

✅ **Map**: 지도 컨테이너
✅ **View**: 카메라 (중심, 줌, 회전)
✅ **Layer**: 표시할 데이터 (타일, 벡터 등)
✅ **Source**: 데이터 출처 (XYZ, GeoJSON 등)
✅ **이벤트**: click, pointermove 등
✅ **Next.js 통합**: 'use client', useEffect, useRef

### 8.2 추가 학습 자료

- [OpenLayers 공식 문서](https://openlayers.org/en/latest/apidoc/)
- [OpenLayers 예제](https://openlayers.org/en/latest/examples/)

### 8.3 다음 가이드

**[컴포넌트 가이드](./COMPONENT_GUIDE.md)**에서 우리 프로젝트의 실제 코드를 분석합니다:
- MapContainer 컴포넌트 상세 분석
- 각 UI 컴포넌트의 역할
- 커스터마이징 방법

---

**다음: [컴포넌트 가이드로 이동 →](./COMPONENT_GUIDE.md)**

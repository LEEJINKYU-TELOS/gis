'use client';

import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, toLonLat } from 'ol/proj';
import { ScaleLine } from 'ol/control';
import { MAP_CONFIG } from '@/lib/map/mapConfig';
import type { MapContainerProps } from '@/types/map';
import ZoomControl from './ZoomControl';
import MapInfo from './MapInfo';
import LayerControl from './LayerControl';
import FullscreenControl from './FullscreenControl';
import NorthArrow from './NorthArrow';

import 'ol/ol.css';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  layer: TileLayer<XYZ>;
}

export default function MapContainer({ className = '' }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [zoom, setZoom] = useState<number>(MAP_CONFIG.initialView.zoom);
  const [rotation, setRotation] = useState<number>(0);
  const [layers, setLayers] = useState<Layer[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // 타일 레이어 생성
    const tileLayer = new TileLayer({
      source: new XYZ({
        url: MAP_CONFIG.tileUrl,
        crossOrigin: 'anonymous',
      }),
    });

    // 레이어 상태 초기화
    setLayers([
      {
        id: 'base',
        name: '기본 지도',
        visible: true,
        layer: tileLayer,
      },
    ]);

    // 지도 인스턴스 생성
    const map = new Map({
      target: mapRef.current,
      layers: [tileLayer],
      view: new View({
        center: fromLonLat(MAP_CONFIG.initialView.center),
        zoom: MAP_CONFIG.initialView.zoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
      }),
    });

    // 축척 표시 추가
    const scaleLine = new ScaleLine({
      units: 'metric',
      bar: true,
      text: true,
      minWidth: 100,
    });
    map.addControl(scaleLine);

    mapInstanceRef.current = map;

    // 마우스 이동 이벤트 - 좌표 업데이트
    map.on('pointermove', (event) => {
      const lonLat = toLonLat(event.coordinate);
      setCoordinates([lonLat[0], lonLat[1]]);
    });

    // 줌 변경 이벤트
    map.getView().on('change:resolution', () => {
      const currentZoom = map.getView().getZoom();
      if (currentZoom !== undefined) {
        setZoom(currentZoom);
      }
    });

    // 회전 변경 이벤트
    map.getView().on('change:rotation', () => {
      const currentRotation = map.getView().getRotation();
      setRotation(currentRotation);
    });

    // 클린업
    return () => {
      map.setTarget(undefined);
      mapInstanceRef.current = null;
    };
  }, []);

  // 줌 인
  const handleZoomIn = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const view = map.getView();
    const currentZoom = view.getZoom();
    if (currentZoom !== undefined) {
      view.animate({ zoom: currentZoom + 1, duration: 250 });
    }
  };

  // 줌 아웃
  const handleZoomOut = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const view = map.getView();
    const currentZoom = view.getZoom();
    if (currentZoom !== undefined) {
      view.animate({ zoom: currentZoom - 1, duration: 250 });
    }
  };

  // 초기 위치로 돌아가기
  const handleHome = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const view = map.getView();
    view.animate({
      center: fromLonLat(MAP_CONFIG.initialView.center),
      zoom: MAP_CONFIG.initialView.zoom,
      rotation: 0,
      duration: 500,
    });
  };

  // 레이어 토글
  const handleLayerToggle = (layerId: string) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id === layerId) {
          const newVisible = !layer.visible;
          layer.layer.setVisible(newVisible);
          return { ...layer, visible: newVisible };
        }
        return layer;
      })
    );
  };

  // 풀스크린 토글
  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('풀스크린 전환 실패:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div
        ref={mapRef}
        className={`w-full h-full ${className}`}
        style={{ minHeight: '100vh' }}
      />

      {/* 우측 상단 컨트롤 그룹 */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        {/* 레이어 컨트롤 */}
        <LayerControl
          layers={layers.map((l) => ({ id: l.id, name: l.name, visible: l.visible }))}
          onLayerToggle={handleLayerToggle}
        />

        {/* 줌 컨트롤 */}
        <ZoomControl
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onHome={handleHome}
        />

        {/* 북쪽 화살표 */}
        <NorthArrow rotation={rotation} />

        {/* 풀스크린 버튼 */}
        <FullscreenControl onToggle={handleFullscreenToggle} />
      </div>

      {/* 지도 정보 (좌측 하단) */}
      <MapInfo coordinates={coordinates} zoom={zoom} />
    </div>
  );
}

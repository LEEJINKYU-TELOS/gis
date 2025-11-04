/**
 * 지도 설정 파일
 * 타일맵 서버 및 초기 뷰 설정
 */

export const MAP_CONFIG = {
  // 타일 서버 URL
  // 실제 타일 서버 (타일맵 업로드 완료 후 사용)
  // tileUrl: 'http://192.168.0.140:8082/tiles/SD/L{z}/{x}/{y}.png',

  // 임시 테스트용 OpenStreetMap 타일
  tileUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',

  // 초기 뷰 설정 (대한민국 중심)
  initialView: {
    center: [127.5, 36.5], // [경도, 위도]
    zoom: 7,
  },

  // 줌 레벨 제한
  minZoom: 6,
  maxZoom: 19,

  // 타일 크기
  tileSize: 256,

  // 좌표계
  projection: 'EPSG:3857', // Web Mercator
} as const;

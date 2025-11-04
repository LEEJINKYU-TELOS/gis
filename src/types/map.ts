/**
 * 지도 관련 타입 정의
 */

import type Map from 'ol/Map';

export interface MapContainerProps {
  className?: string;
}

export interface MapInstance {
  map: Map | null;
}

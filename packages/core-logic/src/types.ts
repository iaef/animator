export interface HaikuElement {
  id: string;
  type: 'rectangle' | 'ellipse';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string; // Color string, e.g., '#FF0000' or 'blue'
  opacity: number; // 0 to 1
}

export type AnimatableProperty = 'x' | 'y' | 'width' | 'height' | 'opacity' | 'fill';

export interface Keyframe {
  time: number; // in milliseconds
  value: number | string; // Can be number for x/y/opacity or string for fill
}

export interface Timeline {
  // Stores keyframes for a specific property of a specific element
  // Key format: "elementId.property" (e.g., "rect1.x")
  [elementIdAndProperty: string]: Keyframe[];
}

export interface HaikuProject {
  elements: HaikuElement[];
  timelines: Timeline; // A single timeline object that contains all animations
}

// Basic Lottie structure - This is a very simplified version for MVP
// See https://github.com/airbnb/lottie-web/blob/master/docs/json/animation.json

export interface LottieVec2D {
  x: number;
  y: number;
}

export interface LottieVec3D {
  x: number;
  y: number;
  z: number;
}

// Lottie keyframe for a single value (e.g., opacity, rotation)
export interface LottieScalarKeyframe {
  t: number; // Time (frame number)
  s: [number]; // Start value for the segment
  h?: 0 | 1;  // Hold: 1 for hold (stepped), 0 or undefined for interpolated
  // Add o and i for bezier curve tangents if needed for interpolated
  // o?: { x: number[]; y: number[] }; // Out-tangent Bezier handle (e.g. [0.667], [1])
  // i?: { x: number[]; y: number[] }; // In-tangent Bezier handle (e.g. [0.333], [0])
}

// Lottie keyframe for a multi-dimensional value (e.g., position [x,y,z], scale [x,y])
export interface LottieVecKeyframe {
  t: number; // Time (frame number)
  s: number[]; // Start value for the segment (e.g., [x,y,z] or [x,y])
  h?: 0 | 1;  // Hold
  // o?: { x: number[]; y: number[] };
  // i?: { x: number[]; y: number[] };
}

// Lottie animated property (scalar or vector)
export interface LottieAnimatedProperty<KFT> {
  a: 0 | 1; // 0 for static, 1 for animated
  k: KFT extends LottieScalarKeyframe ? (number | LottieScalarKeyframe[]) : (number[] | LottieVecKeyframe[]); // Static value or array of keyframes
  ix?: number; // Property index (optional)
}


export interface LottieColor {
  r: number; // 0-1
  g: number; // 0-1
  b: number; // 0-1
  a: number; // 0-1, often just 1
}

export interface LottieShapeItemBase {
  ty: string; // type: 'gr' (group), 'rc' (rect), 'el' (ellipse), 'fl' (fill), 'st' (stroke), 'tr' (transform)
  nm: string; // name
}

export interface LottieTransform {
  ty: 'tr';
  nm?: string;
  p: LottieAnimatedProperty<LottieVecKeyframe>;   // Position (e.g., {a: 0, k: [x,y,z]} or {a: 1, k: [{t:0, s:[x1,y1,z1]}, ...]})
  a: LottieAnimatedProperty<LottieVecKeyframe>;   // Anchor Point
  s: LottieAnimatedProperty<LottieVecKeyframe>;   // Scale (as percentages, e.g., [100, 100])
  r?: LottieAnimatedProperty<LottieScalarKeyframe>; // Rotation (degrees)
  o: LottieAnimatedProperty<LottieScalarKeyframe>;  // Opacity (0-100)
}

export interface LottieRect extends LottieShapeItemBase {
  ty: 'rc';
  // For MVP, assuming static properties for rect shape itself
  p: { k: LottieVec2D }; // Position (center of rect)
  s: { k: LottieVec2D }; // Size [width, height]
}

export interface LottieEllipse extends LottieShapeItemBase {
  ty: 'el';
  // For MVP, assuming static properties for ellipse shape itself
  p: { k: LottieVec2D }; // Position (center of ellipse)
  s: { k: LottieVec2D }; // Size [width, height] (representing diameters)
}

export interface LottieFill extends LottieShapeItemBase {
  ty: 'fl';
  // For MVP, assuming static fill color and opacity
  c: { k: [number, number, number, number] }; // Color [r,g,b,a] (values 0-1 for r,g,b; a is usually 1)
  o: { k: number };     // Opacity (0-100)
}

export interface LottieGroup extends LottieShapeItemBase {
  ty: 'gr';
  it: LottieShapeItem[];
  // Can also contain its own LottieTransform:
  // ks?: LottieTransform; 
}

export type LottieShapeItem = LottieRect | LottieEllipse | LottieFill | LottieTransform | LottieGroup;


export interface LottieLayer {
  ddd: 0 | 1; // 0 for 2D, 1 for 3D layer
  ind: number; // index
  ty: number; // type: 4 for shape layer
  nm: string; // name
  ks: LottieTransform; // Transform properties for the layer itself
  shapes?: LottieShapeItem[]; // Shape items (for shape layers)
  // For precomp layers, it would be different:
  // refId?: string; // Reference to an asset ID (for precomps)
  // w?: number; h?: number; // Width/Height if precomp
  ip: number; // in point (frame number)
  op: number; // out point (frame number)
  st: number; // start time (frame number)
  sr: number; // stretch (usually 1)
}

export interface LottieJSON {
  v: string; // Bodymovin version
  fr: number; // frame rate
  ip: number; // in point (frame number)
  op: number; // out point (frame number)
  w: number; // width
  h: number; // height
  nm?: string; // name
  ddd: 0 | 1; // 0 for 2D, 1 for 3D comp
  assets: any[]; // For images, precomps - empty for MVP
  layers: LottieLayer[];
}

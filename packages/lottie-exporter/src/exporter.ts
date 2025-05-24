import { HaikuProjectManager, HaikuElement, Keyframe as HaikuKeyframe, AnimatableProperty } from 'haiku-core-logic/project';
import { calculateAnimatedProperties } from 'haiku-core-logic/animation';
import { LottieJSON, LottieLayer, LottieShapeItem, LottieRect, LottieEllipse, LottieFill, LottieTransform, LottieAnimatedProperty, LottieScalarKeyframe, LottieVecKeyframe } from './types';

const LOTTIE_FRAME_RATE = 60;

function msToFrames(ms: number): number {
  return Math.round((ms / 1000) * LOTTIE_FRAME_RATE);
}

// Helper to convert hex color and opacity to Lottie's [r,g,b] (0-1 range) array
function hexToLottieColor(hex: string): [number, number, number] {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    console.warn(`Invalid hex color: ${hex}, defaulting to black.`);
    return [0, 0, 0]; // Default to black if invalid
  }
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

// Helper to create Lottie keyframes for scalar properties (e.g., opacity)
function createLottieScalarKeyframes(
  haikuKeyframes: HaikuKeyframe[],
  transformValue: (value: any) => number = (v) => v as number
): LottieScalarKeyframe[] {
  if (!haikuKeyframes || haikuKeyframes.length === 0) return [];
  return haikuKeyframes.map(kf => ({
    t: msToFrames(kf.time),
    s: [transformValue(kf.value)],
    h: 1, // Hold frame (stepped interpolation for MVP)
  }));
}

// Helper to create Lottie keyframes for 2D vector properties (e.g., position)
// For MVP, position is 2D [x,y] but Lottie often uses 3D [x,y,z] for layer position, so we add z=0.
function createLottieVecKeyframes(
  xKeyframes: HaikuKeyframe[] | undefined,
  yKeyframes: HaikuKeyframe[] | undefined,
  staticX: number,
  staticY: number
): LottieVecKeyframe[] {
  const combinedTimes = new Set<number>();
  if (xKeyframes) xKeyframes.forEach(kf => combinedTimes.add(kf.time));
  if (yKeyframes) yKeyframes.forEach(kf => combinedTimes.add(kf.time));

  const sortedTimes = Array.from(combinedTimes).sort((a, b) => a - b);
  if (sortedTimes.length === 0) return [];

  let lastX = staticX;
  let lastY = staticY;

  return sortedTimes.map(time => {
    let currentX = lastX;
    let currentY = lastY;

    if (xKeyframes) {
      const xKf = xKeyframes.filter(kf => kf.time <= time).pop();
      if (xKf) currentX = xKf.value as number;
    }
    if (yKeyframes) {
      const yKf = yKeyframes.filter(kf => kf.time <= time).pop();
      if (yKf) currentY = yKf.value as number;
    }
    
    // For simplicity, we'll find the value at this exact time.
    // A more robust solution would interpolate if keyframes don't align perfectly.
    // For MVP, if a keyframe exists at 'time' for X, use it. If not, use the last known X. Same for Y.
    const xValAtTime = xKeyframes?.find(kf => kf.time === time)?.value as number ?? currentX;
    const yValAtTime = yKeyframes?.find(kf => kf.time === time)?.value as number ?? currentY;

    lastX = xValAtTime;
    lastY = yValAtTime;

    return {
      t: msToFrames(time),
      s: [xValAtTime, yValAtTime, 0], // Lottie layer position is [x,y,z]
      h: 1, // Hold frame
    };
  });
}


export function exportToLottie(project: HaikuProjectManager): LottieJSON {
  const layers: LottieLayer[] = [];
  let layerIndex = 0;
  let maxOutPoint = 0; // To determine the overall animation out-point

  project.elements.forEach(element => {
    const initialPropsAtT0 = calculateAnimatedProperties(project, 0).get(element.id) || {};
    const baseProps: HaikuElement = { ...element, ...initialPropsAtT0 };

    const timelineX = project.timelines[`${element.id}.x`];
    const timelineY = project.timelines[`${element.id}.y`];
    const timelineOpacity = project.timelines[`${element.id}.opacity`];

    // Update maxOutPoint based on the timelines
    [timelineX, timelineY, timelineOpacity].forEach(timeline => {
      if (timeline && timeline.length > 0) {
        const lastKfTime = timeline[timeline.length - 1].time;
        maxOutPoint = Math.max(maxOutPoint, msToFrames(lastKfTime));
      }
    });


    // Layer Transform: Position (p)
    let positionProp: LottieAnimatedProperty<LottieVecKeyframe>;
    const lottiePositionKeyframes = createLottieVecKeyframes(timelineX, timelineY, baseProps.x, baseProps.y);
    if (lottiePositionKeyframes.length > 1) { // Only consider animated if more than one distinct keyframe value results
        // Basic check for actual animation (more than one unique value)
        const uniquePosValues = new Set(lottiePositionKeyframes.map(kf => kf.s.slice(0,2).join(','))).size;
        if (uniquePosValues > 1) {
            positionProp = { a: 1, k: lottiePositionKeyframes };
        } else {
            positionProp = { a: 0, k: lottiePositionKeyframes.length > 0 ? lottiePositionKeyframes[0].s : [baseProps.x, baseProps.y, 0] };
        }
    } else {
      positionProp = { a: 0, k: lottiePositionKeyframes.length > 0 ? lottiePositionKeyframes[0].s : [baseProps.x, baseProps.y, 0] };
    }
    

    // Layer Transform: Opacity (o)
    let opacityProp: LottieAnimatedProperty<LottieScalarKeyframe>;
    const lottieOpacityKeyframes = createLottieScalarKeyframes(timelineOpacity, v => (v as number) * 100); // Lottie opacity 0-100
    if (lottieOpacityKeyframes.length > 1) {
        const uniqueOpacityValues = new Set(lottieOpacityKeyframes.map(kf => kf.s[0])).size;
        if (uniqueOpacityValues > 1) {
            opacityProp = { a: 1, k: lottieOpacityKeyframes };
        } else {
            opacityProp = { a: 0, k: lottieOpacityKeyframes.length > 0 ? lottieOpacityKeyframes[0].s[0] : baseProps.opacity * 100 };
        }
    } else {
      opacityProp = { a: 0, k: lottieOpacityKeyframes.length > 0 ? lottieOpacityKeyframes[0].s[0] : baseProps.opacity * 100 };
    }

    const layerTransform: LottieTransform = {
      ty: 'tr', // This 'ty' is not strictly part of 'ks', but a convention for the object itself
      p: positionProp,
      a: { a: 0, k: [0, 0, 0] }, // Anchor point - center of the element for layer transforms usually
      s: { a: 0, k: [100, 100, 100] }, // Scale
      r: { a: 0, k: 0 }, // Rotation
      o: opacityProp, // Opacity
    };

    // Shape items (rectangle, ellipse, fill) - kept static for MVP as per previous setup
    const shapes: LottieShapeItem[] = [];
    let lottieElementShape: LottieRect | LottieEllipse;

    // For shapes, use the initial non-animated properties, as Lottie shape transforms are relative to the layer.
    // The layer's transform (ks) will handle the animation.
    if (element.type === 'rectangle') {
      lottieElementShape = {
        ty: 'rc',
        nm: element.id,
        p: { k: [element.width / 2, element.height / 2] }, // Position is center, relative to layer anchor
        s: { k: [element.width, element.height] },
      };
    } else if (element.type === 'ellipse') {
      lottieElementShape = {
        ty: 'el',
        nm: element.id,
        p: { k: [element.width / 2, element.height / 2] }, // Position is center
        s: { k: [element.width, element.height] }, // Lottie size for ellipse is full width/height
      };
    } else {
      console.warn(`Unsupported element type for Lottie export: ${element.type}`);
      return;
    }
    shapes.push(lottieElementShape);

    const colorVal = hexToLottieColor(element.fill); // Use base fill color for shape
    const fillShape: LottieFill = {
      ty: 'fl',
      nm: `${element.id} Fill`,
      c: { k: [colorVal[0], colorVal[1], colorVal[2], 1] },
      o: { k: 100 }, // Fill opacity is 100, layer opacity handles actual visibility
    };
    shapes.push(fillShape);

    // Static transform for shapes within the layer (usually identity if layer transform handles all)
    const shapeTransform: LottieTransform = {
        ty: 'tr',
        nm: `${element.id} Shape Transform`,
        p: { a:0, k: [0, 0] }, 
        a: { a:0, k: [0, 0] }, 
        s: { a:0, k: [100, 100] }, 
        r: { a:0, k: 0 },    
        o: { a:0, k: 100 },   
    };
    shapes.push(shapeTransform);

    const layer: LottieLayer = {
      ddd: 0,
      ind: layerIndex++,
      ty: 4, // Shape layer
      nm: element.id,
      ks: layerTransform,
      shapes: shapes,
      ip: 0,
      op: Math.max(LOTTIE_FRAME_RATE, maxOutPoint), // Ensure layer out-point covers animation
      st: 0,
      sr: 1,
    };
    layers.push(layer);
  });

  // If maxOutPoint is still 0 (no animations), default to 1 second.
  if (maxOutPoint === 0) {
    maxOutPoint = LOTTIE_FRAME_RATE;
  }

  return {
    v: '5.5.0',
    fr: LOTTIE_FRAME_RATE,
    ip: 0,
    op: maxOutPoint,
    w: 800, // TODO: get from project settings
    h: 600, // TODO: get from project settings
    nm: 'Haiku NextGen Export',
    ddd: 0,
    assets: [],
    layers: layers,
  };
}

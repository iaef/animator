import { HaikuProject, HaikuElement, Keyframe, AnimatableProperty } from './types';

// Simple linear interpolation function
function interpolate(v0: number, v1: number, t: number): number {
  return v0 * (1 - t) + v1 * t;
}

// More specific interpolate for color (string) - very basic, just switches at 50%
// A proper color interpolation is more complex and out of scope for this MVP.
function interpolateColor(c0: string, c1: string, t: number): string {
  return t < 0.5 ? c0 : c1;
}

export function calculateAnimatedProperties(project: HaikuProject, time: number): Map<string, Partial<HaikuElement>> {
  const updatedProperties = new Map<string, Partial<HaikuElement>>();

  for (const element of project.elements) {
    updatedProperties.set(element.id, {}); // Initialize an empty object for each element
  }

  for (const timelineKey in project.timelines) {
    const keyframes = project.timelines[timelineKey];
    if (!keyframes || keyframes.length === 0) {
      continue;
    }

    const [elementId, propertyName] = timelineKey.split('.') as [string, AnimatableProperty];
    const element = project.elements.find(el => el.id === elementId);

    if (!element) {
      console.warn(`Element with ID ${elementId} not found for timeline key ${timelineKey}`);
      continue;
    }

    // Find the two keyframes to interpolate between
    let kf0: Keyframe | null = null;
    let kf1: Keyframe | null = null;

    for (const kf of keyframes) {
      if (kf.time <= time) {
        kf0 = kf;
      } else {
        kf1 = kf;
        break;
      }
    }
    
    const currentElementProps = updatedProperties.get(elementId)!;

    if (kf0 && !kf1) { // Time is at or after the last keyframe
      currentElementProps[propertyName] = kf0.value as any; // Cast as any for simplicity
    } else if (kf0 && kf1) { // Interpolate between kf0 and kf1
      const t = (time - kf0.time) / (kf1.time - kf0.time);
      if (typeof kf0.value === 'number' && typeof kf1.value === 'number') {
        currentElementProps[propertyName] = interpolate(kf0.value, kf1.value, t);
      } else if (typeof kf0.value === 'string' && typeof kf1.value === 'string' && propertyName === 'fill') {
        currentElementProps[propertyName] = interpolateColor(kf0.value, kf1.value, t);
      } else {
        // Fallback for non-numeric or non-color string properties if any (e.g. future type changes)
        // For MVP, we assume if not number, it's a color string and just take the start value if types don't match for interpolation
        currentElementProps[propertyName] = kf0.value as any;
      }
    } else if (!kf0 && kf1) { // Time is before the first keyframe
       currentElementProps[propertyName] = kf1.value as any; // Use first keyframe's value
    } else {
       // No keyframes applicable, or only one keyframe which is not kf0 (shouldn't happen with current logic)
       // Potentially use initial element property if defined, or skip update.
       // For MVP, if no keyframes are matched this way, the property remains unchanged from its initial definition.
    }
  }
  return updatedProperties;
}

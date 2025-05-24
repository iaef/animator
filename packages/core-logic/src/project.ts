import { HaikuElement, HaikuProject, Timeline } from './types';

export class HaikuProjectManager implements HaikuProject {
  elements: HaikuElement[] = [];
  timelines: Timeline = {};

  constructor(initialProject?: Partial<HaikuProject>) {
    if (initialProject) {
      this.elements = initialProject.elements || [];
      this.timelines = initialProject.timelines || {};
    }
  }

  addElement(element: HaikuElement): void {
    if (this.elements.find(el => el.id === element.id)) {
      throw new Error(`Element with id ${element.id} already exists.`);
    }
    this.elements.push(element);
  }

  // In this simplified MVP, we're assuming a single timeline object for the whole project.
  // This method effectively replaces or sets the animation for a specific element's property.
  setTimeline(elementId: string, property: keyof HaikuElement, keyframes: Keyframe[]): void {
    const timelineKey = `${elementId}.${property}`;
    this.timelines[timelineKey] = keyframes;
  }
}

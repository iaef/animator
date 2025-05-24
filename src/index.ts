import { HaikuProjectManager } from '../packages/core-logic/src/project'; // Adjusted path
import { calculateAnimatedProperties } from '../packages/core-logic/src/animation'; // Adjusted path
import { CanvasRenderer } from '../packages/rendering-engine-canvas/src/renderer'; // Adjusted path
import { HaikuElement } from '../packages/core-logic/src/types'; // Adjusted path

// 1. Create a sample HaikuProject
const projectManager = new HaikuProjectManager();

const rect1: HaikuElement = {
  id: 'rect1',
  type: 'rectangle',
  x: 10,
  y: 10,
  width: 100,
  height: 50,
  fill: 'red',
  opacity: 1,
};
projectManager.addElement(rect1);

const ellipse1: HaikuElement = {
  id: 'ellipse1',
  type: 'ellipse',
  x: 150,
  y: 75,
  width: 80, // diameter
  height: 40, // diameter
  fill: 'blue',
  opacity: 1,
};
projectManager.addElement(ellipse1);

// 2. Define animations
projectManager.setTimeline('rect1', 'x', [
  { time: 0, value: 10 },
  { time: 2000, value: 200 },
]);

projectManager.setTimeline('ellipse1', 'opacity', [
  { time: 0, value: 1 },
  { time: 2000, value: 0 },
]);

// 3. Instantiate CanvasRenderer
const renderer = new CanvasRenderer('konva-container', 400, 300);

// 4. Load the project into the renderer
renderer.loadProject(projectManager);

// 5. Animation loop
const startTime = Date.now();
const animationDuration = 2000; // 2 seconds

function animate() {
  const currentTime = Date.now() - startTime;

  // Calculate animated properties
  const animatedProps = calculateAnimatedProperties(projectManager, currentTime);

  // Update Konva shapes
  renderer.updateFrame(animatedProps);

  // Redraw the layer
  renderer.draw();

  if (currentTime < animationDuration) {
    requestAnimationFrame(animate);
  } else {
    // Ensure final state is rendered
    const finalProps = calculateAnimatedProperties(projectManager, animationDuration);
    renderer.updateFrame(finalProps);
    renderer.draw();
    console.log('Animation complete');
  }
}

// Start the animation
requestAnimationFrame(animate);

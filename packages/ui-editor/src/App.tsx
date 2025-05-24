import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HaikuProjectManager } from 'haiku-core-logic/project';
import { HaikuElement, HaikuProject, Timeline } from 'haiku-core-logic/types';
import { calculateAnimatedProperties } from 'haiku-core-logic/animation';
import { CanvasRenderer } from 'haiku-rendering-engine-canvas/renderer';
import { exportToLottie, LottieJSON } from 'haiku-lottie-exporter/exporter';
import { saveLottieFile } from 'haiku-project-io/fileSaver';

import './App.css'; // Basic styling

// Default project with animations for x, y, and opacity
const DEFAULT_PROJECT_JSON = `{
  "elements": [
    {
      "id": "rect1",
      "type": "rectangle",
      "x": 10,
      "y": 10,
      "width": 100,
      "height": 50,
      "fill": "#FF5733",
      "opacity": 1
    },
    {
      "id": "ellipse1",
      "type": "ellipse",
      "x": 150,
      "y": 100,
      "width": 80,
      "height": 60,
      "fill": "#33CFFF",
      "opacity": 0.5
    }
  ],
  "timelines": {
    "rect1.x": [
      { "time": 0, "value": 10 },
      { "time": 1000, "value": 150 },
      { "time": 2000, "value": 10 }
    ],
    "rect1.opacity": [
      { "time": 0, "value": 1 },
      { "time": 1000, "value": 0.2 },
      { "time": 2000, "value": 1 }
    ],
    "ellipse1.y": [
      { "time": 0, "value": 100 },
      { "time": 1000, "value": 200 },
      { "time": 2000, "value": 100 }
    ],
    "ellipse1.fill": [
      { "time": 0, "value": "#33CFFF" },
      { "time": 1000, "value": "#AF33FF" },
      { "time": 2000, "value": "#33CFFF" }
    ]
  }
}`;

const App: React.FC = () => {
  const [projectManager, setProjectManager] = useState<HaikuProjectManager>(() => {
    // Initialize with the default project
    try {
      const parsedProject: Partial<HaikuProject> = JSON.parse(DEFAULT_PROJECT_JSON);
      return new HaikuProjectManager(parsedProject);
    } catch {
      return new HaikuProjectManager(); // Fallback to empty if default JSON is malformed
    }
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [projectJson, setProjectJson] = useState<string>(DEFAULT_PROJECT_JSON); // Default project
  const [renderer, setRenderer] = useState<CanvasRenderer | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [animationDuration, setAnimationDuration] = useState<number>(2000); // Default duration

  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const projectRef = useRef<HaikuProjectManager>(projectManager);

  useEffect(() => {
    projectRef.current = projectManager;
    // Update animation duration based on loaded project
    let maxTime = 0;
    Object.values(projectManager.timelines).forEach(timeline => {
      if (timeline && timeline.length > 0) {
        maxTime = Math.max(maxTime, timeline[timeline.length - 1].time);
      }
    });
    setAnimationDuration(maxTime > 0 ? maxTime : 2000); // Default to 2s if no animations

    // Reload project in renderer when projectManager changes
    if (renderer) {
        renderer.loadProject(projectManager);
        setCurrentTime(0); // Reset time
        startTimeRef.current = Date.now();
        if (isPlaying) { // If it was playing, restart the animation loop
             animationFrameId.current = requestAnimationFrame(animate);
        } else { // If paused, render the first frame
            const initialProps = calculateAnimatedProperties(projectManager, 0);
            renderer.updateFrame(initialProps);
            renderer.draw();
        }
    }

  }, [projectManager, renderer]); // Added renderer to dependency array

  const loadProjectFromJson = () => {
    try {
      const parsedProject: Partial<HaikuProject> = JSON.parse(projectJson);
      const newManager = new HaikuProjectManager(parsedProject);
      setProjectManager(newManager); // This will trigger the useEffect above
      console.log('Project loaded:', newManager);
    } catch (error) {
      console.error('Error loading project from JSON:', error);
      alert('Failed to parse project JSON. Please check the format.');
    }
  };
  
  const handlePlay = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    startTimeRef.current = Date.now() - currentTime; 
  };

  const handlePause = () => {
    if (!isPlaying) return;
    setIsPlaying(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  };

  const handleExportLottie = async () => {
    handlePause(); 
    if (projectManager) {
      try {
        const lottieJson = exportToLottie(projectManager);
        await saveLottieFile(lottieJson);
        alert('Lottie file export initiated. Check main process console for save path/errors.');
      } catch (error) {
        console.error('Error exporting to Lottie:', error);
        alert(`Failed to export Lottie: ${error}`);
      }
    }
  };

  const animate = useCallback(() => {
    // isPlaying check moved to useEffect for starting/stopping
    if (!renderer) { // Check if renderer is null
        animationFrameId.current = null;
        return;
    }

    const newTime = Date.now() - startTimeRef.current;
    
    if (newTime > animationDuration) {
        setCurrentTime(animationDuration);
        const finalProps = calculateAnimatedProperties(projectRef.current, animationDuration);
        renderer.updateFrame(finalProps);
        renderer.draw();
        setIsPlaying(false); // Stop the animation
        console.log('Animation complete');
        animationFrameId.current = null;
        return;
    }
    
    setCurrentTime(newTime);
    const animatedProps = calculateAnimatedProperties(projectRef.current, newTime);
    renderer.updateFrame(animatedProps);
    renderer.draw();

    animationFrameId.current = requestAnimationFrame(animate);
  }, [renderer, animationDuration]); // Removed isPlaying from here

  useEffect(() => {
    if (isPlaying && renderer) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, renderer, animate]);


  useEffect(() => {
    const canvasContainer = document.getElementById('renderer-container');
    if (canvasContainer && !renderer) {
      const newRenderer = new CanvasRenderer('renderer-container', 800, 600);
      setRenderer(newRenderer);
      // projectManager is initialized with DEFAULT_PROJECT_JSON, so load it
      newRenderer.loadProject(projectManager);
      // Render initial frame
      const initialProps = calculateAnimatedProperties(projectManager, 0);
      newRenderer.updateFrame(initialProps);
      newRenderer.draw();
    }
  }, [renderer, projectManager]); // projectManager added to ensure initial load

  return (
    <div className="App">
      <header className="App-header">
        <h1>Haiku NextGen MVP Editor</h1>
      </header>
      <div className="controls">
        <textarea
          rows={15}
          cols={80}
          placeholder="Paste HaikuProject JSON here..."
          value={projectJson}
          onChange={(e) => setProjectJson(e.target.value)}
        />
        <button onClick={loadProjectFromJson}>Load Project from JSON</button>
      </div>
      <div className="playback-controls">
        <button onClick={handlePlay} disabled={isPlaying}>Play</button>
        <button onClick={handlePause} disabled={!isPlaying}>Pause</button>
        <button onClick={handleExportLottie}>Export Lottie</button>
      </div>
      <p>Current Time: {Math.floor(currentTime / 10) / 100}s / {animationDuration / 1000}s</p>
      <div id="renderer-container" style={{ width: 800, height: 600, border: '1px solid #ccc', marginTop: '10px', backgroundColor: '#fff' }}></div>
    </div>
  );
};

export default App;

import React, { useEffect, useRef } from 'react';
import { CanvasRenderer } from 'haiku-rendering-engine-canvas/renderer';
import { HaikuProject } from 'haiku-core-logic/types';

interface RendererComponentProps {
  project: HaikuProject;
  currentTime: number;
  rendererRef: React.MutableRefObject<CanvasRenderer | null>; // Allow App to access renderer
}

const RendererComponent: React.FC<RendererComponentProps> = ({ project, currentTime, rendererRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !rendererRef.current) {
      const newRenderer = new CanvasRenderer(containerRef.current.id, 800, 600);
      rendererRef.current = newRenderer; // Assign to the ref passed from App
      if (project.elements.length > 0 || Object.keys(project.timelines).length > 0) {
        newRenderer.loadProject(project);
      }
    }
  }, [project, rendererRef]); // Ensure project changes also trigger potential re-load if renderer existed

  // The animation loop and frame updates are handled in App.tsx
  // This component is primarily responsible for providing the mount point for Konva.

  return <div id="canvas-renderer-mvp" ref={containerRef} style={{ width: 800, height: 600, border: '1px solid #ddd', margin: '10px auto' }} />;
};

export default RendererComponent;

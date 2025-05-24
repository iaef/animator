import Konva from 'konva';
import { HaikuProject, HaikuElement } from 'haiku-nextgen/packages/core-logic/src/types'; // Adjust path as needed

export class CanvasRenderer {
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private shapes: Map<string, Konva.Shape> = new Map(); // Map HaikuElement.id to Konva.Shape

  constructor(containerId: string, width: number, height: number) {
    this.stage = new Konva.Stage({
      container: containerId,
      width: width,
      height: height,
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  loadProject(project: HaikuProject): void {
    this.layer.destroyChildren(); // Clear previous project
    this.shapes.clear();

    project.elements.forEach(element => {
      let konvaShape: Konva.Shape;
      if (element.type === 'rectangle') {
        konvaShape = new Konva.Rect({
          id: element.id,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          fill: element.fill,
          opacity: element.opacity,
        });
      } else if (element.type === 'ellipse') {
        // Konva Ellipse needs radiusX and radiusY
        konvaShape = new Konva.Ellipse({
          id: element.id,
          x: element.x + element.width / 2, // Konva Ellipse x,y is center
          y: element.y + element.height / 2, // Konva Ellipse x,y is center
          radiusX: element.width / 2,
          radiusY: element.height / 2,
          fill: element.fill,
          opacity: element.opacity,
        });
      } else {
        console.warn(`Unsupported element type: ${element.type}`);
        return;
      }
      this.shapes.set(element.id, konvaShape);
      this.layer.add(konvaShape);
    });
    this.draw();
  }

  updateFrame(elementProperties: Map<string, Partial<HaikuElement>>): void {
    elementProperties.forEach((props, elementId) => {
      const shape = this.shapes.get(elementId);
      if (shape) {
        // Special handling for ellipse center based on x, y, width, height
        if (shape instanceof Konva.Ellipse) {
          const currentAttrs = shape.getAttrs();
          let newX = currentAttrs.x;
          let newY = currentAttrs.y;
          let newRadiusX = currentAttrs.radiusX;
          let newRadiusY = currentAttrs.radiusY;

          if (props.x !== undefined) newX = props.x + (props.width !== undefined ? props.width / 2 : currentAttrs.radiusX);
          else if (props.width !== undefined) newX = currentAttrs.x - currentAttrs.radiusX + props.width / 2;
          
          if (props.y !== undefined) newY = props.y + (props.height !== undefined ? props.height / 2 : currentAttrs.radiusY);
          else if (props.height !== undefined) newY = currentAttrs.y - currentAttrs.radiusY + props.height / 2;

          if (props.width !== undefined) newRadiusX = props.width / 2;
          if (props.height !== undefined) newRadiusY = props.height / 2;
          
          shape.setAttrs({
            x: newX,
            y: newY,
            radiusX: newRadiusX,
            radiusY: newRadiusY,
            fill: props.fill,
            opacity: props.opacity,
          });

        } else { // For Rectangle and other potential shapes
          shape.setAttrs(props);
        }
      }
    });
  }

  draw(): void {
    this.layer.batchDraw();
  }
}

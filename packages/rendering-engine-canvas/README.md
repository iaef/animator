# Haiku Rendering Engine - Canvas (`packages/rendering-engine-canvas`)

## Module Purpose

This module is responsible for rendering Haiku animation projects onto an HTML5 Canvas. It uses the Konva.js library to manage and draw shapes.

## Key Responsibilities

-   **Canvas Initialization**: The `CanvasRenderer` class initializes a Konva Stage and Layer within a specified HTML container element.
-   **Project Loading**: It takes a `HaikuProject` (typically managed by `HaikuProjectManager` from `core-logic`) and creates corresponding Konva shapes (Rectangles, Ellipses for MVP) for each `HaikuElement`.
-   **Frame Updates**: It provides an `updateFrame` method that accepts a map of element properties (as calculated by `core-logic`) and updates the attributes (position, size, fill, opacity) of the Konva shapes.
-   **Drawing**: The `draw` method triggers a batch draw on the Konva layer, rendering the current state of all shapes to the canvas.

## Interactions with Other Modules

-   **`core-logic`**:
    -   Consumes `HaikuProject` and `HaikuElement` types for project loading.
    -   `updateFrame` method consumes the output of `calculateAnimatedProperties` (from `core-logic`) to apply animated values to shapes.
-   **`ui-editor`**:
    -   Instantiates and manages the `CanvasRenderer`.
    -   Passes project data to `loadProject`.
    -   Calls `updateFrame` and `draw` repeatedly within its animation loop to display the animation.

# Haiku Core Logic (`packages/core-logic`)

## Module Purpose

This module is the heart of the Haiku NextGen animation definition and runtime calculation. It provides the fundamental data structures for representing animation projects and the logic for calculating animated properties at any given time. It is UI-agnostic.

## Key Responsibilities

-   **Data Structures**: Defines TypeScript interfaces for `HaikuProject`, `HaikuElement`, `Timeline`, and `Keyframe`. These structures form the schema for Haiku animation projects.
-   **Project Management**: The `HaikuProjectManager` class allows for programmatic creation and modification of Haiku projects (adding elements, setting timelines).
-   **Animation Calculation**: The `calculateAnimatedProperties` function takes a Haiku project and a specific time, and computes the state of all animatable properties for all elements at that instant. For the MVP, this involves linear interpolation for numeric properties and simple switching for color properties.

## Interactions with Other Modules

-   **`rendering-engine-canvas`**: Consumes the output of `calculateAnimatedProperties` to update the visual representation of elements on the canvas. It also uses `HaikuProject` (via `HaikuProjectManager`) to initially load and draw elements.
-   **`ui-editor`**:
    -   Uses `HaikuProjectManager` to create or load project data (e.g., from user input JSON).
    -   Passes the `HaikuProjectManager` instance to `calculateAnimatedProperties` to get data for the renderer during playback.
-   **`lottie-exporter`**: Takes a `HaikuProjectManager` instance as input and traverses its `elements` and `timelines` to convert the animation into Lottie JSON format. It may use `calculateAnimatedProperties` for static frame exports or directly process timeline data for animated exports.

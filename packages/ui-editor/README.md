# Haiku UI Editor (`packages/ui-editor`)

## Module Purpose

This module provides the user interface for the Haiku NextGen Animator MVP. It's a React application running within an Electron wrapper, allowing users to load animation projects, control playback, and initiate exports.

## Key Responsibilities

-   **Main Application UI**: The `App.tsx` component serves as the root of the UI, managing overall application state and layout.
-   **Project Loading**: Provides a textarea for users to paste Haiku project data in JSON format and a button to load it into the application.
-   **Animation Playback**:
    -   Integrates with `core-logic` and `rendering-engine-canvas` to display the animation.
    -   Offers "Play" and "Pause" controls.
    -   Displays the current animation time.
-   **Lottie Export**: Includes a button to trigger the export of the current project to Lottie JSON format, utilizing the `lottie-exporter` and `project-io` modules.
-   **Renderer Integration**: Manages the lifecycle of the `CanvasRenderer` and provides it with the necessary data for display.

## Interactions with Other Modules

-   **`core-logic`**:
    -   Uses `HaikuProjectManager` to manage the loaded project data.
    -   Calls `calculateAnimatedProperties` to get frame-by-frame property values for the animation.
-   **`rendering-engine-canvas`**:
    -   Instantiates `CanvasRenderer` to display the animation.
    -   Passes project data and animated properties to the renderer.
-   **`lottie-exporter`**:
    -   Calls `exportToLottie` to convert the current project into Lottie format.
-   **`project-io`**:
    -   Uses `saveLottieFile` to trigger the file save dialog (via Electron IPC) for the exported Lottie JSON.
-   **Electron Environment**:
    -   Runs as the renderer process in Electron.
    -   Communicates with the Electron main process (`electron/main.ts`) via preload script (`electron/preload.ts`) for actions like file saving.

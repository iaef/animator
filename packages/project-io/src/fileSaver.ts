// This defines the structure of the API exposed by electron/preload.ts
interface ElectronAPI {
  send: (channel: string, data: any) => void;
  // If you were to add receive methods:
  // receive: (channel: string, func: (...args: any[]) => void) => void;
}

// Augment the Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

import { LottieJSON } from 'haiku-lottie-exporter/types'; // Assuming LottieJSON is exported from here

export async function saveLottieFile(lottieJson: LottieJSON): Promise<void> {
  if (window.electronAPI && typeof window.electronAPI.send === 'function') {
    window.electronAPI.send('save-lottie', lottieJson);
    console.log('Save Lottie request sent to main process.');
    // For MVP, we don't await confirmation from main process.
    // In a fuller implementation, you might use a two-way IPC to get success/failure.
    return Promise.resolve();
  } else {
    console.error('Electron API for saving files is not available.');
    alert('File saving is not available in this environment.');
    return Promise.reject(new Error('Electron API not available.'));
  }
}

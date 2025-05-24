import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel: string, data: any) => {
    // Whitelist channels
    const validChannels = ['save-lottie'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`Attempted to send message on invalid channel: ${channel}`);
    }
  },
  // If you need to receive messages back from the main process,
  // you'll need to use ipcRenderer.on and manage listeners carefully.
  // For MVP, we're keeping it simple with one-way (renderer to main) for save.
  // receive: (channel: string, func: (...args: any[]) => void) => {
  //   const validChannels = ['save-lottie-success', 'save-lottie-error'];
  //   if (validChannels.includes(channel)) {
  //     ipcRenderer.on(channel, (event, ...args) => func(...args));
  //   } else {
  //     console.warn(`Attempted to receive message on invalid channel: ${channel}`);
  //   }
  // }
});

console.log('Preload script loaded.');

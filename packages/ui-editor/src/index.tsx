import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Ensure the root div exists in index.html
const rootElement = document.getElementById('root');
if (!rootElement) {
  const newRootElement = document.createElement('div');
  newRootElement.id = 'root';
  document.body.appendChild(newRootElement);
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Polyfill for STOMP/SockJS - Must be at the very top before any other imports
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: { NODE_ENV: 'development' } };
}
if (typeof (window as any).Buffer === 'undefined') {
  (window as any).Buffer = {
    isBuffer: () => false,
    from: () => [],
    alloc: () => [],
    concat: () => [],
  };
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './i18n'; // Import i18n configuration
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)

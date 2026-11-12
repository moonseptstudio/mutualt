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
import { HelmetProvider } from 'react-helmet-async';
import './i18n'; // Import i18n configuration
import './index.css'

/**
 * index.html ships a full set of static SEO tags so that crawlers which do not
 * execute JavaScript (Facebook, WhatsApp, LinkedIn, Slack...) still get a title,
 * description and share image. React 19 hoists the <SEO> component's tags into
 * <head> but has no idea those static tags exist, so without this cleanup every
 * page would end up with two <title> elements, two descriptions and - worst of
 * all - two conflicting <link rel="canonical"> values, which makes search
 * engines discard the canonical hint entirely.
 *
 * Runs once, before the first render, so the React-managed tags are the only
 * ones left in the document.
 */
const removeStaticSeoTags = () => {
  document.querySelectorAll('[data-seo-static]').forEach((el) => el.remove());
};

removeStaticSeoTags();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Font imports
import "@fontsource/space-grotesk";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/bai-jamjuree";
import "@fontsource/fraunces/900-italic.css";
import "@fontsource/noto-serif-thai/700.css";
import "@fontsource/noto-sans-thai";
import "@fontsource/noto-sans-thai/700.css";
import "@fontsource/jetbrains-mono";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/ux-premium.css";

import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/Toaster";
import HotkeysModal from "./components/HotkeysModal";
import WelcomeTour from "./components/WelcomeTour";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider><App /><Toaster /><HotkeysModal /><WelcomeTour /></ThemeProvider>
  </React.StrictMode>
);

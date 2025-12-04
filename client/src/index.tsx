import { StrictMode } from "react";
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom";
import type { Root } from "react-dom/client"

import "@/css/index.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { App } from "@/Application";
import { Providers } from "@/src/Providers";

const container: HTMLElement | null = document.getElementById("root");
if (container) {
  const root: Root = createRoot(container);
  root.render(
    <StrictMode>
      <BrowserRouter>
        <Providers>
          <App />
        </Providers>
      </BrowserRouter>
    </StrictMode>
  );
} else {
  throw Error("Root element not found");
}

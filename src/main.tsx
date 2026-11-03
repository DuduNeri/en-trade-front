import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

import App from "./App.tsx";
import "./index.css";

function ErrorFallback({ error }: FallbackProps) {
  return (
    <div style={{ padding: "20px", color: "red", fontFamily: "var(--mono)" }}>
      <h2>Algo deu errado na aplicação!</h2>
      <pre>{error instanceof Error ? error.message : String(error)}</pre>
    </div>
  );
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
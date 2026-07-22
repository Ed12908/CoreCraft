import { ReactFlowProvider } from "@xyflow/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@xyflow/react/dist/style.css";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element #root was not found.");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </React.StrictMode>,
);

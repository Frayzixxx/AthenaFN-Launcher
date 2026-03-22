import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import axiosRetry from "axios-retry";
import Main from "./router";
import { API_BASE_URL } from "./config";

axiosRetry(axios, { retries: 3 });
axios.defaults.baseURL = API_BASE_URL;

const root = ReactDOM.createRoot(document.getElementById("root")!);
window.addEventListener("contextmenu", (e) => e.preventDefault());

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
 
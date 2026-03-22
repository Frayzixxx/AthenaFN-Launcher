import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./login";
import Onboard from "./onboard";
import Settings from "./settings";
import { checkAndApplyLauncherUpdate } from "./utils/updater";

function Main() {
  useEffect(() => {
    void checkAndApplyLauncherUpdate();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboard" element={<Onboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default Main;

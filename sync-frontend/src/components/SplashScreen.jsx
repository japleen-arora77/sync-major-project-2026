import React from "react";
import "./splashScreen.css";
import sync_logo from "./Sync-splash.png";
const SplashScreen = () => {
  return (
    <div className="splash-container">
      <img
        src={sync_logo} // replace later
        alt="logo"
        className="splash-logo"
      />
      {/* <h2 className="splash-text">Sync</h2> */}
    </div>
  );
};

export default SplashScreen;
import React from "react";

function Header() {
  return (
    <div className="header">
      <h1>Dog breed identifier</h1>
      <span style={{ textTransform: "none", marginBottom: "30px" }}>
        Built with TensorFlow.js and React.js
      </span>
    </div>
  );
}

export default Header;

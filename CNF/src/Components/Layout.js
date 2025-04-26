import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer"; // Make sure this path is correct for your project
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Navbar />
      <div className="content-wrap">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;

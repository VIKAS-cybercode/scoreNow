// Footer.js
import React, { useState } from "react";
import "./Footer.css";
import AboutUsModal from "./AboutUsModal";

const Footer = () => {
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);

  return (
    <>
      <footer className="footer">
        <div className="footer__section">
          <a href="/">Home</a>
        </div>
        <div className="footer__section">
          <button className="footer-button" onClick={() => setIsAboutUsOpen(true)}>
            About Us
          </button>
        </div>
        <div className="footer__section">
          <a className="footer-button" href="mailto:support@example.com">
            Contact
          </a>
        </div>
      </footer>
      <AboutUsModal isOpen={isAboutUsOpen} onClose={() => setIsAboutUsOpen(false)} />
    </>
  );
};

export default Footer;

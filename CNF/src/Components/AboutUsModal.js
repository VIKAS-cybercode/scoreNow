// AboutUsModal.js
import React from "react";
import Modal from "./Modal";
import { FaGithub, FaEnvelope, FaLinkedin } from "react-icons/fa";
import "./AboutUsModal.css";

const teamMembers = [
  { name: "Vikas", github: "https://github.com/VIKAS-cybercode", gmail: "mailto:vikas.20bg@gmail.com", linkedin: "https://www.linkedin.com/in/vikas-kumar203/" },
  { name: "Aditya Parmar", github: "https://github.com/aditya051102", gmail: "mailto:adityaparmar@example.com", linkedin: "https://www.linkedin.com/in/adityaparmar" },
  { name: "Aditya Baranwal", github: "https://github.com/adityabaranwal0101", gmail: "mailto:adityabaranwal0101@gmail.com", linkedin: "https://www.linkedin.com/in/aditya-baranwal03/" },
  { name: "Aniket Singh", github: "https://github.com/aniketsingh972", gmail: "mailto:aniketsinhh3@gmail.com", linkedin: "https://www.linkedin.com/in/aniketsingh972/" },
  { name: "Mrinal Sharma", github: "https://github.com/MrinalSharma87", gmail: "mailto:mrinalsha4ma07@gmail.com", linkedin: "https://www.linkedin.com/in/mrinalsharma087/" },
];

const AboutUsModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} className="aboutus-modal">
    <h2 className="about-us-heading">Meet the Team</h2>
    <div className="aboutus-container">
      {teamMembers.map(member => (
        <div key={member.name} className="member-card">
          <div className="member-avatar">{member.name.charAt(0)}</div>
          <h3 className="member-name">{member.name}</h3>
          <div className="member-icons">
            <a href={member.github} target="_blank" rel="noopener noreferrer" title="GitHub">
              <FaGithub size={24} />
            </a>
            <a href={member.gmail} title="Email">
              <FaEnvelope size={24} />
            </a>
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <FaLinkedin size={24} />
            </a>
          </div>
        </div>
      ))}
    </div>
  </Modal>
);

export default AboutUsModal;

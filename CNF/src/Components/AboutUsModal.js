// AboutUsModal.js
import React from "react";
import Modal from "./Modal";
import { FaGithub, FaEnvelope, FaLinkedin } from "react-icons/fa";
import "./AboutUsModal.css";

const teamMembers = [
  {
    name: "Vikas",
    github: "https://github.com/vikas",
    gmail: "mailto:vikas@example.com",
    linkedin: "https://www.linkedin.com/in/vikas",
  },
  {
    name: "Aditya Parmar",
    github: "https://github.com/adityaparmar",
    gmail: "mailto:adityaparmar@example.com",
    linkedin: "https://www.linkedin.com/in/adityaparmar",
  },
  {
    name: "Aditya Baranwal",
    github: "https://github.com/adityabaranwal",
    gmail: "mailto:adityabaranwal@example.com",
    linkedin: "https://www.linkedin.com/in/adityabaranwal",
  },
  {
    name: "Aniket Singh",
    github: "https://github.com/aniketsingh",
    gmail: "mailto:aniketsingh@example.com",
    linkedin: "https://www.linkedin.com/in/aniketsingh",
  },
  {
    name: "Mrinal Sharma",
    github: "https://github.com/mrinalsharma",
    gmail: "mailto:mrinalsharma@example.com",
    linkedin: "https://www.linkedin.com/in/mrinalsharma",
  },
];

const AboutUsModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="about-us-heading">About Us</h2>
      <ul className="aboutus-list">
        {teamMembers.map((member) => (
          <li key={member.name} className="aboutus-list-item">
            <strong>{member.name}</strong>
            <br />
            <a
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              className="aboutus-icon-link"
              title="GitHub"
            >
              <FaGithub size={24} color="orange" />
            </a>
            <a
              href={member.gmail}
              className="aboutus-icon-link"
              title="Email"
            >
              <FaEnvelope size={24} color="white" />
            </a>
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="aboutus-icon-link"
              title="LinkedIn"
            >
              <FaLinkedin size={24} color="#4fc3f7" />
            </a>
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default AboutUsModal;

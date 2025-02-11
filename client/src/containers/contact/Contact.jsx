import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import "./contact.css";
import Navbar from "../../components/navbar/Navbar"; 
import team1 from "../../assets/logo.png"; 
import team2 from "../../assets/logo.png";
import team3 from "../../assets/logo.png";

const Contact = () => {
  const form = useRef();
  const [status, setStatus] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      form.current,
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    )
    .then(
      () => {
        setStatus("Feedback Submitted Successfully!");
        form.current.reset();
      },
      () => {
        setStatus("Failed to submit feedback. Try again.");
      }
    );
  };

  return (
    <div className="contact-container">
      <Navbar />

      <div className="contact-content">
        <div className="team-section">
          <h4 className="team-subtitle">Our Team</h4>
          <h2 className="team-title">Our Creative Team</h2>
          <p className="team-description">
            Meet the experts behind ProctorAI. Dedicated to innovation, security, and technology.
          </p>
          <div className="team-grid">
            <div className="team-card">
              <img src={team1} alt="Himanshu Kumar Modi" />
              <h3>Himanshu Kumar Modi</h3>
              {/* <p>Marketing Expert</p> */}
              <div className="social-links">
                <a href="https://github.com/melissa" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github"></i>
                </a>
                <a href="https://linkedin.com/in/melissa" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="https://instagram.com/melissa" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>

            <div className="team-card">
              <img src={team2} alt="Piyush Kumar" />
              <h3>Piyush Kumar</h3>
              {/* <p>Digital Marketer</p> */}
              <div className="social-links">
                <a href="https://github.com/stuard" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github"></i>
                </a>
                <a href="https://linkedin.com/in/stuard" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="https://instagram.com/stuard" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>

            <div className="team-card">
              <img src={team3} alt="Piyush Padia" />
              <h3>Piyush Padia</h3>
              {/* <p>Creative Designer</p> */}
              <div className="social-links">
                <a href="https://github.com/eva" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github"></i>
                </a>
                <a href="https://linkedin.com/in/eva" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="https://instagram.com/eva" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="form-section">
          <h2>Feedback Form</h2>
          <form ref={form} onSubmit={sendEmail}>
            <label>Name</label>
            <input type="text" name="user_name" required placeholder="John Doe" />

            <label>Email</label>
            <input type="email" name="user_email" required placeholder="johndoe@xyz.com" />

            <label>Feedback</label>
            <textarea name="message" rows="5" required placeholder="Hi, I'd like to give feedback..."></textarea>

            <div className="button-container">
                <button type="submit">Send Message</button>
</div>
          </form>
          {status && <p className="status-message">{status}</p>}
        </div>
      </div>
    </div>
  );
};

export default Contact;

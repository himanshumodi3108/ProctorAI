import React from "react";
import "./about.css";
// import proctorAILogo from "../../assets/logo.png"; // Ensure this matches your file path
import Navbar from "../../components/navbar/Navbar"; // Import Navbar

const About = () => {
  return (
    <div className="about-container">
      {/* Add Navbar at the top */}
      <Navbar />
      <div className="padding-bottom = 2px"></div>

      {/* Header Section */}
      <div className="about-header">
        {/* <img src={proctorAILogo} alt="ProctorAI Logo" className="logo" /> */}
        <h1>ProctorAI</h1>
        <p>Revolutionizing Online Proctoring with Artificial Intelligence</p>
      </div>

      {/* Project Overview */}
      <div className="about-section">
        <h2>Project Overview</h2>
        <p>
          ProctorAI is an advanced AI-powered proctoring solution designed to maintain academic integrity during online 
          examinations. It provides <span style={{ fontWeight: 'bold' }}>real-time monitoring</span>, <span style={{ fontWeight: 'bold' }}>behavior analysis</span>, and <span style={{ fontWeight: 'bold' }}>cheating prevention</span> mechanisms.
        </p>
        <p>
          This system is primarily used for <span style={{ fontWeight: 'bold' }}>monitoring online tests conducted using Google Forms, Microsoft Forms, and other examination platforms</span>.  
          It leverages <span style={{ fontWeight: 'bold' }}>TensorFlow</span> and <span style={{ fontWeight: 'bold' }}>OpenCV</span> for <span style={{ fontWeight: 'bold' }}>human presence detection</span> and <span style={{ fontWeight: 'bold' }}>mobile usage detection</span> to prevent unfair means during exams.
        </p>
        <p>
          ProctorAI ensures <span style={{ fontWeight: 'bold' }}>seamless integration</span> with existing platforms, making online assessments more secure and reliable.  
          The AI-based algorithms can <span style={{ fontWeight: 'bold' }}>detect multiple faces, unauthorized device usage, suspicious behavior</span>, and even <span style={{ fontWeight: 'bold' }}>track head and eye movements</span>.
        </p>
      </div>

      {/* Key Features */}
      <div className="about-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Face Detection</h3>
            <p>Ensures consistent identity verification throughout the exam.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Detection</h3>
            <p>Detects unauthorized mobile phone usage and alerts invigilators.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🖥️</div>
            <h3>Multiple Tab Detection</h3>
            <p>Prevents candidates from accessing other browser tabs.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Monitoring</h3>
            <p>Detects suspicious activities and potential cheating attempts.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛠️</div>
            <h3>DevTools Check</h3>
            <p>Blocks access to browser developer tools to prevent manipulation.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Full-Screen Checker</h3>
            <p>Ensures the exam remains in full-screen mode, preventing distractions.</p>
          </div>
        </div>
      </div>

      {/* Our Mission */}
      <div className="about-section">
        <h2>Our Mission</h2>
        <p>
          At ProctorAI, we are committed to <span style={{ fontWeight: 'bold' }}>creating a fair and secure environment for online assessments</span>.  
          With the increasing trend of online exams, it is crucial to have a <span style={{ fontWeight: 'bold' }}>reliable proctoring system</span> that maintains academic integrity.
        </p>
        <p>
          Our mission is to develop an <span style={{ fontWeight: 'bold' }}>AI-driven proctoring solution</span> that not only prevents cheating but also provides an intuitive experience for both examiners and candidates.  
          We aim to <span style={{ fontWeight: 'bold' }}>leverage the power of AI, machine learning, and computer vision</span> to ensure <span style={{ fontWeight: 'bold' }}>fraud-proof, transparent, and scalable online testing solutions</span>.
        </p>
      </div>

      {/* Technology Stack */}
      <div className="about-section">
        <h2>Technology Stack</h2>
        <ul>
          <li><strong>React.js</strong> for frontend development</li>
          <li><strong>TensorFlow & OpenCV</strong> for behavior and face detection</li>
          <li><strong>Machine Learning</strong> for detecting suspicious movements</li>
          {/* <li><strong>Computer Vision</strong> for object recognition</li> */}
          <li><strong>Node.js</strong> for backend services</li>
          <li><strong>MongoDB</strong> for database management</li>
        </ul>
      </div>
    </div>
  );
};

export default About;

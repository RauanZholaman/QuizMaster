// src/components/Footer.jsx
import React from 'react';

const teamMembers = [
    { name: 'Ansar', link: 'https://www.linkedin.com/in/ansar-daniyaruly/' },
    { name: 'Rauan', link: 'https://www.linkedin.com/in/rauan-zholaman/' },
    { name: 'Jian Xin', link: 'https://www.linkedin.com/in/jian-xin-png-8790a6163/' },
    { name: 'Chan',  link: 'https://www.linkedin.com/in/chan-myae-thinzar-tun-2249a2364/' },
    { name: 'Thin',  link: '#' },
    { name: 'May',   link: 'https://www.linkedin.com/in/may-thu-kyaing-838664364/' },
  ];

export default function Footer() {
    return (
    <footer className="modern-footer">
        <div className="footer-content">
        
            {/* Section 1: Brand & Logo */}
            <div className="footer-section brand">
                <h2 className="footer-logo">QuizMaster</h2>
                <p className="footer-tagline">
                    Empowering learning through interactive quizzes.
                </p>
            </div>

            {/* Section 2: The Team */}
            <div className="footer-section team">
                <h3>Created by Group B</h3>
                <div className="team-grid">
                    {teamMembers.map((member) => (
                        <a
                            key={member.name}
                            href={member.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {member.name}
                        </a>
                    ))}
                    {/* <span>Ansar</span>
                    <span>Rauan</span>
                    <span>Jx</span>
                    <span>Chan</span>
                    <span>Thin</span>
                    <span>May</span> */}
                </div>
            </div>

        </div>

      <div className="footer-bottom">
        <p>&copy; 2025 QuizMaster. All rights reserved.</p>
      </div>
    </footer>
    );
}
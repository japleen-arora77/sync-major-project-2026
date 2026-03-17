import React from "react";
import "./footer.css";
import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer
      className="footer mt-5"
      data-aos="fade-up"
      data-aos-duration="700"
    >
      <Container className="text-center py-4">
        <p className="footer-text mb-3">
          Sync, built by
          <strong> Japleen Arora</strong>{" "}
          <span className="heart">🤗</span> |
          <a
            href="mailto:arorajapleen.cs2277@gmail.com"
            className="email-link"
          >
            {" "}arorajapleen.cs2277@gmail.com
          </a>
        </p>

        <div className="social-icons">
          <a
            href="https://github.com/japleen-arora77"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-link"
          >
            <i className="bi bi-github"></i>
          </a>

          <a
            href="https://www.linkedin.com/in/japleen-arora-17158929a/"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-link"
          >
            <i className="bi bi-linkedin"></i>
          </a>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

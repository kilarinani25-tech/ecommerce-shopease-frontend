import React from "react";
import { Link } from "react-router-dom";
import "../styling/Home.css"; // Uses the unified stylesheet
import "../styling/Footer.css"
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand-section">
          <h3 className="footer-logo">ShopEase</h3>
          <p className="footer-tagline">
            Discover amazing products at the best prices. Your ultimate shopping destination for electronics, fashion, and more.
          </p>
          <div className="footer-socials">
            <a href="#facebook" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
            <a href="#twitter" aria-label="Twitter"><i className="bi bi-twitter"></i></a>
            <a href="#instagram" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
            <a href="#linkedin" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-links-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="#products">Featured Products</a></li>
            <li><Link to="/cart">View Cart</Link></li>
            <li><a href="#offers">Special Offers</a></li>
          </ul>
        </div>

        {/* Customer Service Column */}
        <div className="footer-links-col">
          <h4>Customer Service</h4>
          <ul>
            <li><a href="#contact">Contact Us</a></li>
            <li><a href="#track">Track Order</a></li>
            <li><a href="#returns">Returns & Refunds</a></li>
            <li><a href="#faq">FAQs</a></li>
          </ul>
        </div>

        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <h4>Stay Updated</h4>
          <p>Subscribe to receive updates, access to exclusive deals, and more.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="newsletter-input" 
              required 
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ShopEase. All rights reserved.</p>
        <div className="footer-legal-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
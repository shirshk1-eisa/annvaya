import { Link } from 'react-router-dom';
import { FiHeart, FiInstagram, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi';
import logoImg from '../../assets/images/logo.png';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-logo">
              <img src={logoImg} alt="Annvaya" className="footer-logo-img" />
              Annvaya
            </span>
            <p className="footer-desc">
              Bridging the gap between surplus food and hungry stomachs.
              Every meal shared is a life touched. Join us in making no food go to waste.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><FiInstagram /></a>
              <a href="#" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" aria-label="LinkedIn"><FiLinkedin /></a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/map">Explore Map</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>For NGOs</h4>
            <ul className="footer-links">
              <li><Link to="/register">Register NGO</Link></li>
              <li><Link to="/login">NGO Login</Link></li>
              <li><a href="#">Verification</a></li>
              <li><a href="#">Resources</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Annvaya. All rights reserved.</p>
          <p>
            Made with <FiHeart className="footer-heart" style={{ display: 'inline', verticalAlign: 'middle' }} /> for a
            hunger-free world
          </p>
        </div>
      </div>
    </footer>
  );
}

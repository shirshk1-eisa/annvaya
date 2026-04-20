import logoImg from '../assets/images/logo.png';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="auth-page" id="login-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <img src={logoImg} alt="Annvaya Logo" className="auth-visual-logo" />
          <h2 className="auth-visual-title">Welcome Back to Annvaya</h2>
          <p className="auth-visual-desc">
            Continue your journey of sharing food and spreading joy.
            Every meal matters. Every donor counts.
          </p>
        </div>
      </div>
      <div className="auth-form-wrapper">
        <LoginForm />
      </div>
    </div>
  );
}

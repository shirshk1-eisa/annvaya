import logoImg from '../assets/images/logo.png';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="auth-page" id="register-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <img src={logoImg} alt="Annvaya Logo" className="auth-visual-logo" />
          <h2 className="auth-visual-title">Join the Annvaya Community</h2>
          <p className="auth-visual-desc">
            Whether you want to donate surplus food or receive it for your organization — 
            let's build a hunger-free community together.
          </p>
        </div>
      </div>
      <div className="auth-form-wrapper">
        <RegisterForm />
      </div>
    </div>
  );
}

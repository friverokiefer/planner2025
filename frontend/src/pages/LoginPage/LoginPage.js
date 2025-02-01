// frontend/src/pages/LoginPage/LoginPage.js
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/LoginForm/LoginForm';
import PropTypes from 'prop-types'; // Importamos PropTypes
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const handleLogin = async token => {
    // Utiliza onLogin de App.js para actualizar el estado
    onLogin(token);
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Iniciar Sesión</h2>
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
}

// Definimos las propTypes
LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default LoginPage;

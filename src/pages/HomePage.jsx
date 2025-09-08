// src/pages/HomePage.jsx - УПРОЩЕННАЯ ВЕРСИЯ

import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import './HomePage.css';

export default function HomePage({ user, setUser }) {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      const credential = GoogleAuthProvider.credential(idToken);
      // Просто входим в Firebase. Слушатель в App.jsx сделает все остальное.
      await signInWithCredential(auth, credential);
      // Навигация теперь происходит в слушателе в App.jsx
    } catch (error) {
      console.error("Ошибка при входе в Firebase:", error);
      alert("Произошла ошибка аутентификации. Пожалуйста, попробуйте еще раз.");
    }
  };

  const handleLoginError = () => {
    console.error('Ошибка входа через Google');
    alert("Не удалось войти. Пожалуйста, попробуйте еще раз.");
  };

  const logout = () => {
    // Выход из Firebase
    getAuth().signOut();
    setUser(null); // Дополнительно очищаем состояние
    navigate('/');
  };

  if (user) {
    // Этот блок теперь в основном для кнопки "Выйти"
    return (
      <div className="home-container">
        <div className="card">
          <img src={user.picture} alt="User Avatar" className="avatar"/>
          <h1>Вы уже вошли в систему</h1>
          <p>Перейдите в рабочую область или выйдите из аккаунта.</p>
          <div className="button-group">
            <button className="button-primary" onClick={() => navigate('/generator')}>
              К Генератору
            </button>
            <button className="button-secondary" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
       <div className="card">
          <h1>Система создания и хранения промтов</h1>
          <p className="subtitle">Войдите в свой аккаунт, чтобы сохранять шаблоны и управлять своей персональной библиотекой промтов.</p>
          <div className="google-login-button-container">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
            />
          </div>
       </div>
    </div>
  );
}
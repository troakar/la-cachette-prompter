// src/pages/HomePage.jsx

import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Установите axios: npm install axios
import './HomePage.css';

// Принимаем user и setUser из пропсов
export default function HomePage({ user, setUser }) {
  const navigate = useNavigate();

  // Хук для логина. Он дает нам функцию login
  const login = useGoogleLogin({
    // Эта функция сработает при успешном входе
    onSuccess: async (tokenResponse) => {
      try {
        // Получив токен, запрашиваем информацию о пользователе
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        // Сохраняем данные пользователя в состоянии
        setUser(userInfo.data);
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
      }
    },
    onError: () => {
      console.error('Ошибка входа');
    },
  });

  // Функция для выхода
  const logout = () => {
    // Просто очищаем состояние пользователя
    setUser(null);
  };

  // Если пользователь УЖЕ вошел в систему (user не null)
  if (user) {
    return (
      <div className="home-container">
        <div className="card">
          <img 
            src={user.picture || '/default-avatar.png'} 
            alt="User Avatar" 
            className="avatar"
          />
          <h1>Добро пожаловать, {user.name}!</h1>
          <p>Вы вошли как <strong>{user.email}</strong>.</p>
          <p className="subtitle">Теперь вы можете создавать и сохранять свои промты. Они будут доступны только вам.</p>
          <div className="button-group">
            <button 
              className="button-primary" 
              onClick={() => navigate('/generator')}
            >
              К моим промтам
            </button>
            <button className="button-secondary" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Если пользователь НЕ вошел в систему
  return (
    <div className="home-container">
       <div className="card">
          <h1>Система создания и хранения промтов</h1>
          <p className="subtitle">Войдите в свой аккаунт, чтобы сохранять шаблоны и управлять своей персональной библиотекой промтов.</p>
          <button 
            className="button-google" 
            onClick={() => login()} // При клике вызываем функцию login из хука
          >
            <img src="/google-logo.svg" alt="Google logo" />
            Войти через Google
          </button>
       </div>
    </div>
  );
}
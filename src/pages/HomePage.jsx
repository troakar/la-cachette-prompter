// src/pages/HomePage.jsx - АКТУАЛЬНАЯ ПОЛНАЯ ВЕРСИЯ

import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Убедитесь, что axios установлен: npm install axios
import './HomePage.css'; // Убедитесь, что этот файл стилей существует

// Компонент принимает user (объект пользователя) и setUser (функция для его установки) из App.jsx
export default function HomePage({ user, setUser }) {
  const navigate = useNavigate();

  // Используем хук из библиотеки @react-oauth/google
  const login = useGoogleLogin({
    // Эта функция автоматически вызывается при успешном входе в Google
    onSuccess: async (tokenResponse) => {
      try {
        // Получив токен доступа, мы делаем запрос к Google API, чтобы получить информацию о пользователе
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        
        // userInfo.data будет содержать объект вида:
        // { sub: "123...", name: "...", given_name: "...", picture: "...", email: "..." }
        // Мы сохраняем весь этот объект в глобальном состоянии нашего приложения
        setUser(userInfo.data);

        // После успешного входа и получения данных, перенаправляем пользователя на страницу генератора
        navigate('/generator');

      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
        alert("Не удалось получить информацию о пользователе. Попробуйте еще раз.");
      }
    },
    // Эта функция вызывается, если пользователь закрыл окно входа или произошла ошибка
    onError: () => {
      console.error('Ошибка входа через Google');
      alert("Произошла ошибка при входе. Пожалуйста, попробуйте еще раз.");
    },
  });

  // Функция для выхода из системы
  const logout = () => {
    // Просто очищаем глобальное состояние пользователя
    setUser(null);
    // Можно также перенаправить на главную страницу, если пользователь вышел не с нее
    navigate('/');
  };

  // --- Условный рендеринг ---

  // Если пользователь УЖЕ вошел в систему (объект user существует)
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

  // Если пользователь НЕ вошел в систему (user равен null)
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
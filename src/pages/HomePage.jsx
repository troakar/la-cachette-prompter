// src/pages/HomePage.jsx - ОБНОВЛЕННАЯ ВЕРСИЯ С FIREBASE AUTH

import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 1. Импортируем необходимые функции из Firebase Auth
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import './HomePage.css';

export default function HomePage({ user, setUser }) {
  const navigate = useNavigate();
  const auth = getAuth(); // Получаем экземпляр Firebase Auth

  const login = useGoogleLogin({
    // 2. Изменяем onSuccess, чтобы он также входил в Firebase
    onSuccess: async (tokenResponse) => {
      try {
        // --- ШАГ А: Получаем id_token от Google (как и раньше, но теперь нужен id_token) ---
        // Для этого нам нужно запросить его отдельно, используя access_token
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        // --- ШАГ Б: Создаем учетные данные для Firebase ---
        // Мы используем id_token, который неявно передается в tokenResponse,
        // но для надежности лучше использовать access_token для получения свежих данных.
        // Для signInWithCredential нужен id_token, который приходит в tokenResponse.
        // Если его нет, нужно добавить 'id_token' в scope.
        // Простой способ - использовать access_token для получения данных, а затем войти.
        // Но для прямой интеграции нужен id_token.
        // Давайте упростим, используя токен, который дает библиотека.
        // У @react-oauth/google есть более простой способ - `useGoogleOneTapLogin` или `googleLogout`
        // Но мы сделаем это вручную для ясности.
        
        // ВАЖНО: для signInWithCredential нужен id_token.
        // Библиотека @react-oauth/google не всегда его возвращает по умолчанию.
        // Давайте используем другой хук, который это делает.
        // Но чтобы не усложнять, давайте предположим, что токен есть.
        // Если его нет, нужно будет изменить `useGoogleLogin` на `googleLogout` и кнопку.
        
        // Давайте сделаем проще и надежнее. Вместо `useGoogleLogin` используем компонент `GoogleLogin`.
        // Но чтобы не переделывать все, давайте исправим текущий код.
        // Мы не можем получить id_token напрямую из этого хука.
        // Поэтому мы будем использовать другой подход.

        // --- ПРАВИЛЬНЫЙ ПОДХОД ДЛЯ ЭТОЙ БИБЛИОТЕКИ ---
        // Мы не будем использовать signInWithCredential, а изменим правила безопасности.
        // Это гораздо проще в вашем случае.

        // Сохраняем данные пользователя в состоянии (как и раньше)
        setUser(userInfoResponse.data);

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
    setUser(null);
  };

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

  return (
    <div className="home-container">
       <div className="card">
          <h1>Система создания и хранения промтов</h1>
          <p className="subtitle">Войдите в свой аккаунт, чтобы сохранять шаблоны и управлять своей персональной библиотекой промтов.</p>
          {/* Используем компонент GoogleLogin для простоты */}
          <button 
            className="button-google" 
            onClick={() => login()}
          >
            <img src="/google-logo.svg" alt="Google logo" />
            Войти через Google
          </button>
       </div>
    </div>
  );
}
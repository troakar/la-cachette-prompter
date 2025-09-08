// src/pages/HomePage.jsx

import { useSession, signIn, signOut } from 'next-auth/react';
import { useNavigate } from 'react-router-dom'; // Для перехода на другую страницу
import './HomePage.css'; // Создадим файл со стилями

export default function HomePage() {
  // Главный хук, который дает нам данные о сессии
  const { data: session, status } = useSession();
  const navigate = useNavigate();

  // status может быть 'loading', 'authenticated', 'unauthenticated'
  // Пока идет проверка, можно показать прелоадер
  if (status === 'loading') {
    return <div className="home-container"><p>Загрузка...</p></div>;
  }

  // Если пользователь УЖЕ вошел в систему
  if (session) {
    return (
      <div className="home-container">
        <div className="card">
          <img 
            src={session.user.image || '/default-avatar.png'} 
            alt="User Avatar" 
            className="avatar"
          />
          <h1>Добро пожаловать, {session.user.name}!</h1>
          <p>Вы вошли как <strong>{session.user.email}</strong>.</p>
          <p className="subtitle">Теперь вы можете создавать и сохранять свои промты. Они будут доступны только вам.</p>
          <div className="button-group">
            <button 
              className="button-primary" 
              onClick={() => navigate('/')} // Переход на страницу генератора
            >
              К моим промтам
            </button>
            <button className="button-secondary" onClick={() => signOut()}>
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
            onClick={() => signIn('google')} // При клике вызываем вход через Google
          >
            <img src="/google-logo.svg" alt="Google logo" />
            Войти через Google
          </button>
       </div>
    </div>
  );
}
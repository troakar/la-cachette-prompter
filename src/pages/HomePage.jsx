// src/pages/HomePage.jsx - ФИНАЛЬНАЯ ВЕРСИЯ С РОДНЫМ FIREBASE AUTH

import { useNavigate } from 'react-router-dom';
// 1. Импортируем ТОЛЬКО функции из Firebase
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import './HomePage.css';

export default function HomePage({ user }) { // setUser больше не нужен здесь
  const navigate = useNavigate();
  const auth = getAuth();

  // 2. Создаем функцию для входа через Firebase
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider(); // Создаем провайдера Google
    try {
      // 3. Запускаем весь процесс входа одной командой
      // Она откроет pop-up, обработает вход и вернет результат
      await signInWithPopup(auth, provider);
      
      // 4. ВСЁ! Нам больше ничего не нужно делать.
      // Слушатель onAuthStateChanged в App.jsx автоматически обнаружит
      // успешный вход, установит пользователя и перенаправит на /generator.

    } catch (error) {
      console.error("Ошибка входа через signInWithPopup:", error);
      alert("Не удалось войти. Пожалуйста, проверьте всплывающие окна и попробуйте снова.");
    }
  };

  const handleLogout = () => {
    auth.signOut(); // Выход из Firebase. Слушатель в App.jsx обработает остальное.
  };

  if (user) {
    // Этот блок остается для тех, кто уже вошел
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
            <button className="button-secondary" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Для неавторизованных пользователей
  return (
    <div className="home-container">
       <div className="card">
          <h1>Система создания и хранения промтов</h1>
          <p className="subtitle">Войдите в свой аккаунт, чтобы сохранять шаблоны и управлять своей персональной библиотекой промтов.</p>
          <button 
            className="button-google" 
            onClick={handleGoogleSignIn} // 5. Кнопка теперь вызывает нашу новую функцию
          >
            <img src="/google-logo.svg" alt="Google logo" />
            Войти через Google
          </button>
       </div>
    </div>
  );
}
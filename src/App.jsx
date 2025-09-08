// src/App.jsx - ФИНАЛЬНАЯ ВЕРСИЯ С СЛУШАТЕЛЕМ AUTH

import { useState, useEffect } from 'react'; // Добавлен useEffect
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom'; // Добавлен useNavigate
import Generator from './pages/Generator';
import Builder from './pages/Builder';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Импортируем слушателя
import './App.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Состояние для первоначальной проверки

  // Этот useEffect сработает один раз при загрузке приложения
  useEffect(() => {
    const auth = getAuth();
    // Устанавливаем слушателя. Он будет активен все время работы приложения.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Если пользователь вошел (или уже был залогинен с прошлого раза)
        setUser({
          sub: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          picture: firebaseUser.photoURL,
        });
        // Если пользователь на главной, перенаправляем его внутрь
        if (location.pathname === '/') {
          navigate('/generator');
        }
      } else {
        // Если пользователь вышел
        setUser(null);
      }
      // Первоначальная проверка завершена, можно показывать интерфейс
      setAuthLoading(false);
    });

    // Отписываемся от слушателя при размонтировании компонента
    return () => unsubscribe();
  }, [navigate, location.pathname]); // Добавляем зависимости

  const getLayoutClass = () => {
    // ... ваш код ...
  };

  // Пока идет проверка, ничего не показываем, чтобы избежать ошибок
  if (authLoading) {
    return <div className="loading-fullscreen">Проверка аутентификации...</div>;
  }

  return (
    <div className="app-layout">
      <nav className="main-nav">
        {/* ... ваш код навигации ... */}
      </nav>

      <main className={`main-content-area ${getLayoutClass()}`}>
        <Routes>
          <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
          <Route element={<ProtectedRoute user={user} />}>
            <Route path="/generator" element={<Generator user={user} />} />
            <Route path="/builder" element={<Builder user={user} />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
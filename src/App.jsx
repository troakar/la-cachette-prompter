// src/App.jsx - ФИНАЛЬНАЯ ВЕРСИЯ С ВОССТАНОВЛЕННЫМ МЕНЮ

import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Generator from './pages/Generator';
import Builder from './pages/Builder';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './App.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          sub: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          picture: firebaseUser.photoURL,
        });
        if (location.pathname === '/') {
          navigate('/generator');
        }
      } else {
        setUser(null);
        // Если пользователь вышел, перенаправляем его на главную
        navigate('/');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const getLayoutClass = () => {
    switch (location.pathname) {
      case '/generator':
        return 'layout-generator';
      case '/builder':
        return 'layout-builder';
      default:
        return 'layout-default';
    }
  };

  if (authLoading) {
    // Можно добавить стили для этого элемента
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Проверка аутентификации...</div>;
  }

  return (
    <div className="app-layout">
      {/* --- ВОТ ИСПРАВЛЕННЫЙ БЛОК НАВИГАЦИИ --- */}
      <nav className="main-nav">
        <NavLink to="/">Главная</NavLink>
        {user && (
          <>
            <NavLink to="/generator">Генератор</NavLink>
            <NavLink to="/builder">Конструктор шаблонов</NavLink>
          </>
        )}
        {user && <span className="user-nav-info">Привет, {user.name}!</span>}
      </nav>

      <main className={`main-content-area ${getLayoutClass()}`}>
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
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
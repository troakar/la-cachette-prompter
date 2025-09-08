// src/App.jsx - ФИНАЛЬНАЯ ВЕРСИЯ С ЗАЩИТОЙ

import { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Generator from './pages/Generator';
import Builder from './pages/Builder';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute'; // 1. Импортируем нашего "охранника"
import './App.css';

function App() {
  const location = useLocation();
  const [user, setUser] = useState(null); // Состояние для данных пользователя

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

  return (
    <div className="app-layout">
      <nav className="main-nav">
        {/* 2. Навигация теперь зависит от того, вошел ли пользователь */}
        <NavLink to="/">Главная</NavLink>
        {user && (
          <>
            <NavLink to="/generator">Генератор</NavLink>
            <NavLink to="/builder">Конструктор шаблонов</NavLink>
          </>
        )}
        {user && <span className="user-nav-info">Привет, {user.given_name}!</span>}
      </nav>

      <main className={`main-content-area ${getLayoutClass()}`}>
        <Routes>
          {/* 3. Маршрут по умолчанию - ВСЕГДА страница входа */}
          <Route 
            path="/" 
            element={<HomePage user={user} setUser={setUser} />} 
          />

          {/* 4. ГРУППА ЗАЩИЩЕННЫХ МАРШРУТОВ */}
          <Route element={<ProtectedRoute user={user} />}>
            {/* Сюда мы помещаем все страницы, которые должны быть недоступны без входа */}
            <Route path="/generator" element={<Generator />} />
            <Route path="/builder" element={<Builder />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
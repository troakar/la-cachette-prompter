// src/App.jsx - ЭТАЛОННАЯ ВЕРСИЯ

import { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Generator from './pages/Generator';
import Builder from './pages/Builder';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute'; // Убедитесь, что этот файл существует
import './App.css';

function App() {
  const location = useLocation();
  const [user, setUser] = useState(null);

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
          {/* Маршрут по умолчанию - СТРОГО страница входа */}
          <Route 
            path="/" 
            element={<HomePage user={user} setUser={setUser} />} 
          />

          {/* Группа защищенных маршрутов */}
          <Route element={<ProtectedRoute user={user} />}>
            <Route path="/generator" element={<Generator />} />
            <Route path="/builder" element={<Builder />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
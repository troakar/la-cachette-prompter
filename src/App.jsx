// src/App.jsx

import { SessionProvider } from 'next-auth/react'; // 1. Импортируем SessionProvider
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Generator from './pages/Generator';
import Builder from './pages/Builder';
import HomePage from './pages/HomePage'; // 2. Импортируем нашу новую стартовую страницу
import './App.css';

function App({ Component, pageProps }) { // 3. Принимаем pageProps
  const location = useLocation();

  const getLayoutClass = () => {
    // ... ваш код для определения класса макета
    // Добавим условие для главной страницы
    if (location.pathname === '/home') {
        return 'layout-default';
    }
    switch (location.pathname) {
      case '/':
        return 'layout-generator';
      case '/builder':
        return 'layout-builder';
      default:
        return 'layout-default';
    }
  };

  return (
    // 4. Оборачиваем всё в SessionProvider
    <SessionProvider session={pageProps.session}>
      <div className="app-layout">
        <nav className="main-nav">
          {/* Добавим ссылку на главную страницу */}
          <NavLink to="/home">Главная</NavLink>
          <NavLink to="/">Генератор</NavLink>
          <NavLink to="/builder">Конструктор шаблонов</NavLink>
        </nav>

        <main className={`main-content-area ${getLayoutClass()}`}>
          <Routes>
            {/* Добавляем роут для главной страницы */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/" element={<Generator />} />
            <Route path="/builder" element={<Builder />} />
            {/* Можно сделать редирект с корня на /home */}
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </SessionProvider>
  );
}

export default App;
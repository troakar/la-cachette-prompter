// src/App.jsx
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Generator from './pages/Generator';
import Builder from './pages/Builder';
import './App.css';

function App() {
  const location = useLocation();

  const getLayoutClass = () => {
    switch (location.pathname) {
      case '/':
        return 'layout-generator'; // Двухколоночный макет
      case '/builder':
        return 'layout-builder'; // Трехколоночный макет
      default:
        return 'layout-default'; // Одноколоночный по умолчанию
    }
  };

  return (
    <div className="app-layout">
      <nav className="main-nav">
        <NavLink to="/">Генератор</NavLink>
        <NavLink to="/builder">Конструктор шаблонов</NavLink>
      </nav>

      <main className={`main-content-area ${getLayoutClass()}`}>
        <Routes>
          <Route path="/" element={<Generator />} />
          <Route path="/builder" element={<Builder />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
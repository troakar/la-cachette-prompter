// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Этот компонент принимает 'user' как свойство (пропс)
const ProtectedRoute = ({ user }) => {
  // Если пользователя нет (он не вошел в систему)
  if (!user) {
    // Перенаправляем его на главную страницу для входа
    return <Navigate to="/" replace />;
  }

  // Если пользователь есть, то разрешаем показать вложенный маршрут
  // <Outlet /> — это специальный компонент, который отображает дочерний роут (Generator или Builder)
  return <Outlet />;
};

export default ProtectedRoute;
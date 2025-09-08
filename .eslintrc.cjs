// .eslintrc.cjs

module.exports = {
  // ... другие настройки
  rules: {
    'react-refresh/only-export-components': 'warn',
    // --- ВОТ ЭТА СТРОКА ---
    'no-unused-vars': 'warn', // Меняем 'error' на 'warn' или добавляем эту строку
  },
}
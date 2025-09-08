// src/templates/index.js

// 1. Динамически импортируем все .js файлы из этой директории
const templateModules = import.meta.glob('./*.js', { eager: true });

// 2. Обрабатываем импортированные модули, чтобы создать массив шаблонов
export const templates = Object.entries(templateModules).map(([path, module]) => {
  // Получаем id из имени файла (simpleSeoTemplate.js -> simple-seo-template)
  const id = path.split('/').pop().replace('.js', '').replace(/([A-Z])/g, '-$1').toLowerCase();
  
  // Находим первый экспорт внутри модуля
  const templateData = Object.values(module)[0];

  return {
    id: id,
    name: templateData.prompt_name || "Безымянный шаблон",
    data: templateData,
    processor: null // В будущем можно будет добавить логику для процессоров
  };
}).filter(p => p.id !== 'index'); // Исключаем сам файл index.js
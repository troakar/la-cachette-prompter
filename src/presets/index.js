// src/presets/index.js

// 1. Динамический импорт всех .js файлов из этой директории
const presetModules = import.meta.glob('./*.js', { eager: true });

// 2. Обрабатываем импортированные модули, чтобы создать массив пресетов
export const presets = Object.entries(presetModules).map(([path, module]) => {
  // Получаем имя файла без расширения (adCampaignPreset.js -> adCampaignPreset)
  const id = path.split('/').pop().replace('.js', '');
  
  // Предполагаем, что каждый файл экспортирует объект с данными пресета
  // (например, `export const adCampaignPreset = { ... }`)
  // Находим этот экспорт внутри модуля
  const presetData = Object.values(module)[0];

  return {
    id: id,
    name: presetData.prompt_name || "Безымянный пресет", // Берем имя из самого пресета
    data: presetData,
  };
}).filter(p => p.id !== 'index'); // Исключаем сам файл index.js из списка
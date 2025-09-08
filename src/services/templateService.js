// src/services/templateService.js

const LOCAL_STORAGE_KEY = 'customPromptTemplates';

// --- Управление Шаблонами ---

export const getCustomTemplates = () => {
  try {
    const templatesJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    return templatesJson ? JSON.parse(templatesJson) : [];
  } catch (error) {
    console.error("Failed to parse custom templates from localStorage", error);
    return [];
  }
};

export const saveCustomTemplates = (templates) => {
  try {
    const templatesJson = JSON.stringify(templates);
    localStorage.setItem(LOCAL_STORAGE_KEY, templatesJson);
  } catch (error) {
    console.error("Failed to save custom templates to localStorage", error);
  }
};

export const addCustomTemplate = (newTemplate) => {
  if (!newTemplate || !newTemplate.prompt_name) {
    console.error("Attempted to save a template without a name.");
    return false;
  }
  const allTemplates = getCustomTemplates();
  const templateWithId = { ...newTemplate, id: `custom-${Date.now()}` };
  const updatedTemplates = [...allTemplates, templateWithId];
  saveCustomTemplates(updatedTemplates);
  return true;
};

export const deleteCustomTemplate = (templateId) => {
  if (!templateId) return false;
  let allTemplates = getCustomTemplates();
  const updatedTemplates = allTemplates.filter(t => t.id !== templateId);
  if (allTemplates.length !== updatedTemplates.length) {
    saveCustomTemplates(updatedTemplates);
    return true;
  }
  return false;
};


// --- Управление Библиотекой Rich-текста ---

const RICH_TEXT_LIBRARY_KEY = 'richTextLibrary';

export const getRichTextLibrary = () => {
  try {
    const libraryJson = localStorage.getItem(RICH_TEXT_LIBRARY_KEY);
    return libraryJson ? JSON.parse(libraryJson) : [];
  } catch (error) {
    console.error("Failed to parse rich text library from localStorage", error);
    return [];
  }
};

export const saveRichTextLibrary = (library) => {
  try {
    const libraryJson = JSON.stringify(library);
    localStorage.setItem(RICH_TEXT_LIBRARY_KEY, libraryJson);
  } catch (error) {
    console.error("Failed to save rich text library to localStorage", error);
  }
};

export const addOrUpdateRichTextItem = (item) => {
  if (!item || !item.name || !item.content) {
    console.error("Attempted to save a rich text item without name or content.");
    return false;
  }
  let library = getRichTextLibrary();
  if (item.id) {
    // Обновление
    const index = library.findIndex(i => i.id === item.id);
    if (index !== -1) { library[index] = item; } else { library.push(item); }
  } else {
    // Добавление
    item.id = `rich-${Date.now()}`;
    library.push(item);
  }
  saveRichTextLibrary(library);
  return true;
};

export const deleteRichTextItem = (itemId) => {
  if (!itemId) return false;
  let library = getRichTextLibrary();
  const updatedLibrary = library.filter(item => item.id !== itemId);
  if (library.length !== updatedLibrary.length) {
    saveRichTextLibrary(updatedLibrary);
    return true;
  }
  return false;
};

// src/services/templateService.js (добавить)

// Обновляет существующий шаблон по его ID
export const updateCustomTemplate = (updatedTemplate) => {
  if (!updatedTemplate || !updatedTemplate.id) {
    console.error("Attempted to update a template without an ID.");
    return false;
  }
  let allTemplates = getCustomTemplates();
  const index = allTemplates.findIndex(t => t.id === updatedTemplate.id);
  
  if (index !== -1) {
    allTemplates[index] = updatedTemplate;
    saveCustomTemplates(allTemplates);
    return true;
  }
  return false; // Шаблон не найден
};
// src/services/templateService.js
// Этот файл полностью переписан для работы с Firebase Firestore.
// Все данные теперь хранятся в облаке и привязаны к email пользователя.

import { db } from '../firebase-config'; // Импортируем настроенную базу данных
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

// --- Управление Шаблонами Промтов ---

/**
 * Получает все кастомные шаблоны для конкретного пользователя.
 * @param {string} userEmail - Email пользователя, чьи шаблоны нужно загрузить.
 * @returns {Promise<Array>} - Массив с шаблонами пользователя.
 */
export const getCustomTemplates = async (userEmail) => {
  if (!userEmail) return []; // Защита от вызова без пользователя

  // Путь к подколлекции шаблонов конкретного пользователя: /users/{userEmail}/templates
  const templatesCollectionRef = collection(db, 'users', userEmail, 'templates');
  
  try {
    const querySnapshot = await getDocs(templatesCollectionRef);
    const templates = querySnapshot.docs.map(doc => ({
      id: doc.id, // Firestore автоматически присваивает уникальный ID
      ...doc.data()
    }));
    return templates;
  } catch (error) {
    console.error("Ошибка при получении шаблонов из Firestore:", error);
    return [];
  }
};

/**
 * Добавляет новый шаблон в коллекцию пользователя.
 * @param {object} newTemplate - Объект нового шаблона.
 * @param {string} userEmail - Email пользователя.
 * @returns {Promise<boolean>} - true в случае успеха.
 */
export const addCustomTemplate = async (newTemplate, userEmail) => {
  if (!newTemplate || !newTemplate.prompt_name || !userEmail) {
    console.error("Недостаточно данных для сохранения шаблона.");
    return false;
  }
  
  const templatesCollectionRef = collection(db, 'users', userEmail, 'templates');
  
  try {
    // Firestore сам сгенерирует уникальный ID для документа
    await addDoc(templatesCollectionRef, newTemplate);
    return true;
  } catch (error) {
    console.error("Ошибка при добавлении шаблона в Firestore:", error);
    return false;
  }
};

/**
 * Обновляет существующий шаблон пользователя.
 * @param {object} updatedTemplate - Объект шаблона с ID и обновленными данными.
 * @param {string} userEmail - Email пользователя.
 * @returns {Promise<boolean>} - true в случае успеха.
 */
export const updateCustomTemplate = async (updatedTemplate, userEmail) => {
    if (!updatedTemplate || !updatedTemplate.id || !userEmail) {
      console.error("Недостаточно данных для обновления шаблона.");
      return false;
    }
    // Создаем копию объекта, чтобы удалить из него id перед отправкой в Firestore
    const templateData = { ...updatedTemplate };
    delete templateData.id;

    const templateDocRef = doc(db, 'users', userEmail, 'templates', updatedTemplate.id);
    try {
        await updateDoc(templateDocRef, templateData);
        return true;
    } catch (error) {
        console.error("Ошибка при обновлении шаблона в Firestore:", error);
        return false;
    }
};

/**
 * Удаляет шаблон пользователя по его ID.
 * @param {string} templateId - ID шаблона для удаления.
 * @param {string} userEmail - Email пользователя.
 * @returns {Promise<boolean>} - true в случае успеха.
 */
export const deleteCustomTemplate = async (templateId, userEmail) => {
  if (!templateId || !userEmail) return false;
  
  const templateDocRef = doc(db, 'users', userEmail, 'templates', templateId);
  try {
    await deleteDoc(templateDocRef);
    return true;
  } catch (error) {
    console.error("Ошибка при удалении шаблона из Firestore:", error);
    return false;
  }
};


// --- Управление Библиотекой Rich-текста ---
// Логика полностью аналогична управлению шаблонами

/**
 * Получает библиотеку rich-текста для пользователя.
 * @param {string} userEmail - Email пользователя.
 * @returns {Promise<Array>}
 */
export const getRichTextLibrary = async (userEmail) => {
  if (!userEmail) return [];
  const libraryCollectionRef = collection(db, 'users', userEmail, 'richTextLibrary');
  try {
    const querySnapshot = await getDocs(libraryCollectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Ошибка при получении библиотеки rich-текста:", error);
    return [];
  }
};

/**
 * Добавляет или обновляет элемент в библиотеке rich-текста.
 * @param {object} item - Элемент для сохранения (может содержать id для обновления).
 * @param {string} userEmail - Email пользователя.
 * @returns {Promise<boolean>}
 */
export const addOrUpdateRichTextItem = async (item, userEmail) => {
  if (!item || !item.name || !item.content || !userEmail) {
    return false;
  }

  const libraryCollectionRef = collection(db, 'users', userEmail, 'richTextLibrary');

  try {
    if (item.id) {
      // Обновление существующего
      const itemDocRef = doc(db, 'users', userEmail, 'richTextLibrary', item.id);
      const itemData = { ...item };
      delete itemData.id;
      await updateDoc(itemDocRef, itemData);
    } else {
      // Добавление нового
      await addDoc(libraryCollectionRef, item);
    }
    return true;
  } catch (error) {
    console.error("Ошибка при сохранении элемента rich-текста:", error);
    return false;
  }
};

/**
 * Удаляет элемент из библиотеки rich-текста.
 * @param {string} itemId - ID элемента для удаления.
 * @param {string} userEmail - Email пользователя.
 * @returns {Promise<boolean>}
 */
export const deleteRichTextItem = async (itemId, userEmail) => {
  if (!itemId || !userEmail) return false;
  const itemDocRef = doc(db, 'users', userEmail, 'richTextLibrary', itemId);
  try {
    await deleteDoc(itemDocRef);
    return true;
  } catch (error) {
    console.error("Ошибка при удалении элемента rich-текста:", error);
    return false;
  }
};
// src/services/templateService.js
// ПОЛНАЯ ВЕРСИЯ ДЛЯ FIREBASE, ИСПОЛЬЗУЮЩАЯ UID ПОЛЬЗОВАТЕЛЯ

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
 * Получает все кастомные шаблоны для конкретного пользователя по его ID.
 * @param {string} userId - Уникальный ID пользователя (user.sub).
 * @returns {Promise<Array>} - Массив с шаблонами пользователя.
 */
export const getCustomTemplates = async (userId) => {
  if (!userId) return []; // Защита от вызова без ID пользователя

  // Путь к подколлекции шаблонов: /users/{userId}/templates
  const templatesCollectionRef = collection(db, 'users', userId, 'templates');
  
  try {
    const querySnapshot = await getDocs(templatesCollectionRef);
    const templates = querySnapshot.docs.map(doc => ({
      id: doc.id,
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
 * @param {string} userId - Уникальный ID пользователя (user.sub).
 * @returns {Promise<boolean>} - true в случае успеха.
 */
export const addCustomTemplate = async (newTemplate, userId) => {
  if (!newTemplate || !newTemplate.prompt_name || !userId) {
    console.error("Недостаточно данных для сохранения шаблона.");
    return false;
  }
  
  const templatesCollectionRef = collection(db, 'users', userId, 'templates');
  
  try {
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
 * @param {string} userId - Уникальный ID пользователя (user.sub).
 * @returns {Promise<boolean>} - true в случае успеха.
 */
export const updateCustomTemplate = async (updatedTemplate, userId) => {
    if (!updatedTemplate || !updatedTemplate.id || !userId) {
      console.error("Недостаточно данных для обновления шаблона.");
      return false;
    }
    
    const templateData = { ...updatedTemplate };
    delete templateData.id; // ID не должен быть частью данных документа

    const templateDocRef = doc(db, 'users', userId, 'templates', updatedTemplate.id);
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
 * @param {string} userId - Уникальный ID пользователя (user.sub).
 * @returns {Promise<boolean>} - true в случае успеха.
 */
export const deleteCustomTemplate = async (templateId, userId) => {
  if (!templateId || !userId) return false;
  
  const templateDocRef = doc(db, 'users', userId, 'templates', templateId);
  try {
    await deleteDoc(templateDocRef);
    return true;
  } catch (error)
  {
    console.error("Ошибка при удалении шаблона из Firestore:", error);
    return false;
  }
};


// --- Управление Библиотекой Rich-текста ---

/**
 * Получает библиотеку rich-текста для пользователя.
 * @param {string} userId - Уникальный ID пользователя (user.sub).
 * @returns {Promise<Array>}
 */
export const getRichTextLibrary = async (userId) => {
  if (!userId) return [];
  const libraryCollectionRef = collection(db, 'users', userId, 'richTextLibrary');
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
 * @param {object} item - Элемент для сохранения.
 * @param {string} userId - Уникальный ID пользователя (user.sub).
 * @returns {Promise<boolean>}
 */
export const addOrUpdateRichTextItem = async (item, userId) => {
  if (!item || !item.name || !item.content || !userId) {
    return false;
  }

  const libraryCollectionRef = collection(db, 'users', userId, 'richTextLibrary');

  try {
    if (item.id) {
      const itemDocRef = doc(db, 'users', userId, 'richTextLibrary', item.id);
      const itemData = { ...item };
      delete itemData.id;
      await updateDoc(itemDocRef, itemData);
    } else {
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
 * @param {string} userId - Уникальный ID пользователя (user.sub).
 * @returns {Promise<boolean>}
 */
export const deleteRichTextItem = async (itemId, userId) => {
  if (!itemId || !userId) return false;
  const itemDocRef = doc(db, 'users', userId, 'richTextLibrary', itemId);
  try {
    await deleteDoc(itemDocRef);
    return true;
  } catch (error) {
    console.error("Ошибка при удалении элемента rich-текста:", error);
    return false;
  }
};
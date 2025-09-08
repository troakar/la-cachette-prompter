// src/components/RichTextManagerModal.jsx

import { useState, useEffect, useMemo } from 'react';
import SimpleMdeEditor from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { getRichTextLibrary, addOrUpdateRichTextItem, deleteRichTextItem } from '../services/templateService';

// НОВОЕ: Добавлены пропсы mode, initialContent, onSave
function RichTextManagerModal({ isOpen, onClose, mode = 'browser', initialContent = '', onSave, onSelectRichText }) {
  const [library, setLibrary] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // Для режима 'browser', если редактируем элемент библиотеки
  const [itemName, setItemName] = useState('');
  const [itemContent, setItemContent] = useState(''); // Используется как для редактора, так и для нового элемента
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'browser') {
        setLibrary(getRichTextLibrary());
        setEditingItem(null); // В режиме браузера не редактируем элемент по умолчанию
        setItemName('');
        setItemContent(''); // Сбрасываем контент
      } else if (mode === 'editor') {
        // В режиме редактора сразу устанавливаем контент для редактирования
        setItemContent(initialContent || '');
        setEditingItem(null); // Не редактируем элемент из библиотеки, а просто контент
        setItemName('Редактирование контента'); // Обозначение, что это не элемент из библиотеки
      }
      setSearchTerm(''); // Сбрасываем поиск
    }
  }, [isOpen, mode, initialContent]);

  const filteredLibrary = useMemo(() => {
    return library.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [library, searchTerm]);

  const handleEdit = (item) => {
    setEditingItem(item); setItemName(item.name); setItemContent(item.content);
  };

  const handleSaveItem = () => { // Переименовано, чтобы не конфликтовать с onSave
    if (mode === 'editor') {
      // В режиме редактора просто вызываем переданный onSave callback
      if (onSave) { onSave(itemContent); }
      onClose();
    } else { // Режим 'browser', сохраняем/обновляем элемент библиотеки
      const itemToSave = editingItem ? { ...editingItem, name: itemName, content: itemContent } : { name: itemName, content: itemContent };
      if (addOrUpdateRichTextItem(itemToSave)) {
        setLibrary(getRichTextLibrary());
        setEditingItem(null); setItemName(''); setItemContent('');
        alert('Элемент сохранен!');
      } else {
        alert('Ошибка: Имя и содержание обязательны.');
      }
    }
  };

  const handleDelete = (itemId) => {
    if (window.confirm('Удалить этот элемент?')) {
      if (deleteRichTextItem(itemId)) {
        setLibrary(getRichTextLibrary());
        if (editingItem && editingItem.id === itemId) {
          setEditingItem(null); setItemName(''); setItemContent('');
        }
        alert('Элемент удален!');
      }
    }
  };
  
  const handleSelectContent = (content) => { // Переименовано
      if (onSelectRichText) { // onSelectRichText предназначен для режима 'browser'
          onSelectRichText(content);
          onClose();
      }
  };

  const editorOptions = useMemo(() => ({
    autofocus: true, spellChecker: false, status: false,
    toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "|", "preview", "guide"],
  }), []);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content rich-text-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          {/* НОВОЕ: Заголовок в зависимости от режима */}
          <h2>{mode === 'browser' ? 'Библиотека Rich-текста' : 'Редактировать контент'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {mode === 'browser' && ( // НОВОЕ: Только для режима 'browser'
            <div className="rich-text-list">
              <h3>Сохраненные элементы</h3>
              <div className="form-field search-field">
                  <input type="text" placeholder="Поиск по названию..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <ul>
                {filteredLibrary.length === 0 && <p className="empty-list-message">Нет сохраненных элементов или ничего не найдено.</p>}
                {filteredLibrary.map(item => (
                  <li key={item.id} className={editingItem && editingItem.id === item.id ? 'active' : ''}>
                    <span className="item-name" onClick={() => handleEdit(item)}>{item.name}</span>
                    <div className="item-actions">
                      <button className="edit-btn" onClick={() => handleEdit(item)}>Ред.</button>
                      {onSelectRichText && <button className="insert-to-field-btn" onClick={() => handleSelectContent(item.content)} title="Вставить">⎘</button>}
                      <button className="delete-btn" onClick={() => handleDelete(item.id)}>Уд.</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* НОВОЕ: Редактор, который используется в обоих режимах, но с разной логикой */}
          <div className="rich-text-editor-form" style={{ gridColumn: mode === 'editor' ? '1 / span 2' : 'auto' }}>
            <h3>{mode === 'browser' ? (editingItem ? 'Редактировать элемент' : 'Добавить новый') : 'Редактирование'}</h3>
            {mode === 'browser' && ( // Имя элемента только в режиме 'browser'
              <div className="form-field"><label>Название (для списка)</label><input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Краткое название"/></div>
            )}
            <div className="form-field"><label>Содержание (Markdown)</label><SimpleMdeEditor options={editorOptions} value={itemContent} onChange={setItemContent}/></div>
            
            {/* НОВОЕ: Кнопки сохранения в зависимости от режима */}
            {mode === 'browser' ? (
              <>
                <button className="save-btn" onClick={handleSaveItem}>{editingItem ? 'Обновить' : 'Добавить'}</button>
                {editingItem && <button className="cancel-btn" onClick={() => {setEditingItem(null); setItemName(''); setItemContent('');}}>Отмена</button>}
              </>
            ) : ( // Режим 'editor'
              <>
                <button className="save-btn" onClick={handleSaveItem}>Сохранить и закрыть</button>
                <button className="cancel-btn" onClick={onClose}>Отмена</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default RichTextManagerModal;
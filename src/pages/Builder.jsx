// src/pages/Builder.jsx

import { useState, useEffect, useMemo, useRef } from 'react'; // Добавлен useRef
import { useNavigate } from 'react-router-dom';
import SimpleMdeEditor from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import '../App.css';
import Preview from '../components/Preview'; 
import { templates as builtInTemplates } from '../templates';
import { getCustomTemplates, addCustomTemplate, updateCustomTemplate, deleteCustomTemplate, getRichTextLibrary } from '../services/templateService';
import RichTextManagerModal from '../components/RichTextManagerModal';
import TemplateManager from '../components/TemplateManager';

function Builder() {
  const navigate = useNavigate();
  const [editingTemplate, setEditingTemplate] = useState({ id: null, prompt_name: '', fields: [], template: '' });
  const [templateTree, setTemplateTree] = useState([]);
  const [previewTab, setPreviewTab] = useState('json');
  const [expandedItems, setExpandedItems] = useState({}); 
  const [expandedRichOptions, setExpandedRichOptions] = useState({}); 
  
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);

  const [isRichTextModalOpen, setIsRichTextModalOpen] = useState(false);
  const [richTextModalMode, setRichTextModalMode] = useState('browser'); 
  const [richTextModalContent, setRichTextModalContent] = useState(''); 
  const [richTextModalCallback, setRichTextModalCallback] = useState(null); 

  // --- НОВОЕ: Состояния и рефы для Drag and Drop ---
  const dragItem = useRef(null); // Индекс перетаскиваемого элемента
  const dragOverItem = useRef(null); // Индекс элемента, над которым находится перетаскиваемый

  const loadTemplates = () => {
    const customTemplates = getCustomTemplates().map(t => ({ id: t.id, name: t.prompt_name, data: t }));
    setTemplateTree([
      { id: 'built-in', name: 'Начать с шаблона', templates: builtInTemplates },
      { id: 'custom', name: 'Редактировать мой шаблон', templates: customTemplates }
    ]);
  };
  
  useEffect(() => { loadTemplates(); }, []);

  const handleSelectTemplate = (templateId) => {
    const allTemplates = [...templateTree[0].templates, ...templateTree[1].templates];
    const found = allTemplates.find(t => t.id === templateId);
    if (found) {
      const templateData = found.data.id && found.data.id.startsWith('custom-')
        ? found.data
        : { ...found.data, id: null, prompt_name: `${found.data.prompt_name} (копия)` };
      setEditingTemplate({ fields: [], ...templateData });
      setExpandedItems({}); 
      setExpandedRichOptions({}); 
    }
  };

  const handleDeleteAndUpdate = (templateId) => {
    if (deleteCustomTemplate(templateId)) {
      if (editingTemplate && editingTemplate.id === templateId) {
        setEditingTemplate({ id: null, prompt_name: '', fields: [], template: '' });
      }
      loadTemplates();
    }
  };
  
  const handleSaveTemplate = () => {
    if (!editingTemplate.prompt_name) { alert('Пожалуйста, введите название шаблона.'); return; }
    const action = editingTemplate.id ? updateCustomTemplate : addCustomTemplate;
    const templateToSave = { ...editingTemplate };
    delete templateToSave.selectors; 

    if (action(templateToSave)) {
      alert(`Шаблон "${editingTemplate.prompt_name}" сохранен!`);
      navigate('/');
    } else { alert('Ошибка сохранения.'); }
  };
  
  const handleRootChange = (e) => setEditingTemplate(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleTemplateChange = (value) => setEditingTemplate(prev => ({ ...prev, template: value || '' }));
  const toggleExpand = (index) => setExpandedItems(prev => ({...prev, [index]: !prev[index]}));
  
  const toggleRichOptionExpand = (fieldIndex, optIndex) => {
    setExpandedRichOptions(prev => ({
      ...prev,
      [fieldIndex]: {
        ...(prev[fieldIndex] || {}),
        [optIndex]: !(prev[fieldIndex] && prev[fieldIndex][optIndex])
      }
    }));
  };

  const handleInsertPlaceholder = (placeholder) => {
    const editorInstance = document.querySelector('.CodeMirror').CodeMirror;
    if (editorInstance) { editorInstance.replaceSelection(`{${placeholder}}`); editorInstance.focus(); }
  };
  
  const handleAddField = () => {
    const newField = { name: '', label: '', type: 'text', placeholder: '' };
    setEditingTemplate(prev => ({...prev, fields: [...(prev.fields || []), newField]}));
  };

  const handleFieldChange = (index, e) => {
    const { name, value } = e.target;
    const newFields = [...(editingTemplate.fields || [])];
    const oldField = newFields[index];
    newFields[index] = { ...oldField, [name]: value };

    if (name === 'type') {
        if (value === 'checkbox' || value === 'dropdown') {
            newFields[index].optionsType = 'simple';
            newFields[index].options = [];
        } else {
            delete newFields[index].optionsType;
            delete newFields[index].options;
        }
    }
    if (name === 'optionsType') {
        const currentOptions = newFields[index].options || [];
        if (value === 'rich') {
            newFields[index].options = currentOptions.map(opt => (typeof opt === 'string' ? { label: opt, content: '' } : opt));
        } else {
            newFields[index].options = currentOptions.map(opt => (typeof opt === 'object' ? opt.label : opt.label));
        }
    }
    setEditingTemplate(prev => ({ ...prev, fields: newFields }));
  };
  
  const handleSimpleOptionsChange = (index, e) => {
    const newFields = [...editingTemplate.fields];
    newFields[index].options = e.target.value.split(',').map(opt => opt.trim()).filter(Boolean);
    setEditingTemplate(prev => ({ ...prev, fields: newFields }));
  };

  const handleRichOptionLabelChange = (fieldIndex, optionIndex, e) => {
    const newFields = [...editingTemplate.fields];
    newFields[fieldIndex].options[optionIndex].label = e.target.value;
    setEditingTemplate(prev => ({ ...prev, fields: newFields }));
  };
  
  const addRichOption = (fieldIndex) => {
    const newFields = [...editingTemplate.fields];
    if (!newFields[fieldIndex].options) newFields[fieldIndex].options = [];
    newFields[fieldIndex].options.push({ label: '', content: '' });
    setEditingTemplate(prev => ({ ...prev, fields: newFields }));
  };
  
  const removeRichOption = (fieldIndex, optionIndex) => {
    const newFields = [...editingTemplate.fields];
    newFields[fieldIndex].options.splice(optionIndex, 1);
    setEditingTemplate(prev => ({ ...prev, fields: newFields }));
    setExpandedRichOptions(prev => {
        const newExpanded = { ...prev };
        if (newExpanded[fieldIndex]) { delete newExpanded[fieldIndex][optIndex]; }
        return newExpanded;
    });
  };

  const handleRemoveField = (index) => {
    setEditingTemplate(prev => ({ ...prev, fields: (prev.fields || []).filter((_, i) => i !== index)}));
    setExpandedItems(prev => ({ ...prev, [index]: false }));
    setExpandedRichOptions(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[index]; 
        return newExpanded;
    });
  };

  const openRichTextEditor = (fieldIndex, optionIndex) => {
    const contentToEdit = editingTemplate.fields[fieldIndex].options[optionIndex].content;
    setRichTextModalContent(contentToEdit);
    setRichTextModalMode('editor');
    setRichTextModalCallback((newContent) => {
        const newFields = [...editingTemplate.fields];
        newFields[fieldIndex].options[optionIndex].content = newContent;
        setEditingTemplate(prev => ({ ...prev, fields: newFields }));
    });
    setIsRichTextModalOpen(true);
  };

  const openRichTextBrowser = (fieldIndex, optionIndex) => {
    setRichTextModalContent(''); 
    setRichTextModalMode('browser');
    setRichTextModalCallback((selectedContent) => {
        const newFields = [...editingTemplate.fields];
        newFields[fieldIndex].options[optionIndex].content = selectedContent;
        setEditingTemplate(prev => ({ ...prev, fields: newFields }));
    });
    setIsRichTextModalOpen(true);
  };

  const editorOptions = useMemo(() => ({ autofocus: true, spellChecker: false, toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"], }), []);

  // --- НОВОЕ: Логика Drag and Drop ---
  const handleDragStart = (e, position) => {
    dragItem.current = position;
    e.dataTransfer.effectAllowed = "move";
    // Добавляем класс для визуального эффекта перетаскивания
    e.target.classList.add('dragging'); 
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
    // Добавляем класс для визуального эффекта над элементом
    e.target.classList.add('drag-over'); 
  };

  const handleDragLeave = (e) => {
    // Убираем класс, когда курсор уходит
    e.target.classList.remove('drag-over'); 
  };

  const handleDrop = (e) => {
    e.target.classList.remove('drag-over'); // Убираем класс с элемента, над которым бросили
    const fieldsCopy = [...editingTemplate.fields];
    const draggedItemContent = fieldsCopy[dragItem.current];
    fieldsCopy.splice(dragItem.current, 1); // Удаляем исходный элемент
    fieldsCopy.splice(dragOverItem.current, 0, draggedItemContent); // Вставляем в новое место

    // Обновляем состояния expandedItems и expandedRichOptions, чтобы они соответствовали новому порядку
    const newExpandedItems = {};
    const newExpandedRichOptions = {};
    fieldsCopy.forEach((_, newIndex) => {
        // Если элемент был развернут, сохраняем его состояние по новому индексу
        if (expandedItems[dragItem.current] && fieldsCopy[newIndex] === draggedItemContent) {
            newExpandedItems[newIndex] = expandedItems[dragItem.current];
        } else if (expandedItems[newIndex]) { // Если это не перетаскиваемый элемент, сохраняем его состояние по текущему индексу
             newExpandedItems[newIndex] = expandedItems[newIndex];
        }

        if (expandedRichOptions[dragItem.current] && fieldsCopy[newIndex] === draggedItemContent) {
            newExpandedRichOptions[newIndex] = expandedRichOptions[dragItem.current];
        } else if (expandedRichOptions[newIndex]) {
            newExpandedRichOptions[newIndex] = expandedRichOptions[newIndex];
        }
    });

    dragItem.current = null;
    dragOverItem.current = null;
    e.target.classList.remove('dragging'); // Убираем класс с перетаскиваемого элемента

    setEditingTemplate(prev => ({ ...prev, fields: fieldsCopy }));
    setExpandedItems(newExpandedItems);
    setExpandedRichOptions(newExpandedRichOptions);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    // Убедимся, что drag-over класс убирается со всех элементов
    const allItems = document.querySelectorAll('.builder-item');
    allItems.forEach(item => item.classList.remove('drag-over'));
  };
  // -------------------------------------------------------------

  return (
    <>
      <div className="builder-sidebar">
         <TemplateManager templateTree={templateTree} onSelectTemplate={handleSelectTemplate} onDeleteTemplate={handleDeleteAndUpdate} selectedTemplateId={editingTemplate.id} />
         <button className="add-button" onClick={() => setEditingTemplate({ id: null, prompt_name: '', fields: [], template: '' })} style={{width: '100%', marginTop: '20px'}}>+ Создать новый шаблон</button>
         <button className="add-button secondary" onClick={() => {
             setRichTextModalMode('browser');
             setRichTextModalContent('');
             setRichTextModalCallback(null);
             setIsRichTextModalOpen(true);
         }} style={{width: '100%', marginTop: '10px'}}>Управление библиотекой Rich-текста</button>
      </div>
      
      <div className="builder-main-content">
        <div className="builder-main-editor">
          <div className="form-field"><label>Название шаблона (prompt_name)</label><input type="text" name="prompt_name" value={editingTemplate.prompt_name} onChange={handleRootChange} placeholder="Генератор заголовков для блога"/></div>
          <div className="form-field"><label>Текст шаблона (template)</label><SimpleMdeEditor options={editorOptions} value={editingTemplate.template} onChange={handleTemplateChange}/></div>
          
          {/* НОВОЕ: Блок для отображения JSON */}
          <div className="json-display-section">
            <h3>JSON шаблона (в реальном времени)</h3>
            <pre className="json-code-block">
              {JSON.stringify(editingTemplate, null, 2)}
            </pre>
          </div>

          <div className="save-section"><button onClick={handleSaveTemplate} className="save-button">{editingTemplate.id ? 'Обновить шаблон' : 'Сохранить как новый'}</button></div>
        </div>
        <div className="builder-toolbox">
          <details className="toolbox-section" open>
            <summary>Элементы управления (fields)</summary>
            <div className="toolbox-content">
              {(editingTemplate.fields || []).map((field, index) => (
                // --- НОВОЕ: Атрибуты Drag and Drop ---
                <div 
                  className={`builder-item ${expandedItems[index] ? 'expanded' : ''}`} 
                  key={index}
                  draggable // Делаем элемент перетаскиваемым
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragLeave={handleDragLeave}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()} // Обязательно для onDrop
                >
                  <div className="builder-item-header">
                    <input type="text" name="name" value={field.name} onChange={(e) => handleFieldChange(index, e)} placeholder="имя (name)"/>
                    <button onClick={() => toggleExpand(index)} className="expand-button" title="Настроить">{expandedItems[index] ? '⌃' : '⚙'}</button>
                    <button onClick={() => handleInsertPlaceholder(field.name)} className="insert-button" title="Вставить" disabled={!field.name}>⎘</button>
                    <button onClick={() => handleRemoveField(index)} className="remove-button" title="Удалить">×</button>
                  </div>
                  {expandedItems[index] && (
                    <div className="builder-item-details">
                      <div className="form-field small-margin"><label>Лейбл</label><input type="text" name="label" value={field.label} onChange={(e) => handleFieldChange(index, e)} placeholder="Заголовок поля"/></div>
                      <div className="form-field small-margin">
                        <label>Тип элемента</label>
                        <select name="type" value={field.type} onChange={(e) => handleFieldChange(index, e)}>
                            <option value="text">Текст</option>
                            <option value="textarea">Текстовая область</option>
                            <option value="checkbox">Чекбоксы</option>
                            <option value="dropdown">Выпадающий список</option>
                        </select>
                      </div>
                      
                      {(field.type === 'checkbox' || field.type === 'dropdown') && (
                        <>
                          <div className="form-field small-margin">
                            <label>Тип опций</label>
                            <select name="optionsType" value={field.optionsType || 'simple'} onChange={(e) => handleFieldChange(index, e)}>
                              <option value="simple">Простой</option>
                              <option value="rich">Rich-текст</option>
                            </select>
                          </div>
                          <div className="form-field small-margin">
                            <label>Опции</label>
                            {field.optionsType === 'rich' ? (
                              <div className="rich-options-editor">
                                {(field.options || []).map((opt, optIndex) => (
                                  <details 
                                    className="rich-option-item-details" 
                                    key={optIndex} 
                                    open={expandedRichOptions[index] && expandedRichOptions[index][optIndex]}
                                  >
                                    <summary onClick={() => toggleRichOptionExpand(index, optIndex)} className="rich-option-summary">
                                      <input type="text" name="label" value={opt.label} onChange={(e) => handleRichOptionLabelChange(index, optIndex, e)} placeholder="Название опции" onClick={(e) => e.stopPropagation() /* Остановить разворот/сворачивание */ }/>
                                      <div className="rich-option-actions">
                                        <button type="button" className="edit-rich-text-btn" onClick={(e) => { e.stopPropagation(); openRichTextEditor(index, optIndex); }} title="Редактировать контент">✎</button>
                                        <button type="button" className="browse-rich-text-btn" onClick={(e) => { e.stopPropagation(); openRichTextBrowser(index, optIndex); }} title="Выбрать из библиотеки">...</button>
                                        <button type="button" className="remove-button small-btn" onClick={(e) => { e.stopPropagation(); removeRichOption(index, optIndex); }} title="Удалить опцию">×</button>
                                      </div>
                                    </summary>
                                    <div className="rich-option-content-preview">
                                      <textarea value={opt.content} readOnly rows="3" placeholder="Контент Rich-текста (редактируйте через кнопку '✎' или выбирайте из библиотеки)"></textarea>
                                    </div>
                                  </details>
                                ))}
                                <button onClick={() => addRichOption(index)} className="add-button small">Добавить Rich-опцию</button>
                              </div>
                            ) : (
                              <textarea value={(field.options || []).join(', ')} onChange={(e) => handleSimpleOptionsChange(index, e)} placeholder="Опция 1, Опция 2" rows="3"/>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button onClick={handleAddField} className="add-button small">Добавить элемент</button>
            </div>
          </details>
        </div>
      </div>
      
      <div className={`builder-result-sticky ${isFooterExpanded ? 'expanded' : ''}`}>
        <div className="sticky-footer-header" onClick={() => setIsFooterExpanded(!isFooterExpanded)}><span>Результат (JSON / Предпросмотр)</span><span className="footer-toggle-icon">{isFooterExpanded ? '▼' : '▲'}</span></div>
        <div className="sticky-footer-content">
          <div className="preview-tabs"><button className={previewTab === 'json' ? 'active' : ''} onClick={() => setPreviewTab('json')}>Итоговый JSON</button><button className={previewTab === 'visual' ? 'active' : ''} onClick={() => setPreviewTab('visual')}>Визуальный предпросмотр</button></div>
          <div className="preview-content">{previewTab === 'json' ? ( <pre>{JSON.stringify(editingTemplate, null, 2)}</pre> ) : ( <Preview templateData={editingTemplate} /> )}</div>
        </div>
      </div>

      <RichTextManagerModal 
        isOpen={isRichTextModalOpen} 
        onClose={() => setIsRichTextModalOpen(false)} 
        mode={richTextModalMode} 
        initialContent={richTextModalContent} 
        onSave={richTextModalCallback} 
        onSelectRichText={richTextModalMode === 'browser' ? richTextModalCallback : null} 
      />
    </>
  );
}

export default Builder;
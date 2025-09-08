// src/pages/Generator.jsx

import { useState, useEffect, useRef } from 'react';
import '../App.css';
import { templates as builtInTemplates } from '../templates';
import { getCustomTemplates, deleteCustomTemplate } from '../services/templateService';
import TemplateManager from '../components/TemplateManager'; // <-- ИМПОРТ TemplateManager добавлен

function Generator() {
  const [templateTree, setTemplateTree] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const loadData = () => {
    const customTemplates = getCustomTemplates().map(t => ({ id: t.id, name: t.prompt_name, data: t }));
    const tree = [
      { id: 'built-in', name: 'Встроенные шаблоны', templates: builtInTemplates },
      { id: 'custom', name: 'Мои шаблоны', templates: customTemplates }
    ];
    setTemplateTree(tree);
    const currentSelectedId = selectedTemplate ? selectedTemplate.id : null;
    const allTemplatesFlat = [...builtInTemplates, ...customTemplates];
    const newSelected = allTemplatesFlat.find(t => t.id === currentSelectedId) || allTemplatesFlat[0] || null;
    setSelectedTemplate(newSelected);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'customPromptTemplates') { loadData(); }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => { window.removeEventListener('storage', handleStorageChange); };
  }, [selectedTemplate]);

  useEffect(() => {
    if (!selectedTemplate) return;
    const initialValues = {};
    (selectedTemplate.data.fields || []).forEach(f => {
      if (f.type === 'checkbox') {
        initialValues[f.name] = [];
      } else if (f.type === 'dropdown') {
        initialValues[f.name] = (f.options && f.options.length > 0) ? (f.optionsType === 'rich' ? f.options[0].label : f.options[0]) : '';
      } else {
        initialValues[f.name] = '';
      }
    });
    setFormValues(initialValues);
  }, [selectedTemplate]);

  useEffect(() => {
    if (!selectedTemplate) return;
    let resultText = selectedTemplate.data.template;
    (selectedTemplate.data.fields || []).forEach(field => {
        const key = field.name;
        let valueToInsert = formValues[key];

        if (field.type === 'checkbox') {
            const selectedLabels = formValues[key] || [];
            if (selectedLabels.length === 0) { valueToInsert = ''; }
            else if (field.optionsType === 'rich') {
                const richContent = selectedLabels.map(label => (field.options.find(opt => opt.label === label)?.content || '')).filter(Boolean);
                valueToInsert = richContent.join('\n\n');
            } else {
                valueToInsert = selectedLabels.join(', ');
            }
        } else if (field.type === 'dropdown') {
            const selectedLabel = formValues[key];
            if (field.optionsType === 'rich') {
                valueToInsert = field.options.find(opt => opt.label === selectedLabel)?.content || '';
            }
        }
      
        resultText = resultText.replace(new RegExp(`{${key}}`, 'g'), valueToInsert || '');
    });
    setGeneratedPrompt(resultText);
  }, [formValues, selectedTemplate]);
  
  const handleSelectTemplate = (templateId) => {
    const allTemplatesFlat = [...templateTree[0].templates, ...templateTree[1].templates];
    const found = allTemplatesFlat.find(t => t.id === templateId);
    if (found) { setSelectedTemplate(found); }
  };

  const handleDeleteTemplate = (templateId) => {
    if (deleteCustomTemplate(templateId)) {
      if (selectedTemplate && selectedTemplate.id === templateId) { setSelectedTemplate(builtInTemplates[0] || null); }
      loadData();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const field = (selectedTemplate.data.fields || []).find(f => f.name === name);

    if (field && field.type === 'checkbox') {
        setFormValues(prev => {
            const currentValues = prev[name] || [];
            const newValues = checked 
                ? [...currentValues, value] 
                : currentValues.filter(item => item !== value);
            return { ...prev, [name]: newValues };
        });
    } else {
       setFormValues(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt).then(() => alert('Промт скопирован!'));
  };

  const handleDragStart = (e, fieldName, draggedLabel) => {
    dragItem.current = { fieldName, draggedLabel };
    e.dataTransfer.effectAllowed = "move";
    e.target.classList.add('dragging');
  };

  const handleDragEnter = (e, fieldName, currentLabel) => {
    dragOverItem.current = { fieldName, currentLabel };
    e.target.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.target.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.target.classList.remove('drag-over');

    const { fieldName, draggedLabel } = dragItem.current;
    const { currentLabel: dropTargetLabel } = dragOverItem.current;

    if (fieldName !== dragOverItem.current.fieldName) {
        return;
    }

    const currentSelected = [...formValues[fieldName]];
    const draggedIndex = currentSelected.indexOf(draggedLabel);
    const dropTargetIndex = currentSelected.indexOf(dropTargetLabel);

    if (draggedIndex === -1 || dropTargetIndex === -1) {
        return;
    }

    const newOrder = [...currentSelected];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropTargetIndex, 0, removed);

    setFormValues(prev => ({
        ...prev,
        [fieldName]: newOrder
    }));

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    const allItems = document.querySelectorAll('.checkbox-item');
    allItems.forEach(item => item.classList.remove('drag-over'));
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <>
      <div className="template-manager-column">
        <TemplateManager templateTree={templateTree} onSelectTemplate={handleSelectTemplate} onDeleteTemplate={handleDeleteTemplate} selectedTemplateId={selectedTemplate?.id} />
      </div>
      
      {selectedTemplate ? (
        <div className="generator-form">
          <h2>{selectedTemplate.data.prompt_name}</h2>
          <div className="form-container">
            {(selectedTemplate.data.fields || []).map(field => {
              const key = `field-${field.name}`;
              switch(field.type) {
                case 'textarea':
                  return (<div className="form-field" key={key}><label>{field.label}</label><textarea name={field.name} placeholder={field.placeholder} value={formValues[field.name] || ''} onChange={handleInputChange} rows="4"/></div>);
                case 'checkbox':
                  return (
                    <fieldset className="form-field checkbox-group-fieldset" key={key}>
                      <legend>{field.label}</legend>
                      <div className="checkbox-group-container">
                        {/* Сначала рендерим выбранные опции в их текущем порядке */}
                        {(formValues[field.name] || []).map((selectedLabel, index) => {
                          const fieldOption = field.options.find(opt => 
                              field.optionsType === 'rich' ? opt.label === selectedLabel : opt === selectedLabel
                          );
                          const label = field.optionsType === 'rich' ? fieldOption.label : fieldOption;

                          return (
                            <div 
                              className="checkbox-item draggable-checkbox-item" 
                              key={`${label}-${index}`} 
                              draggable 
                              onDragStart={(e) => handleDragStart(e, field.name, label)}
                              onDragEnter={(e) => handleDragEnter(e, field.name, label)}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => e.preventDefault()}
                            >
                              <input 
                                type="checkbox" 
                                id={`${field.name}-${label}`} 
                                name={field.name} 
                                value={label} 
                                checked={true} 
                                onChange={handleInputChange}
                              />
                              <label htmlFor={`${field.name}-${label}`}>{label}</label>
                            </div>
                          );
                        })}
                        
                        {/* Затем рендерим невыбранные опции (без возможности Drag-and-Drop) */}
                        {(field.options || []).filter(option => {
                            const label = field.optionsType === 'rich' ? option.label : option;
                            return !(formValues[field.name] || []).includes(label);
                        }).map((option, index) => {
                            const label = field.optionsType === 'rich' ? option.label : option;
                            return (
                                <div className="checkbox-item" key={`${label}-unselected-${index}`}>
                                    <input 
                                        type="checkbox" 
                                        id={`${field.name}-${label}-unselected`} 
                                        name={field.name} 
                                        value={label} 
                                        checked={false} 
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor={`${field.name}-${label}-unselected`}>{label}</label>
                                </div>
                            );
                        })}
                      </div>
                    </fieldset>
                  );
                case 'dropdown':
                    return (
                        <div className="form-field" key={key}>
                            <label>{field.label}</label>
                            <select name={field.name} value={formValues[field.name] || ''} onChange={handleInputChange}>
                                {(field.options || []).map((option, index) => {
                                    const label = field.optionsType === 'rich' ? option.label : option;
                                    return <option key={`${label}-${index}`} value={label}>{label}</option>
                                })}
                            </select>
                        </div>
                    );
                case 'text':
                default:
                  return (<div className="form-field" key={key}><label>{field.label}</label><input type="text" name={field.name} placeholder={field.placeholder} value={formValues[field.name] || ''} onChange={handleInputChange}/></div>);
              }
            })}
          </div>
          <div className="result-container">
            <h3>Готовый промт:</h3>
            <textarea readOnly value={generatedPrompt} rows="10"/>
            <button onClick={handleCopyToClipboard} className="copy-button">Скопировать</button>
          </div>
        </div>
      ) : ( <div className="generator-form-placeholder"><h2>Шаблоны не найдены</h2><p>Создайте свой первый шаблон в <a href="/builder">Конструкторе шаблонов</a>.</p></div> )}
    </>
  );
}

export default Generator;
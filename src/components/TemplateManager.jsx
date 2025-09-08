function TemplateManager({ templateTree, onSelectTemplate, onDeleteTemplate, selectedTemplateId }) {
  
  const handleDelete = (e, templateId) => {
    e.stopPropagation(); // Останавливаем всплытие, чтобы не сработал клик по строке
    if (window.confirm('Вы уверены, что хотите удалить этот шаблон?')) {
      onDeleteTemplate(templateId);
    }
  };

  return (
    <div className="template-manager">
      {templateTree.map(category => (
        <details className="category-group" key={category.id} open>
          <summary>{category.name}</summary>
          <ul>
            {category.templates.map(template => (
              <li
                key={template.id}
                className={selectedTemplateId === template.id ? 'active' : ''}
                onClick={() => onSelectTemplate(template.id)}
              >
                <span className="template-name">{template.name.replace('(своё) ', '')}</span>
                {category.id === 'custom' && (
                  <button
                    className="delete-template-btn"
                    title="Удалить шаблон"
                    onClick={(e) => handleDelete(e, template.id)}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

export default TemplateManager;
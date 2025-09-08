// src/components/Preview.jsx
function Preview({ templateData }) {
  return (
    <div className="preview-container">
      <h3>{templateData.prompt_name || "Название шаблона"}</h3>
      <form>
        {(templateData.fields || []).map((field, index) => {
            const key = `prev-${field.name}-${index}`;
            switch (field.type) {
                case 'textarea':
                    return (<div className="form-field" key={key}><label>{field.label || "Лейбл"}</label><textarea placeholder={field.placeholder} rows="3" disabled/></div>);
                case 'checkbox':
                    return (
                        <fieldset className="form-field checkbox-group-fieldset" key={key}>
                            <legend>{field.label || "Лейбл"}</legend>
                            <div className="checkbox-group-container">
                                {(field.options || []).map((option, optIndex) => {
                                    const label = field.optionsType === 'rich' ? option.label : option;
                                    return (<div className="checkbox-item" key={optIndex}><input type="checkbox" id={`${key}-${optIndex}`} disabled /><label htmlFor={`${key}-${optIndex}`}>{label}</label></div>);
                                })}
                            </div>
                        </fieldset>
                    );
                case 'dropdown':
                    return (
                         <div className="form-field" key={key}>
                            <label>{field.label || "Лейбл"}</label>
                            <select disabled>
                                {(field.options || []).map((option, optIndex) => {
                                    const label = field.optionsType === 'rich' ? option.label : option;
                                    return <option key={optIndex}>{label}</option>
                                })}
                            </select>
                        </div>
                    );
                case 'text':
                default:
                    return (<div className="form-field" key={key}><label>{field.label || "Лейбл"}</label><input type="text" placeholder={field.placeholder} disabled/></div>);
            }
        })}
      </form>
      <div className="result-container" style={{marginTop: '20px', border: 'none', paddingTop: '0'}}><textarea value={templateData.template || "Текст шаблона..."} readOnly rows="5"/><button className="copy-button" disabled>Скопировать</button></div>
    </div>
  );
}
export default Preview;
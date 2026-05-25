import './ToneSelector.css';

export default function ToneSelector({ activeTone, onToneChange }) {
  // Normalize legacy 'friendly' tone to 'beginner'
  const normalizedTone = activeTone === 'friendly' ? 'beginner' : activeTone;

  const handleChange = (e) => {
    onToneChange(e.target.value);
  };

  return (
    <div className="tone-selector" id="tone-selector">
      <label htmlFor="tone-style-select" className="tone-label">
        Explanation Style
      </label>
      <div className="select-wrapper">
        <select
          id="tone-style-select"
          className="tone-select-dropdown"
          value={normalizedTone}
          onChange={handleChange}
        >
          <option value="beginner">Beginner Friendly</option>
          <option value="teacher">Balanced</option>
          <option value="professional">Professional</option>
        </select>
        <span className="select-arrow">▼</span>
      </div>
    </div>
  );
}

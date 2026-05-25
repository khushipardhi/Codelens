import { SKILL_LEVELS } from '../../services/adaptiveEngine';
import { Brain, BarChart3 } from 'lucide-react';
import './SkillIndicator.css';

export default function SkillIndicator({ skillLevel, totalAnalyses, onOpenConceptHelp }) {
  const level = SKILL_LEVELS[skillLevel] || SKILL_LEVELS.beginner;

  return (
    <div className="skill-indicator" id="skill-indicator">
      <div className="skill-badge" style={{ '--skill-color': level.color }}>
        <span className="skill-icon">{level.icon}</span>
        <div className="skill-info">
          <span className="skill-label">{level.label}</span>
          <span className="skill-desc">{level.description}</span>
        </div>
      </div>
      <div className="skill-stats">
        <span className="stat-item" title="Total analyses">
          <BarChart3 size={12} />
          {totalAnalyses}
        </span>
      </div>
      <button
        className="learn-btn"
        onClick={onOpenConceptHelp}
        title="Learn a concept"
        id="learn-concept-btn"
      >
        <Brain size={14} />
        Learn
      </button>
    </div>
  );
}

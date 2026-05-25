import { Sun, Moon, Settings, Zap, Info } from 'lucide-react';
import './Navbar.css';

/**
 * Navbar
 * -------
 * Clean top navigation bar with:
 * - Logo / brand
 * - Theme toggle
 * - Settings button
 * - Optional "About" link (minimal, not a tab)
 */
export default function Navbar({ theme, onToggleTheme, onOpenSettings, onOpenAbout }) {
  return (
    <nav className="navbar" id="main-navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="logo-icon" aria-hidden="true">
            <Zap size={18} strokeWidth={2.5} />
          </div>
          <div className="logo-text">
            <span className="logo-name">
              Code<span className="logo-accent">Lens</span>
            </span>
            <span className="logo-tagline">Understand Errors. Build Confidence.</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="navbar-controls">
          {/* About link — minimal text link, not a full tab */}
          {onOpenAbout && (
            <button
              className="navbar-text-btn glow-btn"
              onClick={onOpenAbout}
              id="about-btn"
              title="About CodeLens"
              aria-label="About CodeLens"
            >
              <Info size={15} />
              <span>About</span>
            </button>
          )}

          <div className="navbar-divider" role="separator" />

          <button
            className="navbar-btn glow-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            id="theme-toggle-btn"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            className="navbar-btn glow-btn"
            onClick={onOpenSettings}
            aria-label="Open settings"
            id="settings-btn"
            title="Settings"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>
    </nav>
  );
}

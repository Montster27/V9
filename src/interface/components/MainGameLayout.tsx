/**
 * /src/interface/components/MainGameLayout.tsx
 *
 * Main game layout component integrating all connected UI components
 */

import React from 'react';
// Import what's actually available in the codebase
import ResourceDisplayEnhanced from './resources/ResourceDisplayEnhanced';
import TimeControlsConnected from './time/TimeControlsConnected';
import NewsStreamConnected from './news/NewsStreamConnected';
import './MainGameLayout.css';

interface MainGameLayoutProps {
  className?: string;
}

/**
 * MainGameLayout integrates all real-time UI components into a cohesive game interface
 */
const MainGameLayout: React.FC<MainGameLayoutProps> = ({ className = '' }) => {
  return (
    <div className={`main-game-layout ${className}`}>
      <header className="game-header">
        <h1 className="game-title">The Middle Age Multiverse</h1>
        <TimeControlsConnected />
      </header>

      <main className="game-content">
        <aside className="game-sidebar">
          <ResourceDisplayEnhanced className="resource-panel" />
          <NewsStreamConnected className="news-panel" />
        </aside>

        <section className="game-main-area">
          <div className="game-world">
            {/* This will be replaced with the main game view when implemented */}
            <div className="placeholder-content">
              <h2>Main Game Area</h2>
              <p>This area will display the main game interaction interface.</p>
              <p>UI components are now connected to real-time data!</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="game-footer">
        <div className="game-version">v0.1.0 - Development Build</div>
      </footer>
    </div>
  );
};

export default MainGameLayout;

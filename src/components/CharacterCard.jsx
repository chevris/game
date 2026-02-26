import { useState } from 'react';
import './CharacterCard.css';

/**
 * A selectable character card for the home screen.
 * Displays a portrait, the character's name, and a bio overlay triggered by ⓘ.
 *
 * @param {Object}   character - CharacterDef object from src/data/characters.js
 * @param {boolean}  selected  - Whether this card is currently selected
 * @param {Function} onSelect  - Callback when the card body is clicked (toggle selection)
 */
export function CharacterCard({ character, selected, onSelect }) {
  const [bioVisible, setBioVisible] = useState(false);

  const handleCardClick = (e) => {
    // Don't trigger selection when the info button is clicked
    if (e.target.closest('.info-btn') || e.target.closest('.bio-overlay')) return;
    onSelect(character.id);
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
    setBioVisible(true);
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    setBioVisible(false);
  };

  return (
    <div
      className={`character-card${selected ? ' selected' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(character.id); }}
      style={{ '--accent-color': character.playerColor }}
    >
      <button
        className="info-btn"
        onClick={handleInfoClick}
        aria-label={`Informationen zu ${character.name}`}
        title={`Informationen zu ${character.name}`}
      >
        ⓘ
      </button>

      <img
        src={character.imageSrc}
        alt={character.name}
        className="card-portrait"
      />

      <p className="card-name">{character.name}</p>

      {selected && (
        <div className="selected-badge" aria-hidden="true">✓</div>
      )}

      {bioVisible && (
        <div className="bio-overlay" role="dialog" aria-label={`Biografie: ${character.name}`}>
          <button className="bio-close" onClick={handleCloseClick} aria-label="Schließen">×</button>
          <h3 className="bio-name">{character.name}</h3>
          <p className="bio-text">{character.bio}</p>
        </div>
      )}
    </div>
  );
}

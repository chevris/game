import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { characters } from '../data/characters';
import { CharacterCard } from './CharacterCard';
import './GameSetup.css';

export function GameSetup() {
  const [selectedIndices, setSelectedIndices] = useState([]);
  const initializeGame = useGameStore(state => state.initializeGame);

  const handleSelect = (charId) => {
    setSelectedIndices(prev => {
      if (prev.includes(charId)) {
        return prev.filter(id => id !== charId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, charId];
    });
  };

  const handleStart = () => {
    if (selectedIndices.length === 0) return;
    initializeGame(selectedIndices, 7);
  };

  return (
    <div className="game-setup">
      <h1>Der Weg zur Gleichheit</h1>

      <p className="game-rules">
        Sei die Erste, die das Ziel erreicht, indem du Fragen zur Geschichte der
        Frauen weltweit richtig beantwortest. Aber Vorsicht:&nbsp;
        <em>„Manche Fragen sind kniffliger als andere!"</em>
      </p>

      <p className="select-hint">Wähle 1 bis 3 Spielerinnen:</p>

      <div className="cards-row">
        {characters.map(character => (
          <CharacterCard
            key={character.id}
            character={character}
            selected={selectedIndices.includes(character.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <button
        className="start-button"
        onClick={handleStart}
        disabled={selectedIndices.length === 0}
      >
        Spiel starten
      </button>
    </div>
  );
}

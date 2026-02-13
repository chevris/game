import { useEffect } from 'react';

/**
 * Custom hook for German text-to-speech
 * @param {string} text - Text to speak
 * @param {boolean} enabled - Whether TTS is enabled
 */
export function useSpeechSynthesis(text, enabled = true) {
  useEffect(() => {
    if (!enabled || !text) return;
    
    // Check browser support
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported in this browser');
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9; // Slightly slower for clarity
    
    // Try to find a German voice
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const germanVoice = voices.find(v => v.lang.startsWith('de'));
      if (germanVoice) {
        utterance.voice = germanVoice;
      }
    };
    
    // Load voices (some browsers load asynchronously)
    if (speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }
    
    // Speak the text
    speechSynthesis.speak(utterance);
    
    // Cleanup
    return () => {
      speechSynthesis.cancel();
    };
  }, [text, enabled]);
}

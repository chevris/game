import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for voice recognition (A/B/C answers)
 * @param {function} onResult - Callback when valid answer detected
 * @param {boolean} enabled - Whether voice recognition is active
 * @returns {Object} { supported, listening, error, start, stop }
 */
export function useSpeechRecognition(onResult, enabled = true) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const hasReceivedResult = useRef(false);
  
  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Use English for A/B/C recognition
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setListening(true);
      setError(null);
      hasReceivedResult.current = false;
      
      // Set 10-second timeout
      timeoutRef.current = setTimeout(() => {
        recognition.stop();
        setError('No answer detected - timeout');
      }, 10000);
    };
    
    recognition.onresult = (event) => {
      // Prevent double-input
      if (hasReceivedResult.current) return;
      
      const transcript = event.results[0][0].transcript.toUpperCase().trim();
      
      // Filter for A/B/C only
      if (['A', 'B', 'C'].includes(transcript)) {
        hasReceivedResult.current = true;
        onResult(transcript);
        recognition.stop();
      }
    };
    
    recognition.onerror = (event) => {
      setListening(false);
      
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied');
      } else if (event.error === 'no-speech') {
        setError('No speech detected');
      } else {
        setError(`Error: ${event.error}`);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    
    recognition.onend = () => {
      setListening(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    
    recognitionRef.current = recognition;
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onResult]);
  
  const start = () => {
    if (!supported || !enabled || listening) return;
    
    try {
      hasReceivedResult.current = false;
      recognitionRef.current?.start();
    } catch (err) {
      setError('Failed to start voice recognition');
    }
  };
  
  const stop = () => {
    recognitionRef.current?.stop();
  };
  
  return {
    supported,
    listening,
    error,
    start,
    stop
  };
}

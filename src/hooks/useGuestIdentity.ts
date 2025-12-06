import { useState, useEffect } from 'react';

interface GuestIdentity {
  sessionId: string;
  guestName: string | null;
  setGuestName: (name: string) => void;
  clearGuestName: () => void;
}

const generateSessionId = (): string => {
  return 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const useGuestIdentity = (): GuestIdentity => {
  const [sessionId, setSessionId] = useState<string>('');
  const [guestName, setGuestNameState] = useState<string | null>(null);

  useEffect(() => {
    // Get or create session ID
    let storedSessionId = localStorage.getItem('guest_session_id');
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem('guest_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);

    // Get stored guest name
    const storedName = localStorage.getItem('guest_name');
    if (storedName) {
      setGuestNameState(storedName);
    }
  }, []);

  const setGuestName = (name: string) => {
    localStorage.setItem('guest_name', name);
    setGuestNameState(name);
  };

  const clearGuestName = () => {
    localStorage.removeItem('guest_name');
    setGuestNameState(null);
  };

  return {
    sessionId,
    guestName,
    setGuestName,
    clearGuestName
  };
};

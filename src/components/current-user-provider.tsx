"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "meeting-room-app:my-name";
const DEFAULT_NAME = "田中 太郎";

type CurrentUserContextValue = {
  myName: string;
  setMyName: (name: string) => void;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [myName, setMyNameState] = useState(DEFAULT_NAME);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // One-time hydration from localStorage, unavailable during server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored !== null) setMyNameState(stored);
  }, []);

  function setMyName(name: string) {
    setMyNameState(name);
    window.localStorage.setItem(STORAGE_KEY, name);
  }

  return (
    <CurrentUserContext.Provider value={{ myName, setMyName }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }
  return ctx;
}

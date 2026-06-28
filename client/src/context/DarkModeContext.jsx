import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('bankflow-dark') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('bankflow-dark', dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      document.body.style.background = '#0f172a';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.background = '#f1f5f9';
    }
  }, [dark]);

  const toggle = () => setDark((d) => !d);

  return (
    <DarkModeContext.Provider value={{ dark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => useContext(DarkModeContext);

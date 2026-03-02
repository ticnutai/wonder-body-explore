import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Level } from '@/data/organs';

interface LevelContextType {
  level: Level;
  setLevel: (level: Level) => void;
}

const LevelContext = createContext<LevelContextType>({
  level: 'kids',
  setLevel: () => {},
});

export const LevelProvider = ({ children }: { children: ReactNode }) => {
  const [level, setLevel] = useState<Level>('kids');
  return (
    <LevelContext.Provider value={{ level, setLevel }}>
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => useContext(LevelContext);

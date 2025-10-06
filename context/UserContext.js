'use client';
import { createContext, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = UserContext.Provider;

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

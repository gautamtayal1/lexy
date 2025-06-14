import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTheme } from '../store/themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  useEffect(() => {
    // Load theme from localStorage on mount - only run once
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme && savedTheme !== theme) {
      dispatch(setTheme(savedTheme));
    }
  }, [dispatch]); // Removed 'theme' from dependencies to prevent infinite loop

  useEffect(() => {
    // Save theme to localStorage whenever it changes
    localStorage.setItem('theme', theme);
  }, [theme]);

  return theme;
}; 
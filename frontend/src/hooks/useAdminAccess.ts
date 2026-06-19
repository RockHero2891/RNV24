"use client";

import { useEffect, useState } from 'react';

export function useAdminAccess() {
  const [clickCount, setClickCount] = useState(0);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedCount = localStorage.getItem('rnv24_admin_click_count');
    if (storedCount) {
      setClickCount(parseInt(storedCount, 10));
    }
  }, []);

  const handleSevenClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    localStorage.setItem('rnv24_admin_click_count', newCount.toString());

    if (newCount >= 5) {
      setShowAdminButton(true);
    }
  };

  const loginAsAdmin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: import.meta.env.VITE_ADMIN_EMAIL || 'admin',
          password: import.meta.env.VITE_ADMIN_PASSWORD || ''
        }),
      });

      if (response.ok) {
        const { user } = await response.json();
        if (user?.isAdmin) {
          setIsAdmin(true);
          localStorage.setItem('rnv24_admin_logged_in', 'true');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('rnv24_admin_logged_in');
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('rnv24_admin_logged_in') === 'true';
    if (isLoggedIn) {
      setIsAdmin(true);
    }
  }, []);

  return {
    clickCount,
    showAdminButton,
    isAdmin,
    handleSevenClick,
    loginAsAdmin,
    logout,
  };
}
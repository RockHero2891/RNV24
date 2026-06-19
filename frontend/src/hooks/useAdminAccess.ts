"use client";

import { useEffect, useState } from 'react';

export function useAdminAccess() {
  const [clickCount, setClickCount] = useState(0);
  const [showAdminButton, setShowAdminButton] = useState(false);

  useEffect(() => {
    const storedCount = localStorage.getItem('rnv24_admin_click_count');
    if (storedCount) {
      const count = parseInt(storedCount, 10);
      setClickCount(count);
      setShowAdminButton(count >= 5);
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

  return {
    clickCount,
    showAdminButton,
    handleSevenClick,
  };
}

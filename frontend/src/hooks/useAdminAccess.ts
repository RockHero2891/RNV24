import { useState } from 'react';

export function useAdminAccess() {
  const [clickCount, setClickCount] = useState(0);

  const handleSevenClick = (): boolean => {
    const newCount = clickCount + 1;
    if (newCount >= 5) {
      setClickCount(0);
      return true;
    }
    setClickCount(newCount);
    return false;
  };

  return {
    clickCount,
    handleSevenClick,
  };
}

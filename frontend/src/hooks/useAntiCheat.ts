import { useCallback, useEffect, useState } from 'react';

interface AntiCheatState {
  blurCount: number;
  isBlurred: boolean;
  fullscreen: boolean;
  proctoring: {
    camera: 'active' | 'simulated';
    microphone: 'active' | 'simulated';
    screenShare: 'active' | 'simulated';
  };
}

export function useAntiCheat(onBlur?: () => void) {
  const [state, setState] = useState<AntiCheatState>({
    blurCount: 0,
    isBlurred: false,
    fullscreen: !!document.fullscreenElement,
    proctoring: {
      camera: 'simulated',
      microphone: 'simulated',
      screenShare: 'simulated',
    },
  });

  useEffect(() => {
    const handleVisibility = () => {
      const blurred = document.hidden;
      setState((prev) => ({
        ...prev,
        isBlurred: blurred,
        blurCount: blurred ? prev.blurCount + 1 : prev.blurCount,
      }));
      if (blurred) onBlur?.();
    };

    const handleFullscreen = () => {
      setState((prev) => ({ ...prev, fullscreen: !!document.fullscreenElement }));
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreen);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreen);
    };
  }, [onBlur]);

  const requestFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // El usuario puede rechazar; no bloqueamos el examen
    }
  }, []);

  const blockClipboard = useCallback((e: ClipboardEvent) => {
    e.preventDefault();
  }, []);

  return { ...state, requestFullscreen, blockClipboard };
}

export function preventCopyPaste(e: React.ClipboardEvent | React.KeyboardEvent) {
  e.preventDefault();
}

export function preventContextMenu(e: React.MouseEvent) {
  e.preventDefault();
}

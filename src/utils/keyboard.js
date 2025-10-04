//test method for keyboard detection 

import { useEffect } from 'react';

export function useKeyboardVisibility() {
  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.clientHeight;
      
      if (windowHeight < documentHeight * 0.75) {
        document.body.classList.add('keyboard-visible');
      } else {
        document.body.classList.remove('keyboard-visible');
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
}


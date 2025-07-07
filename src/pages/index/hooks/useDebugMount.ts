
import { useEffect, useRef } from 'react';

export const useDebugMount = (componentName: string) => {
  const componentId = useRef(Math.random().toString(36).substr(2, 9));
  const mountCount = useRef(0);
  const renderCount = useRef(0);

  useEffect(() => {
    mountCount.current += 1;
    console.log(`[MOUNT DEBUG] ${componentName} ${componentId.current} - Mount #${mountCount.current}`);
    
    return () => {
      console.log(`[MOUNT DEBUG] ${componentName} ${componentId.current} - Unmount`);
    };
  }, [componentName]);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`[RENDER DEBUG] ${componentName} ${componentId.current} - Render #${renderCount.current}`);
  });

  return {
    componentId: componentId.current,
    mountCount: mountCount.current,
    renderCount: renderCount.current
  };
};

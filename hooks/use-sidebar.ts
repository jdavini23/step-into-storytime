import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

type SidebarState = 'expanded' | 'collapsed' | 'mobile';

export function useSidebar() {
  const [state, setState] = useState<SidebarState>('expanded');
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (isMobile) {
      setState('mobile');
    } else {
      setState('expanded');
    }
  }, [isMobile]);

  return {
    state,
    setState,
    isMobile,
  };
}

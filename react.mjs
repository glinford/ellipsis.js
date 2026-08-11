'use client';

import { useCallback, useRef } from 'react';
import Ellipsis from './ellipsis.mjs';

function useEllipsis({ lines = 2, portrait = null } = {}) {
  const instance = useRef(null);

  return useCallback((element) => {
    instance.current?.destroy();
    instance.current = null;

    if (element) {
      instance.current = Ellipsis({ className: false, lines, portrait });
      instance.current.add(element);
    }
  }, [lines, portrait]);
}

export { useEllipsis };
export default useEllipsis;

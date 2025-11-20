import { useEffect } from 'react';
import CircuitFlowAnimation from '@/lib/sfs-circuit-flow';

/**
 * Hook to initialize the SFS Circuit Flow background animation
 * Automatically cleans up on component unmount
 */
export function useCircuitAnimation(canvasId: string = 'sfs-circuit') {
  useEffect(() => {
    let animation: CircuitFlowAnimation | null = null;

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        animation = new CircuitFlowAnimation(canvasId);
      }
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (animation) {
        animation.destroy();
      }
    };
  }, [canvasId]);
}

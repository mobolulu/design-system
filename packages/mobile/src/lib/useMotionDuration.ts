import { useReducedMotion } from 'react-native-reanimated';
import { motion } from '../tokens';

/**
 * Resolves a motion-token duration against the device's reduced-motion
 * setting. Animations collapse to `motion.duration.instant` rather than
 * being removed, so state still changes — just without the tween.
 */
export function useMotionDuration(duration: number): number {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? motion.duration.instant : duration;
}

import { useFrame } from '@react-three/fiber/native';

type FrameCallback = Parameters<typeof useFrame>[0];

/**
 * useFrame runs outside React's render cycle, so a thrown error inside it
 * does not trigger an error boundary or Expo Go's red box — it can silently
 * stop the render loop and leave a blank screen. This wraps the callback so
 * a bug in one system (e.g. rain, clouds) logs loudly instead of blanking
 * the whole scene.
 */
export function useSafeFrame(callback: FrameCallback, tag: string) {
  useFrame((state, delta, frame) => {
    try {
      callback(state, delta, frame);
    } catch (err) {
      console.error(`[useFrame:${tag}] `, err);
    }
  });
}

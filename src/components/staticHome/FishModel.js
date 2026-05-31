import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { AnimationMixer } from "three";
import { SkeletonUtils } from "three-stdlib";

export default function FishModel({ animationSpeed = 1 }) {
  const { scene, animations } = useGLTF("/models/koi.glb");

  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const mixer = useMemo(() => new AnimationMixer(clonedScene), [clonedScene]);

  useEffect(() => {
    const actions = animations.map((clip) => {
      const action = mixer.clipAction(clip);
      action.reset().play();
      return action;
    });

    return () => {
      actions.forEach((a) => a.stop());
      mixer.stopAllAction();
      mixer.uncacheRoot(clonedScene);
    };
  }, [mixer, animations, clonedScene]);

  useFrame((_, delta) => {
    mixer.update(delta * animationSpeed);
  });

  return <primitive object={clonedScene} scale={6} position={[0, -0.5, 0]} />;
}

useGLTF.preload("/models/koi.glb");

import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Stars, Text } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import libraryBackground from "../assets/library-bg.jpg";

const books = [
  {
    title: "THE\nALCHEMIST",
    author: "Paulo Coelho",
    position: [-3.55, 0.15, -0.45],
    rotation: [0.08, -0.38, -0.08],
    scale: 1.12,
    color: "#17130f",
    accent: "#c99a4a",
    page: "#d6c09a",
    speed: 0.48,
    phase: 0,
  },
  {
    title: "Atomic\nHabits",
    author: "James Clear",
    position: [3.28, 1.05, -0.9],
    rotation: [-0.08, 0.36, 0.08],
    scale: 0.98,
    color: "#d5c19c",
    accent: "#735a38",
    page: "#e0d1b5",
    speed: 0.44,
    phase: 1.6,
  },
  {
    title: "The Psychology\nof Money",
    author: "Morgan Housel",
    position: [3.62, -1.28, -1.05],
    rotation: [0.06, 0.5, 0.09],
    scale: 0.9,
    color: "#151515",
    accent: "#c9a45b",
    page: "#d2c09d",
    speed: 0.39,
    phase: 2.4,
  },
  {
    title: "THE SILENT\nPATIENT",
    author: "Alex Michaelides",
    position: [-2.48, -1.65, -0.95],
    rotation: [-0.07, -0.3, -0.09],
    scale: 0.86,
    color: "#d1c3ad",
    accent: "#765846",
    page: "#dfcfb1",
    speed: 0.42,
    phase: 3.1,
  },
  {
    title: "LIBRARY",
    author: "COLLECTION",
    position: [-4.7, 1.95, -2.4],
    rotation: [0.18, -0.52, 0.14],
    scale: 0.54,
    color: "#49231c",
    accent: "#d0a356",
    page: "#d6c09d",
    speed: 0.34,
    phase: 4,
  },
  {
    title: "READ",
    author: "DISCOVER",
    position: [1.35, 2.55, -3.1],
    rotation: [0.15, 0.18, -0.08],
    scale: 0.46,
    color: "#263b4c",
    accent: "#c5a05b",
    page: "#d9c6a3",
    speed: 0.3,
    phase: 4.8,
  },
];

function PageEdges({ page }) {
  return (
    <group position={[0.69, 0, 0]}>
      {Array.from({ length: 18 }).map((_, index) => (
        <mesh key={index} position={[0.015, -0.78 + index * 0.092, 0]}>
          <boxGeometry args={[0.018, 0.032, 0.035]} />
          <meshStandardMaterial color={page} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function Book({ book }) {
  const group = useRef();

  useFrame((state, delta) => {
    if (!group.current) return;

    const t = state.clock.getElapsedTime() + book.phase;
    const mx = state.pointer.x;
    const my = state.pointer.y;

    const targetPosition = [
      book.position[0] + Math.sin(t * book.speed) * 0.2 + mx * 0.16,
      book.position[1] + Math.sin(t * book.speed * 1.25) * 0.25 + my * 0.12,
      book.position[2] + Math.cos(t * book.speed * 0.6) * 0.12,
    ];

    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      targetPosition[0],
      2.6,
      delta
    );
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      targetPosition[1],
      2.6,
      delta
    );
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      targetPosition[2],
      2.6,
      delta
    );

    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      book.rotation[0] +
        Math.sin(t * book.speed * 0.8) * 0.075 -
        my * 0.045,
      2.6,
      delta
    );

    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      book.rotation[1] +
        Math.sin(t * book.speed) * 0.14 +
        mx * 0.09,
      2.6,
      delta
    );

    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      book.rotation[2] +
        Math.sin(t * book.speed * 0.75) * 0.05,
      2.6,
      delta
    );
  });

  return (
    <group
      ref={group}
      position={book.position}
      rotation={book.rotation}
      scale={book.scale}
    >
      <RoundedBox
        args={[1.48, 2.08, 0.36]}
        radius={0.065}
        smoothness={8}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={book.color}
          roughness={0.34}
          metalness={0.05}
          clearcoat={0.3}
          clearcoatRoughness={0.28}
        />
      </RoundedBox>

      <RoundedBox
        args={[1.31, 1.9, 0.055]}
        radius={0.035}
        smoothness={5}
        position={[0, 0, 0.205]}
        castShadow
      >
        <meshPhysicalMaterial
          color={book.color}
          roughness={0.4}
          metalness={0.04}
          clearcoat={0.22}
        />
      </RoundedBox>

      <mesh position={[0, 0, 0.24]}>
        <boxGeometry args={[1.13, 1.68, 0.035]} />
        <meshStandardMaterial
          color={book.page}
          roughness={0.92}
        />
      </mesh>

      <mesh position={[0, 0, -0.205]}>
        <boxGeometry args={[1.26, 1.9, 0.045]} />
        <meshPhysicalMaterial
          color={book.color}
          roughness={0.48}
          metalness={0.03}
        />
      </mesh>

      <mesh position={[-0.755, 0, 0]}>
        <boxGeometry args={[0.09, 2.04, 0.4]} />
        <meshPhysicalMaterial
          color={book.color}
          roughness={0.3}
          metalness={0.06}
          clearcoat={0.25}
        />
      </mesh>

      <mesh position={[-0.755, 0, 0.205]}>
        <boxGeometry args={[0.025, 1.72, 0.025]} />
        <meshStandardMaterial
          color={book.accent}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      <mesh position={[0, 0.9, 0.242]}>
        <boxGeometry args={[1.04, 0.025, 0.018]} />
        <meshStandardMaterial
          color={book.accent}
          roughness={0.28}
          metalness={0.7}
        />
      </mesh>

      <mesh position={[0, -0.9, 0.242]}>
        <boxGeometry args={[1.04, 0.025, 0.018]} />
        <meshStandardMaterial
          color={book.accent}
          roughness={0.28}
          metalness={0.7}
        />
      </mesh>

      <mesh position={[-0.51, 0, 0.243]}>
        <boxGeometry args={[0.022, 1.65, 0.018]} />
        <meshStandardMaterial
          color={book.accent}
          roughness={0.3}
          metalness={0.65}
        />
      </mesh>

      <mesh position={[0.51, 0, 0.243]}>
        <boxGeometry args={[0.022, 1.65, 0.018]} />
        <meshStandardMaterial
          color={book.accent}
          roughness={0.3}
          metalness={0.65}
        />
      </mesh>

      <Text
        position={[0, 0.34, 0.268]}
        fontSize={0.18}
        maxWidth={0.9}
        lineHeight={0.98}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={book.accent}
        outlineWidth={0.004}
        outlineColor="#080706"
      >
        {book.title}
      </Text>

      <Text
        position={[0, -0.62, 0.268]}
        fontSize={0.064}
        maxWidth={0.88}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={book.accent}
        letterSpacing={0.012}
      >
        {book.author}
      </Text>

      <PageEdges page={book.page} />
    </group>
  );
}

function FloatingDust({ position, size, speed, phase = 0 }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    const t = state.clock.getElapsedTime() + phase;

    ref.current.position.x =
      position[0] + Math.sin(t * speed) * 0.28;
    ref.current.position.y =
      position[1] + Math.cos(t * speed * 0.72) * 0.24;
    ref.current.position.z =
      position[2] + Math.sin(t * speed * 0.5) * 0.12;
    ref.current.scale.setScalar(
      0.8 + (Math.sin(t * speed * 1.7) + 1) * 0.2
    );
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshBasicMaterial
        color="#f4dca8"
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}

function SceneRig() {
  const ref = useRef();

  useFrame((state, delta) => {
    if (!ref.current) return;

    const t = state.clock.getElapsedTime();
    const mx = state.pointer.x;
    const my = state.pointer.y;

    ref.current.rotation.y = THREE.MathUtils.damp(
      ref.current.rotation.y,
      Math.sin(t * 0.11) * 0.02 + mx * 0.035,
      2,
      delta
    );

    ref.current.rotation.x = THREE.MathUtils.damp(
      ref.current.rotation.x,
      Math.cos(t * 0.14) * 0.01 - my * 0.018,
      2,
      delta
    );

    ref.current.position.x = THREE.MathUtils.damp(
      ref.current.position.x,
      Math.sin(t * 0.1) * 0.04 + mx * 0.08,
      2,
      delta
    );
  });

  return (
    <group ref={ref}>
      {books.map((book, index) => (
        <Book key={index} book={book} />
      ))}

      <FloatingDust
        position={[-4.35, 2.2, -1]}
        size={0.05}
        speed={0.6}
      />
      <FloatingDust
        position={[4.2, 2, -1]}
        size={0.045}
        speed={0.75}
        phase={1}
      />
      <FloatingDust
        position={[2.6, -1.4, -1.8]}
        size={0.035}
        speed={0.58}
        phase={2}
      />
      <FloatingDust
        position={[-3, -1.45, -1.8]}
        size={0.04}
        speed={0.7}
        phase={3}
      />
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.9} />

      <hemisphereLight
        intensity={1.15}
        color="#ffe8c7"
        groundColor="#08090d"
      />

      <directionalLight
        position={[-3, 5, 4]}
        intensity={3.2}
        color="#fff0d0"
        castShadow
      />

      <pointLight
        position={[4, 2.5, 5]}
        intensity={16}
        distance={18}
        color="#ffc978"
      />

      <pointLight
        position={[-4.5, 1, 4]}
        intensity={9}
        distance={15}
        color="#a9b4ff"
      />

      <pointLight
        position={[1, -2, 3]}
        intensity={6}
        distance={12}
        color="#c68cff"
      />

      <Stars
        radius={32}
        depth={25}
        count={600}
        factor={0.9}
        saturation={0}
        fade
        speed={0.18}
      />

      <SceneRig />
    </>
  );
}

function AnimatedBackground() {
  const ref = useRef();

  useEffect(() => {
    let frame;

    const animate = () => {
      if (ref.current) {
        const t = performance.now() * 0.000025;
        const x = Math.sin(t) * 0.8;
        const y = Math.cos(t * 0.7) * 0.5;
        ref.current.style.transform =
          `scale(1.05) translate3d(${x}%, ${y}%, 0)`;
      }

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <img
      ref={ref}
      src={libraryBackground}
      alt=""
      className="library-main-background"
      style={{
        filter: "none",
        objectFit: "cover",
        objectPosition: "center",
      }}
    />
  );
}

export default function LibraryScene() {
  return (
    <div className="library-main-scene">
      <AnimatedBackground />

      <div className="library-main-dark-layer" />

      <div className="library-main-glow" />

      <div className="library-main-canvas">
        <Canvas
          shadows
          camera={{
            position: [0, 0, 8],
            fov: 50,
          }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <Scene />
        </Canvas>
      </div>

      <div className="library-main-vignette" />
    </div>
  );
}

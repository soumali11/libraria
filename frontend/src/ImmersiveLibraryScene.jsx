import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, Sparkles, RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import alchemistCover from "./assets/alchemist.jpg";
import atomicHabitsCover from "./assets/atomic-habits.jpg";
import silentPatientCover from "./assets/silent-patient.jpg";
import psychologyMoneyCover from "./assets/psychology-of-money.jpg";

const coverImages = {
  B001: alchemistCover,
  B002: atomicHabitsCover,
  B003: silentPatientCover,
  B004: psychologyMoneyCover,
};

const bookColors = {
  B001: "#7b2d2d",
  B002: "#1e4f78",
  B003: "#314b42",
  B004: "#7a5427",
};

const dimensions = [
  [0.58, 1.5, 0.2],
  [0.56, 1.42, 0.2],
  [0.62, 1.54, 0.22],
  [0.55, 1.36, 0.19],
  [0.6, 1.47, 0.21],
  [0.53, 1.3, 0.18],
];

function RealisticBook({ book, index, selected, onSelect }) {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(coverImages[book.bookId] || alchemistCover);
  const [width, height, depth] = dimensions[index % dimensions.length];

  const baseX = -1.48 + index * 0.62;
  const baseY = 0.94;
  const baseZ = 0.05;
  const baseRotation = [-0.035, 0.02, -0.018, 0.03, -0.025, 0.015][index % 6];
  const color = bookColors[book.bookId] || "#563b2b";

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  }, [texture]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const time = state.clock.getElapsedTime();
    const px = state.pointer.x;
    const py = state.pointer.y;

    const targetX = selected ? px * 0.2 : 0;
    const targetY = selected ? 0.38 + Math.sin(time * 1.7) * 0.025 : hovered ? 0.08 : 0;
    const targetZ = selected ? 1.2 : hovered ? 0.25 : baseZ;
    const targetRY = selected ? px * 0.22 : baseRotation + px * 0.025;
    const targetRX = selected ? -py * 0.08 : -py * 0.018;
    const targetRZ = selected ? Math.sin(time * 1.2) * 0.018 : baseRotation * 0.4;
    const targetScale = selected ? 1.08 : hovered ? 1.025 : 1;

    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, baseX + targetX, 5, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, baseY + targetY, 5, delta);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, targetZ, 5, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRX, 5, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRY, 5, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetRZ, 5, delta);
    group.current.scale.x = THREE.MathUtils.damp(group.current.scale.x, targetScale, 5, delta);
    group.current.scale.y = THREE.MathUtils.damp(group.current.scale.y, targetScale, 5, delta);
    group.current.scale.z = THREE.MathUtils.damp(group.current.scale.z, targetScale, 5, delta);
  });

  return (
    <group
      ref={group}
      position={[baseX, baseY, baseZ]}
      rotation={[0, baseRotation, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(book.bookId);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      <RoundedBox
        args={[width, height, depth]}
        radius={0.035}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.42} />
      </RoundedBox>

      <mesh position={[0, 0, depth / 2 + 0.018]} castShadow>
        <planeGeometry args={[width - 0.045, height - 0.045]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.62}
          metalness={0}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0, -depth / 2 - 0.014]}>
        <planeGeometry args={[width - 0.055, height - 0.055]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>

      <mesh position={[-width / 2 - 0.008, 0, 0]} castShadow>
        <boxGeometry args={[0.035, height - 0.025, depth + 0.035]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>

      <mesh position={[width / 2 - 0.012, 0, 0]}>
        <boxGeometry args={[0.028, height - 0.09, depth - 0.025]} />
        <meshStandardMaterial color="#eee2c9" roughness={0.88} />
      </mesh>

      <mesh position={[width / 2 - 0.022, 0, depth / 2 + 0.032]}>
        <boxGeometry args={[0.012, height - 0.16, 0.01]} />
        <meshStandardMaterial color="#b8a98e" roughness={0.9} />
      </mesh>

      <mesh position={[0, height / 2 - 0.07, depth / 2 + 0.028]}>
        <boxGeometry args={[width - 0.13, 0.012, 0.014]} />
        <meshStandardMaterial color="#dbc9a8" roughness={0.82} />
      </mesh>

      <mesh position={[0, -height / 2 + 0.07, depth / 2 + 0.028]}>
        <boxGeometry args={[width - 0.13, 0.012, 0.014]} />
        <meshStandardMaterial color="#dbc9a8" roughness={0.82} />
      </mesh>

      <mesh position={[0, 0, depth / 2 + 0.038]}>
        <boxGeometry args={[width * 0.88, height * 0.025, 0.01]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>

      {selected && (
        <>
          <pointLight position={[0, 0, 1.1]} intensity={3.2} distance={3.2} color="#fff0c9" />
          <Html position={[0.8, 0.48, 0.15]} center distanceFactor={7}>
            <div className="immersive-book-popover">
              <span>NOW BORROWED</span>
              <strong>{book.title}</strong>
              <small>{book.author}</small>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(null);
                }}
              >
                Close
              </button>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

function EmptyBook({ index }) {
  const colors = ["#5b2430", "#214f66", "#4e3923", "#334a38", "#442d50"];
  const width = 0.48 + (index % 3) * 0.06;
  const height = 1.25 + (index % 4) * 0.08;

  return (
    <group position={[-1.55 + index * 0.48, 0.87, 0.04]} rotation={[0, [0.02, -0.035, 0.025, -0.02][index % 4], 0]}>
      <RoundedBox args={[width, height, 0.17]} radius={0.03} smoothness={3} castShadow>
        <meshStandardMaterial color={colors[index % colors.length]} roughness={0.42} />
      </RoundedBox>
      <mesh position={[width / 2 + 0.01, 0, 0]}>
        <boxGeometry args={[0.025, height - 0.1, 0.15]} />
        <meshStandardMaterial color="#e7dcc5" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Shelf({ books, onSelect, selectedBook }) {
  return (
    <group position={[0, 0, -3.25]}>
      <mesh position={[0, 1.85, 0]} castShadow receiveShadow>
        <RoundedBox args={[4.8, 0.2, 0.72]} radius={0.04} smoothness={4}>
          <meshStandardMaterial color="#5b3320" roughness={0.68} />
        </RoundedBox>
      </mesh>

      <mesh position={[-2.2, 0.95, 0]} castShadow receiveShadow>
        <RoundedBox args={[0.2, 2.5, 0.72]} radius={0.035} smoothness={4}>
          <meshStandardMaterial color="#452719" roughness={0.72} />
        </RoundedBox>
      </mesh>

      <mesh position={[2.2, 0.95, 0]} castShadow receiveShadow>
        <RoundedBox args={[0.2, 2.5, 0.72]} radius={0.035} smoothness={4}>
          <meshStandardMaterial color="#452719" roughness={0.72} />
        </RoundedBox>
      </mesh>

      <mesh position={[0, 0.27, 0]} castShadow receiveShadow>
        <RoundedBox args={[4.35, 0.16, 0.62]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#714329" roughness={0.68} />
        </RoundedBox>
      </mesh>

      <mesh position={[0, 1.27, 0]} castShadow receiveShadow>
        <RoundedBox args={[4.35, 0.15, 0.62]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#714329" roughness={0.68} />
        </RoundedBox>
      </mesh>

      <mesh position={[0, 0.7, -0.27]}>
        <boxGeometry args={[4.25, 0.02, 0.02]} />
        <meshStandardMaterial color="#24150f" roughness={0.9} />
      </mesh>

      {books.length > 0
        ? books.map((book, index) => (
            <RealisticBook
              key={book.bookId}
              book={book}
              index={index}
              selected={selectedBook === book.bookId}
              onSelect={onSelect}
            />
          ))
        : [0, 1, 2, 3, 4, 5].map((index) => <EmptyBook key={index} index={index} />)}
    </group>
  );
}

function SideShelf({ side }) {
  const x = side === "left" ? -5.35 : 5.35;
  const rotation = side === "left" ? Math.PI / 2 : -Math.PI / 2;

  return (
    <group position={[x, 0, -1.25]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.85, 0]} castShadow>
        <RoundedBox args={[4.7, 0.2, 0.68]} radius={0.035} smoothness={4}>
          <meshStandardMaterial color="#432619" roughness={0.72} />
        </RoundedBox>
      </mesh>
      <mesh position={[-2.2, 0.9, 0]} castShadow>
        <RoundedBox args={[0.18, 2.45, 0.68]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#351e15" roughness={0.76} />
        </RoundedBox>
      </mesh>
      <mesh position={[2.2, 0.9, 0]} castShadow>
        <RoundedBox args={[0.18, 2.45, 0.68]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#351e15" roughness={0.76} />
        </RoundedBox>
      </mesh>
      <mesh position={[0, 0.32, 0]} castShadow>
        <RoundedBox args={[4.35, 0.14, 0.6]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#633a25" roughness={0.72} />
        </RoundedBox>
      </mesh>
      <mesh position={[0, 1.27, 0]} castShadow>
        <RoundedBox args={[4.35, 0.14, 0.6]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#633a25" roughness={0.72} />
        </RoundedBox>
      </mesh>
    </group>
  );
}

function FloatingBook({ position, rotation, color, speed }) {
  const ref = useRef();

  useFrame((state, delta) => {
    if (!ref.current) return;

    const time = state.clock.getElapsedTime();

    ref.current.rotation.y = THREE.MathUtils.damp(
      ref.current.rotation.y,
      rotation[1] + Math.sin(time * speed * 0.75) * 0.14,
      2.2,
      delta
    );

    ref.current.rotation.x = THREE.MathUtils.damp(
      ref.current.rotation.x,
      rotation[0] + Math.sin(time * speed * 0.55) * 0.06,
      2.2,
      delta
    );
  });

  return (
    <Float speed={speed} rotationIntensity={0.1} floatIntensity={0.38}>
      <group ref={ref} position={position} rotation={rotation}>
        <RoundedBox args={[0.62, 1.52, 0.2]} radius={0.035} smoothness={4} castShadow>
          <meshStandardMaterial color={color} roughness={0.38} />
        </RoundedBox>
        <mesh position={[0, 0, 0.112]}>
          <boxGeometry args={[0.54, 1.43, 0.025]} />
          <meshStandardMaterial color="#e9dfcc" roughness={0.82} />
        </mesh>
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.035, 1.44, 0.22]} />
          <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(0.62)} roughness={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

function SceneContent({ books, onSelect, selectedBook }) {
  const group = useRef();
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    pointer.current.x = THREE.MathUtils.lerp(pointer.current.x, state.pointer.x, 0.035);
    pointer.current.y = THREE.MathUtils.lerp(pointer.current.y, state.pointer.y, 0.035);

    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        pointer.current.x * 0.045,
        2.4,
        delta
      );
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        pointer.current.y * -0.022,
        2.4,
        delta
      );
    }
  });

  const shelfBooks = useMemo(() => books.slice(0, 6), [books]);

  return (
    <group ref={group}>
      <color attach="background" args={["#07080d"]} />
      <fog attach="fog" args={["#07080d", 12, 30]} />

      <ambientLight intensity={1.05} />
      <hemisphereLight intensity={0.65} color="#dbeafe" groundColor="#24130c" />

      <spotLight
        position={[0, 6.5, 3.5]}
        angle={0.62}
        penumbra={0.72}
        intensity={190}
        distance={20}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#ffe2b8"
      />

      <pointLight position={[0, 2.8, 1.5]} intensity={18} distance={9} color="#fff3d6" />
      <pointLight position={[-4.5, 2.6, 0.8]} intensity={22} distance={10} color="#9f7aea" />
      <pointLight position={[4.8, 2.5, 0.3]} intensity={18} distance={10} color="#67d5ff" />

      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[22, 0.18, 22]} />
        <meshStandardMaterial color="#1a1518" roughness={0.82} metalness={0.05} />
      </mesh>

      <mesh position={[0, 4.25, -4]} receiveShadow>
        <boxGeometry args={[22, 8.5, 0.2]} />
        <meshStandardMaterial color="#121117" roughness={0.92} />
      </mesh>

      <mesh position={[0, 2.8, -3.82]}>
        <boxGeometry args={[11.5, 5.7, 0.035]} />
        <meshStandardMaterial color="#0d0c11" roughness={1} />
      </mesh>

      <Shelf
        books={shelfBooks}
        onSelect={onSelect}
        selectedBook={selectedBook}
      />

      <SideShelf side="left" />
      <SideShelf side="right" />

      <FloatingBook
        position={[-4.6, 2.55, 0.5]}
        rotation={[0.05, -0.55, 0.18]}
        color="#7c3aed"
        speed={1.15}
      />

      <FloatingBook
        position={[4.35, 2.15, 1.1]}
        rotation={[-0.12, 0.48, -0.1]}
        color="#0891b2"
        speed={1.35}
      />

      <FloatingBook
        position={[3.45, 4.15, -1.8]}
        rotation={[0.15, -0.2, 0.18]}
        color="#b45309"
        speed={0.9}
      />

      <Sparkles
        count={120}
        scale={[15, 7, 11]}
        size={1.35}
        speed={0.16}
        opacity={0.58}
        color="#ffe7ad"
      />
    </group>
  );
}

export default function ImmersiveLibraryScene({ books = [], onSelect, selectedBook }) {
  return (
    <div className="immersive-library-scene">
      <Canvas
        shadows
        dpr={[1, 1.7]}
        camera={{ position: [0, 2.45, 8.2], fov: 44 }}
        gl={{ antialias: true }}
      >
        <SceneContent
          books={books}
          onSelect={onSelect}
          selectedBook={selectedBook}
        />
      </Canvas>

      <div className="immersive-scene-vignette" />

      <div className="immersive-scene-label">
        <span>LIBRARIA / PERSONAL ARCHIVE</span>
        <strong>Walk through your books.</strong>
        <small>Move your cursor and select a book.</small>
      </div>
    </div>
  );
}

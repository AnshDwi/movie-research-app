import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, Sparkles } from "@react-three/drei";
import { Suspense } from "react";

function Node({ movie, index, onSelectMovie }) {
  const x = ((index % 4) - 1.5) * 2.2;
  const y = (Math.floor(index / 4) - 1) * 1.8;
  const z = (index % 3) * -1.2;

  return (
    <group position={[x, y, z]}>
      <mesh onClick={() => onSelectMovie(movie.id)}>
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial color={movie.vote_average > 7 ? "#38bdf8" : "#f97316"} emissive={movie.vote_average > 7 ? "#1d4ed8" : "#7c2d12"} emissiveIntensity={0.8} />
      </mesh>
      <Html center position={[0, -0.42, 0]} distanceFactor={10}>
        <button
          type="button"
          onClick={() => onSelectMovie(movie.id)}
          className="rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur"
        >
          {movie.title}
        </button>
      </Html>
    </group>
  );
}

export function MovieGalaxy({ movies, onSelectMovie }) {
  const displayMovies = movies.slice(0, 12);

  return (
    <div className="h-[420px] w-full rounded-[1.6rem] bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.18),transparent_25%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,1))]">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[4, 4, 3]} intensity={14} color="#38bdf8" />
        <pointLight position={[-4, -2, 2]} intensity={10} color="#fb923c" />
        <Suspense fallback={null}>
          <Sparkles count={180} scale={8} size={2.2} speed={0.25} />
          {displayMovies.map((movie, index) => (
            <Node key={movie.id} movie={movie} index={index} onSelectMovie={onSelectMovie} />
          ))}
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.55} />
      </Canvas>
    </div>
  );
}

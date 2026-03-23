import { Canvas } from "@react-three/fiber";
import { Float, Html, Image, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { getPosterUrl } from "../../utils/movie";

function Poster({ movie, index, onSelectMovie }) {
  const angle = (index / 8) * Math.PI * 2;
  const radius = 3.2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.8}>
      <group position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
        <Image
          url={getPosterUrl(movie.poster_path)}
          scale={[1.25, 1.85, 1]}
          radius={0.12}
          transparent
          onClick={() => onSelectMovie(movie.id)}
        />
        <Html position={[0, -1.25, 0.05]} center distanceFactor={8}>
          <button
            type="button"
            onClick={() => onSelectMovie(movie.id)}
            className="rounded-full bg-slate-950/85 px-3 py-2 text-xs font-semibold text-white backdrop-blur"
          >
            {movie.title}
          </button>
        </Html>
      </group>
    </Float>
  );
}

export function ThreeCarousel({ movies, onSelectMovie }) {
  const displayMovies = movies.slice(0, 8);

  return (
    <div className="h-[420px] w-full rounded-[1.6rem] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))]">
      <Canvas camera={{ position: [0, 0.7, 7], fov: 42 }}>
        <ambientLight intensity={1.1} />
        <pointLight position={[3, 4, 4]} intensity={18} color="#7dd3fc" />
        <pointLight position={[-4, 1, -4]} intensity={8} color="#fb923c" />
        <Suspense fallback={null}>
          {displayMovies.map((movie, index) => (
            <Poster key={movie.id} movie={movie} index={index} onSelectMovie={onSelectMovie} />
          ))}
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}

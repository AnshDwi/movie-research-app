import { Helmet } from "react-helmet-async";
import { HeroHeader } from "../components/home/HeroHeader";
import { DiscoveryWorkspace } from "../components/home/DiscoveryWorkspace";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Afterglow | 3D Movie Research Platform</title>
        <meta
          name="description"
          content="Explore trending, upcoming, and now-playing movies in an immersive 3D research platform with analytics, AI recommendations, and cinematic UX."
        />
      </Helmet>
      <div className="space-y-6">
        <HeroHeader />
        <DiscoveryWorkspace />
      </div>
    </>
  );
}

import Hero from "../components/Hero";
import AboutPurpose from "../components/AboutPurpose";
import ImpactCards from "../components/ImpactCards";
import Heritage from "../components/Heritage";
import Shows from "../components/Shows";
import Team from "../components/Team";

export default function HomePage() {
  return (
    <main className="w-full">
      <Hero />
      <AboutPurpose />
      <ImpactCards />
      <Heritage />
      <Shows />
      <Team />
    </main>
  );
}

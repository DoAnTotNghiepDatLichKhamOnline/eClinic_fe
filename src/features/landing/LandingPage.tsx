import { Header } from "./components/header/Header";
import { Hero } from "./components/hero/Hero";
import { TrustBar } from "./components/trust-bar/TrustBar";
import { SpecialtiesSection } from "./components/specialties/SpecialtiesSection";
import { DoctorsSection } from "./components/doctors/DoctorsSection";
import { CtaSection } from "./components/cta/CtaSection";
import { Footer } from "./components/footer/Footer";
import { EmergencyFab } from "./components/emergency-fab/EmergencyFab";
import { SymptomChatWidget } from "./components/chat/SymptomChatWidget";

/** Landing page composition. Page-specific UI stays inside the landing feature. */
export function LandingPage() {
  return (
    <>
      <Header />

      <main>
        <span id="top" />
        <Hero />
        <TrustBar />
        <SpecialtiesSection featured />
        <DoctorsSection featured />
        <CtaSection />
      </main>

      <Footer />
      <EmergencyFab />
      <SymptomChatWidget />
    </>
  );
}

import {
  FinalCtaSection,
  HeroSection,
  InteractiveDemoSection,
  Navbar,
  ProblemSolutionSection,
  ValuePropositionSection
} from "@/components/landing"

export default function HomePage() {
  return (
    <div className="bg-background relative min-h-screen">
      <Navbar />
      <main id="home">
        <HeroSection />
        <ProblemSolutionSection />
        <ValuePropositionSection />
        <InteractiveDemoSection />
        <FinalCtaSection />
      </main>
    </div>
  )
}

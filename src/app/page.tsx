import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experiences from "@/components/sections/Experiences";
import Morocco from "@/components/sections/Morocco";
import Gallery from "@/components/sections/Gallery";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experiences />
        <Morocco />
        <Gallery />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experiences from "@/components/sections/Experiences";
import TheWeek from "@/components/sections/TheWeek";
import Stay from "@/components/sections/Stay";
import Package from "@/components/sections/Package";
import ParadiseValley from "@/components/sections/ParadiseValley";
import Morocco from "@/components/sections/Morocco";
import Gallery from "@/components/sections/Gallery";
import Booking from "@/components/sections/Booking";
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
        <TheWeek />
        <Stay />
        <Package />
        <ParadiseValley />
        <Morocco />
        <Gallery />
        <Booking />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

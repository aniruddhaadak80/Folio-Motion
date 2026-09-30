import { Hero } from "@/components/sections/hero";
import { About, Services, Skills } from "@/components/sections/about";
import { FeaturedWork } from "@/components/sections/projects";
import { Experience } from "@/components/sections/experience";
import { Contact } from "@/components/sections/contact";
import { LabTeaser } from "@/components/sections/lab-teaser";

/**
 * The one-page home. Every band is a component reading from
 * src/config/portfolio.ts, so this file is just an ordered list.
 *
 * To change the order, move a line. To remove a band, delete its line.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Skills />
      <FeaturedWork />
      <Experience />
      <LabTeaser />
      <Contact />
    </>
  );
}

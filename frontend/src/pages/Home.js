import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { HeroTitle, HeroDetails } from "../Sections/Hero/index";
import About from "../Sections/About/index";
import Services from "../Sections/Services/index";
import Universities from "../Sections/Universities/index";
import PartnersLogos from "../Sections/PartnersLogos/index";
import HowItWorks from "../Sections/HowItWorks/index";
import Testimonials from "../Sections/Testimonials/index";
import FAQ from "../Sections/FAQ/index";
import Contact from "../Sections/Contact/index";
import FullPageScrollVideo from "../components/FullPageScrollVideo";

const NormalPageContent = styled.main`
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: var(--background);
  color: var(--text);

  & > section,
  & > div {
    position: relative;
    z-index: 1;
    background-color: var(--background);
  }
`;

const RevealBlock = styled.div`
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? "translateY(0)" : "translateY(48px)")};
  transition:
    opacity 0.85s ease,
    transform 0.85s cubic-bezier(0.2, 0.75, 0.25, 1);
  transition-delay: ${({ $delay }) => `${$delay}ms`};
  will-change: opacity, transform;

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: none;
    transition: none;
  }
`;

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <RevealBlock ref={ref} $visible={visible} $delay={delay}>
      {children}
    </RevealBlock>
  );
}

export default function Home() {
  return (
    <>
      <FullPageScrollVideo
        frameCount={60}
        framePath="/media/frames/frame-"
        extension="jpg"
      >
        <HeroTitle />
      </FullPageScrollVideo>

      <NormalPageContent>
        <HeroDetails />

        <Reveal>
          <PartnersLogos />
        </Reveal>

        <Reveal delay={60}>
          <About />
        </Reveal>

        <Reveal delay={100}>
          <HowItWorks />
        </Reveal>

        <Reveal delay={80}>
          <Universities />
        </Reveal>

        <Reveal delay={120}>
          <Services />
        </Reveal>

        <Reveal delay={160}>
          <Testimonials />
        </Reveal>

        <Reveal delay={200}>
          <FAQ />
        </Reveal>

        <Reveal delay={240}>
          <Contact />
        </Reveal>
      </NormalPageContent>
    </>
  );
}

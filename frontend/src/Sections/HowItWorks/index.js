import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

const TimelineWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  min-height: 1000px;

  .timeline-svg {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 100%;
  }

  .step-number {
    color: #57D53B;
    font-weight: 600;
    font-size: 14px;
  }

  .step h3 {
    color: var(--text-primary);
    font-size: 22px;
    font-weight: 700;
    margin: 4px 0;
  }

  .step p {
    color: var(--text-secondary);
    font-size: 15px;
    max-width: 320px;
  }
`;

const Section = styled.section`
  position: relative;
  color: var(--text-primary);
  background: var(--background);
  padding: 5rem 5%;
  transition: background 220ms ease, color 220ms ease;
`;

const Inner = styled.div`
  position: relative;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
`;

const Header = styled.header`
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 3.5rem;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0.4rem 1.2rem;
  color: #57D53B;
  background: rgba(87, 213, 59, 0.12);
  border: 1px solid rgba(87, 213, 59, 0.28);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 1.2rem;
`;

const Title = styled.h1`
  margin: 0;
  font-family: "Poppins", "Inter", sans-serif;
  font-weight: 900;
  line-height: 1.04;
  color: var(--text-primary);
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: -0.055em;
  span { color: #57D53B; }
`;

const Subtitle = styled.p`
  max-width: 620px;
  margin: 1.2rem auto 0;
  color: var(--text-secondary);
  font-size: clamp(0.95rem, 1.8vw, 1.1rem);
  line-height: 1.7;
`;

export default function HowItWorks() {
  const { language } = useLanguage();
  const t = translations[language].howItWorks;
  const sectionRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    if (!pathRef.current || !sectionRef.current) return;
    const path = pathRef.current;

    const len = path.getTotalLength ? path.getTotalLength() : 1000;
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;

    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "bottom 15%",
          scrub: 1.2,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [language]);

  return (
    <Section id="how-it-works" ref={sectionRef}>
      <Inner>
        <Header>
          <Badge>{t.eyebrow}</Badge>
          <Title>
            {t.titleStart} <span>{t.titleHighlight}</span>
          </Title>
          <Subtitle>{t.subtitle}</Subtitle>
        </Header>

        <TimelineWrapper>
          <svg
            viewBox="0 0 400 1000"
            preserveAspectRatio="none"
            className="timeline-svg"
          >
            <defs>
              <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M1 1L9 5L1 9" fill="none" stroke="#57D53B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>
            <path
              ref={pathRef}
              d="M 350,50 C 350,150 50,150 50,280 C 50,410 350,410 350,540 C 350,670 50,670 50,800 C 50,930 350,930 350,950"
              fill="none"
              stroke="#57D53B"
              strokeWidth="2"
              strokeDasharray="4 4"
              marker-end="url(#arrowhead)"
            />
          </svg>

        {t.steps.map((step, i) => {
          const positions = [
            { top: "5%", right: "55%", textAlign: "right" },
            { top: "28%", left: "55%", textAlign: "left" },
            { top: "54%", right: "55%", textAlign: "right" },
            { top: "80%", left: "55%", textAlign: "left" },
          ];
          const pos = positions[i];
          return (
            <div key={step.number} className="step" style={{ position: "absolute", ...pos }}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          );
        })}
        </TimelineWrapper>
      </Inner>
    </Section>
  );
}

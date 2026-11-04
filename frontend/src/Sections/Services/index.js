import gsap from "gsap";
import { useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

// Compact, consistent line icons for a more professional visual system
import {
  FiFileText,
  FiBookOpen,
  FiDollarSign,
  FiMonitor,
  FiFolder,
  FiCreditCard,
} from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

// Index-based icon & accent arrays — order must match translation items
const SERVICE_ICONS = [FiFileText, FiBookOpen, FiDollarSign, FiMonitor, FiFolder, FiCreditCard];
const SERVICE_ACCENTS = ["#138A5B", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899", "#C9343E"];

/* ── Styled Components ── */

const ServiceSection = styled.section`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 5%;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  background: var(--background);
  background-image: radial-gradient(circle at 10% 24%, rgba(87,213,59,0.05), transparent 28%);
  color: var(--text-primary);
  transition: background 220ms ease, color 220ms ease;

  body.theme-dark & {
    background: var(--background);
    background-image: radial-gradient(circle at 10% 24%, rgba(87,213,59,0.06), transparent 28%);
    color: var(--text-primary);
  }
`;

const Header = styled.div`
  text-align: left;
  margin-bottom: 4rem;
  opacity: 0;
`;

const Eyebrow = styled.span`
  display: inline-block;
  font-size: var(--font-size-badge);
  letter-spacing: var(--letter-spacing-badge);
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: var(--font-size-h2);
  font-weight: 800;
  color: var(--text);
  margin: 0 0 1rem;
  letter-spacing: -0.03em;
  line-height: 1.1;

  span {
    color: var(--accent);
    background: none;
    -webkit-background-clip: initial;
    -webkit-text-fill-color: initial;
    background-clip: initial;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--text-muted);
  max-width: 500px;
  margin: 0;
  line-height: 1.7;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px)  { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  position: relative;
  background: var(--surface);
  border: 2px solid var(--border-visible);
  border-radius: 10px;
  padding: 1rem 1.1rem;
  box-shadow: 5px 5px 0 rgba(32,33,36,0.14);
  cursor: pointer;
  opacity: 0;
  overflow: hidden;
  transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: var(--text);
    background: var(--surface);
    transform: translate(-2px, -2px);
    box-shadow: 9px 9px 0 rgba(23,23,23,0.18);
  }
`;

const IconBox = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(87,213,59,0.12);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  transition: transform 0.3s ease;

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2.1;
    color: #57D53B;
    transition: transform 0.3s ease;
  }

  ${Card}:hover & {
    transform: scale(1.04);
    svg { transform: scale(1.06); }
  }
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.4rem;
  letter-spacing: -0.01em;
`;

const CardDesc = styled.p`
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0 0 0.85rem;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Feature = styled.li`
  font-size: 0.82rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${p => p.$accent || '#138A5B'};
    flex-shrink: 0;
  }
`;


const Frame = styled.div`
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 28px;
  padding: clamp(3rem, 6vw, 4rem) clamp(2rem, 5vw, 3.5rem);
  background: var(--background-secondary);
  margin: 3rem auto;
  max-width: 1280px;
  position: relative;
`;

/* ── Component ── */
const Services = () => {
  const { language } = useLanguage();
  const t = translations[language].services;

  const sectionRef = useRef(null);
  const headerRef  = useRef(null);
  const cardRefs   = useRef([]);
  cardRefs.current = [];

  const addCard = (el) => el && cardRefs.current.push(el);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trig = {
        trigger: sectionRef.current,
        start: "top 65%",
        toggleActions: "play none none reverse",
      };

      gsap.to(headerRef.current, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: trig,
      });

      gsap.to(cardRefs.current, {
        opacity: 1, y: 0, duration: 0.8,
        stagger: 0.1, ease: "power3.out", delay: 0.2,
        scrollTrigger: trig,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [language]); // ✅ re-run when language changes

  return (
    <ServiceSection id="services" ref={sectionRef}>
      <Frame>
        <Header ref={headerRef}>
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <Title>{t.titleStart} <span>{t.titleHighlight}</span></Title>
        <Subtitle>{t.subtitle}</Subtitle>
      </Header>

      <Grid>
        {t.items.map((s, i) => (
          <Card key={i} ref={addCard} $accent={SERVICE_ACCENTS[i]}>
            <IconBox $accent={SERVICE_ACCENTS[i]} aria-label={s.title}>
              {(() => {
                const ServiceIcon = SERVICE_ICONS[i];
                return <ServiceIcon aria-hidden="true" focusable="false" />;
              })()}
            </IconBox>
            <CardTitle>{s.title}</CardTitle>
            <CardDesc>{s.desc}</CardDesc>
            <FeatureList>
              {s.features.map((f, j) => (
                <Feature key={j} $accent={SERVICE_ACCENTS[i]}>{f}</Feature>
              ))}
            </FeatureList>
          </Card>
        ))}
      </Grid>
      </Frame>
    </ServiceSection>
  );
};

export default Services;
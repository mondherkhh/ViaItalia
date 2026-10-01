import React, { useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../../contexts/LanguageContext";
import { translations } from "../../translations";
import guidanceImg from "../../assets/images/about/guidance-illustration.png";
import expertiseImg from "../../assets/images/about/expertise-illustration.png";
import supportImg from "../../assets/images/about/support-illustration.png";
import resultsImg from "../../assets/images/about/results-illustration.png";

gsap.registerPlugin(ScrollTrigger);

/* ── Animations ── */
const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

/* ── Section ── */
const Section = styled.section`
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  padding: 4rem 5%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--background);
  color: var(--text);
  transition: background 220ms ease, color 220ms ease;

  &::before {
    position: absolute;
    z-index: -1;
    inset: 0;
    content: "";
    pointer-events: none;
    opacity: 0;
  }

  body.theme-dark &::before {
    opacity: 0.2;
    filter: grayscale(1) brightness(1.7) contrast(0.9);
    mix-blend-mode: screen;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    padding: 5rem 1.25rem;
  }
`;

/* ── Header ── */
const Header = styled.div`
  text-align: left;
  margin-bottom: 4rem;
  opacity: 0;
  max-width: 1100px;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
`;

const Eyebrow = styled.span`
  font-size: var(--font-size-badge);
  letter-spacing: var(--letter-spacing-badge);
  text-transform: uppercase;
  color: var(--accent);
`;

const Title = styled.h2`
  font-size: var(--font-size-h2);
  font-weight: 800;
  color: var(--text-primary);
  margin: 1rem 0;

  span {
    background: linear-gradient(90deg, #57D53B, #57D53B);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmer} 4s linear infinite;
  }

  body.theme-dark & span {
    background: linear-gradient(90deg, #57D53B, #57D53B);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  max-width: 500px;
  margin: 0;
  line-height: 1.6;
`;

/* ── Grid ── */
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  max-width: 1100px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

/* ── Left Text ── */
const TextBlock = styled.div`
  opacity: 0;
`;

const MainText = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.8;
`;

/* ── Feature Grid (2x2) ── */
const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MiniCard = styled.article`
  background: var(--background-secondary);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.4rem 1.2rem;
  opacity: 0;
  transition: transform 150ms ease, border-color 150ms ease;
  &:hover {
    transform: translateY(-3px);
    border-color: rgba(87,213,59,0.4);
  }
`;

const MiniTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0.75rem 0 0.35rem;
`;

const MiniDesc = styled.p`
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
`;

/* ── Visual Frame (right column) ── */
const VisualFrame = styled.div`
  background: var(--background-secondary);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 28px;
  padding: 2.5rem;
  min-height: 100%;
`;

const FrameTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.6rem;
`;

const FrameDesc = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0 0 1.5rem;
`;

const CampusGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const CampusItem = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  min-height: 105px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 25%;
    display: block;
    filter: brightness(0.82) contrast(1.05);
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(15,20,30,0.75) 0%, rgba(15,20,30,0.15) 60%, transparent 100%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    aspect-ratio: 16 / 10;
    min-height: 120px;
  }

  @media (max-width: 480px) {
    aspect-ratio: 16 / 9;
    min-height: 100px;
  }
`;

const Features = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Card = styled.div`
  background: var(--background-secondary);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 1.5rem;
  border-radius: 18px;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: all 0.3s ease;
  opacity: 0;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(19,138,91,0.45);
    background: rgba(19,138,91,0.06);
  }
`;

const Icon = styled.img`
  width: 32px;
`;

const CardText = styled.div``;

const CardTitle = styled.h4`
  color: var(--accent);
  margin-bottom: 0.3rem;
`;

const CardDesc = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

/* ── Component ── */
const About = () => {
  const { language } = useLanguage();
  const t = translations[language].about;

  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const textRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trig = {
        trigger: sectionRef.current,
        start: "top 70%",
      };

      gsap.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: trig,
      });

      gsap.to(textRef.current, {
        opacity: 1,
        x: 0,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: trig,
      });

      gsap.to(cardsRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: trig,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  return (
    <Section id="about" ref={sectionRef}>

      <Header ref={headerRef}>
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <Title>{t.title} <span>{t.brand}</span></Title>
        <Subtitle>
          {t.subtitle}
        </Subtitle>
      </Header>

      <Grid>
        <TextBlock ref={textRef}>
          <MainText>
            {t.mainText}
          </MainText>
          <FeatureGrid>
            {t.features.map((f, i) => (
              <MiniCard key={i} ref={addToRefs}>
                <MiniTitle>{f.title}</MiniTitle>
                <MiniDesc>{f.desc}</MiniDesc>
              </MiniCard>
            ))}
          </FeatureGrid>
        </TextBlock>

        <VisualFrame>
          <FrameTitle>Notre plateforme</FrameTitle>
          <FrameDesc>Un accompagnement complet et personnalisé pour chaque étudiant, du choix de l'université jusqu'à l'arrivée en Italie.</FrameDesc>
          <CampusGrid>
          <CampusItem><img src={guidanceImg} alt="Guidance" /></CampusItem>
          <CampusItem><img src={resultsImg} alt="Results" /></CampusItem>
          <CampusItem><img src={expertiseImg} alt="Expertise" /></CampusItem>
          <CampusItem><img src={supportImg} alt="Support" /></CampusItem>
        </CampusGrid>
        </VisualFrame>
      </Grid>

    </Section>
  );
};

export default About;

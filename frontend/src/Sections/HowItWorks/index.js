import React, { useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const glowPulse = keyframes`
  0% { opacity: 0.4; transform: scale(1); }
  100% { opacity: 0.8; transform: scale(1.2); }
`;

// Composants stylisés
const HowItWorksSection = styled.section`
  min-height: 100vh;
  padding: 6rem 5%;
  position: relative;
  overflow-x: hidden;
  background: #f1f3f2;
  color: var(--text);
  transition: background 220ms ease, color 220ms ease;

  body.theme-dark & {
    background:
      radial-gradient(circle at 10% 24%, rgba(19, 138, 91, 0.08), transparent 28%),
      radial-gradient(circle at 90% 72%, rgba(201, 52, 62, 0.07), transparent 30%),
      #3b3f43;
    color: #ffffff;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
`;

const PageContainer = styled.section`
  min-height: 100vh;
  padding: 6rem 5%;
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
`;

const FloatingOrb = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(60px);
  top: 10%;
  right: -100px;
  pointer-events: none;
`;

const FloatingOrbSecondary = styled.div`
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(80px);
  bottom: 0;
  left: -150px;
  pointer-events: none;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
`;

const Badge = styled.div`
  display: inline-block;
  background: rgba(19, 138, 91, 0.10);
  backdrop-filter: blur(8px);
  padding: 0.4rem 1.2rem;
  border-radius: 40px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #138A5B;
  border: 1px solid rgba(19, 138, 91, 0.28);
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  color: #202124;

  body.theme-dark & {
    color: #ffffff;
  }

  line-height: 1.1;
  margin-bottom: 1.5rem;
  opacity: 0;

  span {
    background: linear-gradient(90deg, #C9343E, #138A5B);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmer} 4s linear infinite;
  }
`;

const Subtitle = styled.p`
  color: #6B7280;
  max-width: 600px;

  body.theme-dark & {
    color: #cbd5e1;
  }

  margin: 1rem auto 0;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const Card = styled.div`
  background: #ffffff;
  backdrop-filter: blur(12px);

  body.theme-dark & {
    background: rgba(17, 22, 30, 0.88);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.28);
  }

  border-radius: 20px;
  border: 1px solid rgba(32, 33, 36, 0.12);
  padding: 1.35rem 1.5rem;
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  position: relative;
  overflow: hidden;
  cursor: default;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #C9343E, #138A5B);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.5s ease;
  }

    &:hover {
    transform: translateY(-8px);
    border-color: rgba(19, 138, 91, 0.35);
    background: #ffffff;

    box-shadow: 0 20px 42px -16px rgba(19, 138, 91, 0.25);

    &::before {
      transform: scaleX(1);
    }

    .card-icon {
      transform: scale(1.05);
      filter: drop-shadow(0 0 8px rgba(19,138,91,0.22));
        }
  }

  body.theme-dark &:hover {
    background: rgba(24, 32, 42, 0.96);
    border-color: rgba(61, 220, 151, 0.5);
    box-shadow: 0 22px 44px rgba(0, 0, 0, 0.4);
  }
`;

const IconWrapper = styled.div`

  width: 2.1rem;
  height: 2.1rem;
  margin-bottom: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
    color: #138A5B;
  transition: all 0.3s ease;

  body.theme-dark & {
    color: #3ddc97;
  }

  svg {

    width: 100%;
    height: 100%;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const StepIcon = ({ index }) => {
  const icons = [
    <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
    <><path d="M6 3h9l3 3v15H6z" /><path d="M15 3v4h4M9 12h6M9 16h6" /></>,
    <><path d="M3 9.5 12 4l9 5.5-9 5.5z" /><path d="M6 12.5V17c3 2 9 2 12 0v-4.5M21 10v6" /></>,
    <><path d="M3 12h12" /><path d="m11 7 5 5-5 5" /><path d="M18 5h3v14h-3" /></>,
  ];
  return <svg viewBox="0 0 24 24" aria-hidden="true">{icons[index % icons.length]}</svg>;
};

const StepNumber = styled.div`
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  font-size: 2.5rem;
  font-weight: 800;
  background: none;
  -webkit-background-clip: initial;
  background-clip: initial;
  color: #202124;
  letter-spacing: -0.03em;
  opacity: 0.5;
  font-family: monospace;

  body.theme-dark & {
    background: none;
    -webkit-background-clip: initial;
    background-clip: initial;
    color: #ffffff;
    opacity: 0.72;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #202124;

  body.theme-dark & {
    color: #ffffff;
  }

  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
`;

const CardDesc = styled.p`
  color: #4B5563;
  line-height: 1.6;

  body.theme-dark & {
    color: #cbd5e1;
  }

  font-size: 0.88rem;
  margin-bottom: 1rem;
`;

const Highlight = styled.div`
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #138A5B;
  background: rgba(19, 138, 91, 0.10);
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  margin-top: 0.5rem;
    letter-spacing: 0.02em;

  body.theme-dark & {
    color: #36d892;
    background: rgba(19, 138, 91, 0.18);
  }
`;

const CTASection = styled.div`
  text-align: center;
  margin-top: 5rem;
  position: relative;
  z-index: 2;
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, #138A5B, #0E704A);
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 20px rgba(19, 138, 91, 0.24);
  backdrop-filter: blur(4px);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 30px rgba(19, 138, 91, 0.32);
    background: linear-gradient(135deg, #1AA56E, #138A5B);
  }
`;

const SmallNote = styled.p`
  color: #6B7280;
  font-size: 0.75rem;

  body.theme-dark & {
    color: #94a3b8;
  }

  margin-top: 1rem;
`;

// Composant principal
const ModernJourneyPage = () => {
  const { language } = useLanguage();
  const t = translations[language].howItWorks;
  
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const headerRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Animation d'entrée pour le header
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
        },
      }
    );

    // Animation pour le titre
    const title = headerRef.current.querySelector('h1');
    if (title) {
      gsap.to(title, {
        opacity: 1,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });
    }

    // Animation pour chaque carte avec effet staggered
    cardsRef.current.forEach((el, index) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 60, rotateX: -10 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          delay: index * 0.1,
          ease: "back.out(0.6)",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Animation pour le CTA
    gsap.fromTo(
      ctaRef.current,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: 0.3,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 90%",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [language]);

  return (
    <HowItWorksSection ref={sectionRef} id="how-it-works">
    <PageContainer>
      <FloatingOrb />
      <FloatingOrbSecondary />

      <Header ref={headerRef}>
        <Badge>{t.eyebrow}</Badge>
        <Title>
          {t.titleStart} <span>{t.titleHighlight}</span>
        </Title>
        <Subtitle>
          {t.subtitle}
        </Subtitle>
      </Header>

      <Grid>
        {t.steps.map((step, idx) => (
          <Card
            key={idx}
            ref={(el) => (cardsRef.current[idx] = el)}
          >
            <IconWrapper className="card-icon"><StepIcon index={idx} /></IconWrapper>
            <StepNumber>{step.number}</StepNumber>
            <CardTitle>{step.title}</CardTitle>
            <CardDesc>{step.desc}</CardDesc>
            <Highlight>{step.badge}</Highlight>
          </Card>
        ))}
      </Grid>

   
    </PageContainer>
    </HowItWorksSection>
  );
};

export default ModernJourneyPage;
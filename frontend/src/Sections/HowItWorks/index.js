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
  margin-bottom: 5rem;
  position: relative;
  z-index: 2;
`;

const Badge = styled.div`
  display: inline-block;
  background: rgba(0, 200, 100, 0.15);
  backdrop-filter: blur(8px);
  padding: 0.4rem 1.2rem;
  border-radius: 40px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #00c864;
  border: 1px solid rgba(0, 200, 100, 0.3);
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  opacity: 0;

  span {
    background: linear-gradient(90deg, #00c864, #ef4444);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmer} 4s linear infinite;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  max-width: 600px;
  margin: 1rem auto 0;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
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
  background: rgba(20, 24, 30, 0.65);
  backdrop-filter: blur(12px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2rem;
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
    background: linear-gradient(90deg, #00c864, #ef4444);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.5s ease;
  }

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(0, 200, 100, 0.3);
    background: rgba(25, 30, 38, 0.8);
    box-shadow: 0 25px 45px -12px rgba(0, 200, 100, 0.25);

    &::before {
      transform: scaleX(1);
    }

    .card-icon {
      transform: scale(1.05);
      filter: drop-shadow(0 0 8px rgba(0,200,100,0.4));
    }
  }
`;

const IconWrapper = styled.div`
  font-size: 2.8rem;
  margin-bottom: 1.5rem;
  display: inline-block;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2));
`;

const StepNumber = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.8rem;
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, rgba(0,200,100,0.2), rgba(239,68,68,0.1));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.03em;
  opacity: 0.5;
  font-family: monospace;
`;

const CardTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
`;

const CardDesc = styled.p`
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 1rem;
`;

const Highlight = styled.div`
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #00c864;
  background: rgba(0, 200, 100, 0.1);
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  margin-top: 0.5rem;
  letter-spacing: 0.02em;
`;

const CTASection = styled.div`
  text-align: center;
  margin-top: 5rem;
  position: relative;
  z-index: 2;
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, #00c864, #0fa958);
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 20px rgba(0, 200, 100, 0.3);
  backdrop-filter: blur(4px);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 30px rgba(0, 200, 100, 0.5);
    background: linear-gradient(135deg, #0fd96e, #00b84c);
  }
`;

const SmallNote = styled.p`
  color: rgba(255,255,255,0.4);
  font-size: 0.75rem;
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
            <IconWrapper className="card-icon">{step.icon}</IconWrapper>
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
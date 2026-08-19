import React, { useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CountUp from "react-countup";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const Section = styled.section`
  padding: 6rem 5%;
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  opacity: 0;
`;

const Eyebrow = styled.span`
  display: inline-block;
  font-size: 0.72rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #00c864;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 800;
  color: #fff;
  margin: 0 0 1rem;
  letter-spacing: -0.03em;
  line-height: 1.1;

  span {
    background: linear-gradient(90deg, #00c864, #ef4444);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 4s linear infinite;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: rgba(255,255,255,0.4);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.7;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    padding: 0 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 0.5rem;
  }
`;

const StatCard = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  opacity: 0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(0,200,100,0.3);
    background: rgba(0,200,100,0.06);
    box-shadow: 0 20px 40px rgba(0,200,100,0.15);
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
    border-radius: 16px;
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    background: linear-gradient(90deg, #00c864, #ef4444);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-bottom: 0.4rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Stats = () => {
  const { language } = useLanguage();
  const t = translations[language].stats;

  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const cardRefs = useRef([]);
  cardRefs.current = [];

  const addCard = (el) => el && cardRefs.current.push(el);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trig = {
        trigger: sectionRef.current,
        start: "top 70%",
        toggleActions: "play none none reverse",
      };

      gsap.to(headerRef.current, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: trig,
      });

      gsap.to(cardRefs.current, {
        opacity: 1, y: 0, duration: 0.8,
        stagger: 0.15, ease: "power3.out", delay: 0.2,
        scrollTrigger: trig,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { number: parseInt(t.studentsCount), suffix: "+", label: t.students },
    { number: parseInt(t.universitiesCount), suffix: "+", label: t.universities },
    { number: parseInt(t.experienceCount), suffix: "+", label: t.experience },
  ];

  return (
    <Section ref={sectionRef} id="stats">
      <Header ref={headerRef}>
        <Eyebrow>{t.title}</Eyebrow>
        <Title>{t.subtitle} <span>Matter</span></Title>
        <Subtitle>
          {t.description}
        </Subtitle>
      </Header>

      <Grid>
        {stats.map((stat, i) => (
          <StatCard key={i} ref={addCard}>
            <StatNumber>
              {stat.prefix && <span>{stat.prefix}</span>}
              <CountUp end={stat.number} duration={2} />
              {stat.suffix && <span>{stat.suffix}</span>}
            </StatNumber>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </Grid>
    </Section>
  );
};

export default Stats;

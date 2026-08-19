import React, { useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import unimiLogo from "../../assets/Unimi-logo.png";
import bolognaLogo from "../../assets/525-5257894_thumb-image-university-of-bologna-logo-hd-png.png";
import romeLogo from "../../assets/Uniroma1.svg.png";
import pisaLogo from "../../assets/University-of-Pisa-Italy.png";

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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 0.5rem;
  }
`;

const UniversityCard = styled.a`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 2rem;
  opacity: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(0,200,100,0.3);
    background: rgba(0,200,100,0.06);
    box-shadow: 0 20px 40px rgba(0,200,100,0.15);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 16px;
  }
`;

const UniversityLogo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: contain;
  margin-bottom: 1.5rem;
  padding: 0.5rem;

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }

  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
    margin-bottom: 1rem;
  }
`;

const UniversityName = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem;
`;

const UniversityLocation = styled.div`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.5);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UniversityDescription = styled.p`
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
`;

const SeeMoreButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #00c864;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: auto;

  &:hover {
    color: #00b85a;
    transform: translateX(4px);
  }

  &::after {
    content: '→';
    font-size: 0.8rem;
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: translateX(2px);
  }
`;

// ✅ Index-based arrays — language-agnostic
const logoMap = [unimiLogo, bolognaLogo, romeLogo, pisaLogo];
const websiteMap = [
  "https://www.unimi.it/",
  "https://www.unibo.it/",
  "https://www.uniroma1.it/",
  "https://www.unipi.it/",
];

const Universities = () => {
  const { language } = useLanguage();
  const t = translations[language].universities;

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
        stagger: 0.1, ease: "power3.out", delay: 0.2,
        scrollTrigger: trig,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Section ref={sectionRef} id="universities">
      <Header ref={headerRef}>
        <Eyebrow>{t.title}</Eyebrow>
        <Title>{t.subtitle}</Title>
        <Subtitle>{t.description}</Subtitle>
      </Header>

      <Grid>
        {t.items.map((university, i) => (
          <UniversityCard
            key={i}
            ref={addCard}
            href={websiteMap[i] || '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <UniversityLogo
              src={logoMap[i]}
              alt={`${university.name} logo`}
            />
            <UniversityName>{university.name}</UniversityName>
            <UniversityLocation>
              📍 {university.location}
            </UniversityLocation>
            <UniversityDescription>
              {university.description}
            </UniversityDescription>
            <SeeMoreButton>{t.seeMore}</SeeMoreButton>
          </UniversityCard>
        ))}
      </Grid>
    </Section>
  );
};

export default Universities;
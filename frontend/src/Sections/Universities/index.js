import React, { useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import milanCampus from "../../assets/university-campuses/milan-campus.jpg";
import bolognaCampus from "../../assets/university-campuses/bologna-campus.jpeg";
import sapienzaCampus from "../../assets/university-campuses/sapienza-campus.jpg";
import pisaCampus from "../../assets/university-campuses/pisa-campus.jpg";

gsap.registerPlugin(ScrollTrigger);

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const Section = styled.section`
  padding: 6rem 5%;
  position: relative;
  overflow: hidden;
  background: #f1f3f2;
  color: #202124;
  transition: background 220ms ease, color 220ms ease;

  body.theme-dark & {
    background:
      radial-gradient(circle at 10% 24%, rgba(19, 138, 91, 0.08), transparent 28%),
      radial-gradient(circle at 90% 72%, rgba(201, 52, 62, 0.07), transparent 30%),
      #3b3f43;
    color: #f8fafc;
  }
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
  color: #138A5B;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 800;
  color: var(--text);
  margin: 0 0 1rem;
  letter-spacing: -0.03em;
  line-height: 1.1;

  span {
    background: linear-gradient(90deg, #C9343E, #138A5B);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 4s linear infinite;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--text-muted);
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
  background: var(--surface);
  border: 1px solid rgba(32,33,36,0.12);
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
    border-color: rgba(19,138,91,0.35);
    background: rgba(19,138,91,0.06);
    box-shadow: 0 20px 40px rgba(19,138,91,0.15);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 16px;
  }
`;

const UniversityImage = styled.img`
  width: 100%;
  height: 168px;
  border-radius: 14px;
  object-fit: cover;
  object-position: center;
  display: block;
  margin: -0.35rem 0 1.35rem;
  background: var(--surface-muted);
  border: 1px solid rgba(32,33,36,0.08);

  @media (max-width: 768px) {
    height: 150px;
  }

  @media (max-width: 480px) {
    height: 140px;
    margin-bottom: 1rem;
  }
`;

const UniversityName = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.5rem;
`;

const UniversityLocation = styled.div`
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UniversityDescription = styled.p`
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
`;

const SeeMoreButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #138A5B;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: auto;

  &:hover {
    color: #0E704A;
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
const campusImageMap = [milanCampus, bolognaCampus, sapienzaCampus, pisaCampus];
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
            <UniversityImage
              src={campusImageMap[i]}
              alt={`${university.name} campus`}
              loading="lazy"
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
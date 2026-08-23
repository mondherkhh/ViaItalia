import React, { useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import checked from "../../assets/checked.png";
import worldMap from "../../assets/world-map-about-background.png";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

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
  padding: 6rem 5%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--surface);
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.86)),
    url(${worldMap});
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  color: var(--text);
  transition: background 220ms ease, color 220ms ease;

  &::before {
    position: absolute;
    z-index: -1;
    inset: 0;
    content: "";
    pointer-events: none;
    background: url(${worldMap}) center / cover no-repeat;
    opacity: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  body.theme-dark & {
    background-color: #0d1118;
    background-image:
      radial-gradient(circle at 10% 10%, rgba(19, 138, 91, 0.12), transparent 32%),
      radial-gradient(circle at 92% 80%, rgba(201, 52, 62, 0.1), transparent 34%);
    color: #f8fafc;
  }

  body.theme-dark &::before {
    opacity: 0.2;
    filter: grayscale(1) brightness(1.7) contrast(0.9);
    mix-blend-mode: screen;
  }

  @media (max-width: 768px) {
    padding: 5rem 1.25rem;
  }
`;

/* ── Header ── */
const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  opacity: 0;
`;

const Eyebrow = styled.span`
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #138A5B;
`;

const Title = styled.h2`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: var(--text);
  margin: 1rem 0;

  span {
    background: linear-gradient(90deg, #C9343E, #138A5B);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmer} 4s linear infinite;
  }

  body.theme-dark & span {
    background: linear-gradient(90deg, #22c55e, #a89b6d);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Subtitle = styled.p`
  color: var(--text-muted);
  max-width: 500px;
  margin: auto;
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
  color: var(--text-muted);
  line-height: 1.8;
`;

/* ── Features ── */
const Features = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Card = styled.div`
  background: var(--surface);
  border: 1px solid rgba(32,33,36,0.12);
  padding: 1.5rem;
  border-radius: 18px;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: all 0.3s ease;
  opacity: 0;

  body.theme-dark & {
    background: rgba(29, 36, 44, 0.84);
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.18);
  }

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(19,138,91,0.45);
    background: rgba(19,138,91,0.06);
  }

  body.theme-dark &:hover {
    background: rgba(34, 45, 55, 0.9);
    border-color: rgba(19, 138, 91, 0.62);
  }
`;

const Icon = styled.img`
  width: 32px;
`;

const CardText = styled.div``;

const CardTitle = styled.h4`
  color: #138A5B;
  margin-bottom: 0.3rem;
`;

const CardDesc = styled.p`
  font-size: 0.9rem;
  color: var(--text-muted);
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
        </TextBlock>

        <Features>
          {t.features.map((f, i) => (
            <Card key={i} ref={addToRefs}>
              <Icon src={checked} />
              <CardText>
                <CardTitle>{f.title}</CardTitle>
                <CardDesc>{f.desc}</CardDesc>
              </CardText>
            </Card>
          ))}
        </Features>
      </Grid>

    </Section>
  );
};

export default About;

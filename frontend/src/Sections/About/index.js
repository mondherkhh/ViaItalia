import React, { useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import checked from "../../assets/checked.png";
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
  min-height: 100vh;
  padding: 6rem 5%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  color: #00c864;
`;

const Title = styled.h2`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: #fff;
  margin: 1rem 0;

  span {
    background: linear-gradient(90deg, #00c864, #ef4444);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmer} 4s linear infinite;
  }
`;

const Subtitle = styled.p`
  color: rgba(255,255,255,0.5);
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
  color: rgba(255,255,255,0.8);
  line-height: 1.8;
`;

/* ── Features ── */
const Features = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Card = styled.div`
  background: rgba(255,255,255,0.04);
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
    border-color: rgba(0,200,100,0.4);
    background: rgba(0,200,100,0.06);
  }
`;

const Icon = styled.img`
  width: 32px;
`;

const CardText = styled.div``;

const CardTitle = styled.h4`
  color: #00c864;
  margin-bottom: 0.3rem;
`;

const CardDesc = styled.p`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.6);
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
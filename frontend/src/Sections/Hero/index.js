import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { gsap } from "gsap";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

import arrow from "../../assets/Arrow Right.svg";

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const ambientGlow = keyframes`
  0%, 100% { transform: translate3d(-8%, -4%, 0) scale(1); opacity: 0.45; }
  50% { transform: translate3d(8%, 5%, 0) scale(1.12); opacity: 0.7; }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 200, 100, 0); }
  50% { box-shadow: 0 0 0 8px rgba(0, 200, 100, 0.08), 0 12px 40px rgba(0, 200, 100, 0.18); }
`;

const Section = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 5%;
`;

const DetailsSection = styled.section`
  position: relative;
  isolation: isolate;
  min-height: 48vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 5rem 5% 6rem;
  background:
    radial-gradient(circle at 50% 0%, rgba(0, 200, 100, 0.08), transparent 36%),
    #10141f;

  &::before,
  &::after {
    content: "";
    position: absolute;
    z-index: -1;
    width: min(34rem, 70vw);
    aspect-ratio: 1;
    border-radius: 50%;
    filter: blur(70px);
    pointer-events: none;
  }

  &::before {
    top: -55%;
    left: -12%;
    background: rgba(0, 200, 100, 0.11);
    animation: ${ambientGlow} 12s ease-in-out infinite;
  }

  &::after {
    right: -15%;
    bottom: -65%;
    background: rgba(239, 68, 68, 0.09);
    animation: ${ambientGlow} 15s ease-in-out infinite reverse;
  }
`;

const Container = styled.div`
  max-width: 1100px;
  width: 100%;
  text-align: center;
`;

const DetailsCard = styled.div`
  position: relative;
  max-width: 850px;
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 3.5rem);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.025));
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(110deg, rgba(0, 200, 100, 0.32), transparent 36%, rgba(239, 68, 68, 0.2));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
`;

const Badge = styled.div`
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #00c864;
  margin-bottom: 1.5rem;
  opacity: 0;
`;

const Title = styled.h1`
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.1;
  margin: 0;
  opacity: 0;

  span {
    background: linear-gradient(90deg, #00c864, #ef4444, #00c864);
    background-size: 220% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmer} 4s linear infinite;
  }
`;

const Subtitle = styled.p`
  position: relative;
  font-size: clamp(1rem, 1.7vw, 1.15rem);
  color: rgba(255, 255, 255, 0.72);
  max-width: 650px;
  margin: 0 auto 2.5rem;
  line-height: 1.7;
  opacity: 0;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  opacity: 0;
`;

const Button = styled.button`
  position: relative;
  overflow: hidden;
  min-width: 190px;
  padding: 1rem 1.8rem;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease;
  background: ${p => (p.primary ? "linear-gradient(135deg, #00d978, #00b85a)" : "rgba(255,255,255,0.055)")};
  color: white;
  border: ${p => (p.primary ? "1px solid rgba(117, 255, 178, 0.35)" : "1px solid rgba(255,255,255,0.16)")};
  box-shadow: ${p => (p.primary ? "0 12px 32px rgba(0, 200, 100, 0.2)" : "none")};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.25), transparent 65%);
    transform: translateX(-130%);
    transition: transform 0.65s ease;
  }

  &:hover {
    transform: translateY(-5px) scale(1.02);
    background: ${p => (p.primary ? "linear-gradient(135deg, #13e987, #00c864)" : "rgba(255,255,255,0.1)")};
    border-color: rgba(0, 220, 120, 0.55);
    box-shadow: ${p => (p.primary ? "0 18px 42px rgba(0, 200, 100, 0.3)" : "0 14px 32px rgba(0, 0, 0, 0.22)")};
  }

  &:hover::before {
    transform: translateX(130%);
  }

  &:active {
    transform: translateY(-1px) scale(0.99);
  }

  img {
    width: 1rem;
    transition: transform 0.3s ease;
    filter: brightness(0) invert(1);
  }

  &:hover img {
    transform: translateX(4px);
  }
`;

const Trust = styled.div`
  margin-top: 2.3rem;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
  color: rgba(255, 255, 255, 0.48);
  opacity: 0;

  &::before {
    content: "✓";
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.5rem;
    border-radius: 50%;
    color: #0d1a14;
    background: #00c864;
    font-size: 0.75rem;
    font-weight: 800;
    animation: ${pulse} 2.4s ease-in-out infinite;
  }
`;

export function HeroTitle() {
  const { language } = useLanguage();
  const t = translations[language].hero;
  const badgeRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const timeline = gsap.timeline();
    timeline
      .fromTo(badgeRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
      .fromTo(titleRef.current, { opacity: 0, y: 28, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" }, "-=0.35");
    return () => timeline.kill();
  }, []);

  return (
    <Section id="home">
      <Container>
        <Badge ref={badgeRef}>{t.badge}</Badge>
        <Title ref={titleRef}>
          {t.title} <span>Italy</span>
        </Title>
      </Container>
    </Section>
  );
}

export function HeroDetails() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].hero;
  const sectionRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const trustRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const timeline = gsap.timeline({ paused: true });
    timeline
      .fromTo(section.querySelector("[data-details-card]"), { opacity: 0, y: 42, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" })
      .fromTo(subtitleRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, "-=0.35")
      .fromTo(buttonsRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, "-=0.25")
      .fromTo(trustRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.2");

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        timeline.play();
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    observer.observe(section);
    return () => {
      observer.disconnect();
      timeline.kill();
    };
  }, []);

  return (
    <DetailsSection ref={sectionRef} aria-label="Hero information">
      <Container>
        <DetailsCard data-details-card>
          <Subtitle ref={subtitleRef}>{t.subtitle}</Subtitle>
          <Buttons ref={buttonsRef}>
            <Button primary onClick={() => window.open("https://calendly.com/viaitaliaagency/30min", "_blank", "noopener,noreferrer")}>
              {t.button1}
            </Button>
            <Button onClick={() => navigate("/study-form")}>
              {t.button2}
              <img src={arrow} alt="" />
            </Button>
          </Buttons>
          <Trust ref={trustRef}>{t.trust}</Trust>
        </DetailsCard>
      </Container>
    </DetailsSection>
  );
}

export default HeroTitle;

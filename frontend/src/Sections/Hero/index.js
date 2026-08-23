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
  0%, 100% { box-shadow: 0 0 0 0 rgba(19, 138, 91, 0); }
  50% { box-shadow: 0 0 0 8px rgba(242, 201, 76, 0.10), 0 12px 40px rgba(201, 52, 62, 0.18); }
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
  min-height: 36vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 4rem 5%;
  background:
    radial-gradient(circle at 8% 35%, rgba(19, 138, 91, 0.10), transparent 28%),
    radial-gradient(circle at 92% 70%, rgba(201, 52, 62, 0.07), transparent 30%),
    var(--background);

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
    background: rgba(19, 138, 91, 0.12);
    animation: ${ambientGlow} 12s ease-in-out infinite;
  }

  &::after {
    right: -15%;
    bottom: -65%;
    background: rgba(201, 52, 62, 0.10);
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
  max-width: 900px;
  margin: 0 auto;
  padding: clamp(1.8rem, 4vw, 3rem) clamp(1.4rem, 5vw, 4rem);
  border: 1px solid var(--border);
  border-radius: 28px;
  background: var(--surface);
  box-shadow: 0 22px 55px rgba(17, 17, 17, 0.13), 0 4px 12px rgba(17, 17, 17, 0.04);
  backdrop-filter: blur(12px);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(110deg, rgba(19, 138, 91, 0.24), transparent 36%, rgba(201, 52, 62, 0.25));
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
  color: #138A5B;
  margin-bottom: 1.5rem;
  opacity: 0;
`;

const Title = styled.h1`
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  color: var(--text);
  line-height: 1.1;
  margin: 0;
  opacity: 0;

  span {
    background: linear-gradient(90deg, #138A5B, #C9343E, #138A5B);
    background-size: 220% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmer} 4s linear infinite;
  }
`;

const Subtitle = styled.p`
  position: relative;
  max-width: 700px;
  margin: 0 auto 2rem;
  color: var(--text) !important;
  font-size: clamp(1.05rem, 1.8vw, 1.3rem);
  font-weight: 700;
  line-height: 1.55;
  letter-spacing: -0.015em;
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
  min-width: 220px;
  padding: 0.95rem 1.5rem;
  border-radius: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease;
  background: ${({ primary }) => primary ? "linear-gradient(135deg, #138A5B, #0E6B46)" : "var(--surface-muted)"};
  color: ${({ primary }) => primary ? "#FFFFFF" : "var(--text)"} !important;
  border: 1px solid ${({ primary }) => primary ? "rgba(19, 138, 91, 0.35)" : "var(--border)"};
  box-shadow: ${({ primary }) => primary ? "0 12px 28px rgba(19, 138, 91, 0.22)" : "0 5px 14px rgba(17, 17, 17, 0.06)"};

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
    background: ${({ primary }) => primary ? "linear-gradient(135deg, #17A673, #138A5B)" : "var(--surface-muted)"};
    border-color: ${({ primary }) => primary ? "rgba(19, 138, 91, 0.55)" : "rgba(19, 138, 91, 0.42)"};
    box-shadow: ${({ primary }) => primary ? "0 18px 42px rgba(19, 138, 91, 0.30)" : "0 10px 24px rgba(17, 17, 17, 0.10)"};
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
    filter: ${({ primary }) => primary ? "brightness(0) invert(1)" : "none"};
  }

  &:hover img {
    transform: translateX(4px);
  }
`;

const Trust = styled.div`
  margin-top: 1.5rem;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
color: var(--text) !important;
  font-weight: 600;
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
    color: #FFFFFF;
    background: #138A5B;
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
          {t.title} <span>{language === "fr" ? "Italie" : "Italy"}</span>
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
            <Button onClick={() => window.open("https://calendly.com/viaitaliaagency/30min", "_blank", "noopener,noreferrer")}>
              {t.button1}
            </Button>
            <Button primary onClick={() => navigate("/study-form")}>
              {t.button2 || (language === "fr" ? "Commencer votre candidature" : "Start your application")}
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

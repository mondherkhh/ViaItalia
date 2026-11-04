import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { gsap } from "gsap";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

import arrow from "../../assets/Arrow Right.svg";

/* Animations */
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 6px rgba(87,213,59,0.4), 0 2px 6px rgba(87,213,59,0.2); }
  50% { box-shadow: 0 0 14px rgba(87,213,59,0.65), 0 4px 16px rgba(87,213,59,0.35); }
`;

/* Section */
const Section = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 5%;
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
  background: var(--background);

  body.theme-dark & {
    background: var(--background);
  }
`;

const Container = styled.div`
  max-width: 1100px;
  width: 100%;
  text-align: center;
  margin-top: -1.5rem;
`;

/* ===== NEW CTA CARD ===== */
const CTACard = styled.div`
  position: relative;
  max-width: 92%;
  margin: 0 auto;
  padding: clamp(2.2rem, 5vw, 3.5rem) clamp(2rem, 5vw, 3.5rem);
  border-radius: 24px;
  background: var(--background-secondary);
  border: 1px solid var(--border-subtle);
  box-shadow:
    0 20px 60px rgba(17,17,17,0.12),
    0 8px 28px rgba(87,213,59,0.06);
  overflow: hidden;
  isolation: isolate;
  text-align: center;

  /* Subtle radial glows */
  &::before, &::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  &::before {
    top: -40%;
    left: -20%;
    width: 80%;
    height: 80%;
    background: radial-gradient(circle at 30% 20%, rgba(87,213,59,0.12), transparent 60%);
  }
  &::after {
    bottom: -30%;
    right: -20%;
    width: 80%;
    height: 60%;
    background: radial-gradient(circle at 70% 80%, rgba(59,130,246,0.08), transparent 70%);
  }

  body.theme-dark & {
    background: #0d1220;
    border-color: rgba(255,255,255,0.06);
    box-shadow:
      0 20px 60px rgba(0,0,0,0.35),
      0 8px 28px rgba(87,213,59,0.08);
  }
`;

/* Decorative green dots */
const DotCluster = styled.div`
  position: absolute;
  top: 1.2rem;
  right: 1.8rem;
  z-index: 1;
  display: flex;
  gap: 6px;
  pointer-events: none;

  span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(87,213,59,0.35);
    box-shadow: 0 0 4px rgba(87,213,59,0.4);
  }
`;

/* Badge live */
const LiveBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1rem;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  background: var(--background-tertiary);
  backdrop-filter: blur(6px);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  margin-bottom: 1.8rem;
  z-index: 1;
  position: relative;
`;

const GlowDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #57D53B;
  box-shadow: 0 0 6px rgba(87,213,59,0.6), 0 0 14px rgba(87,213,59,0.3);
  animation: ${glowPulse} 2.4s ease-in-out infinite;
  display: inline-block;
  flex-shrink: 0;
`;

/* Main integrated title */
const MainTitle = styled.h2`
  font-size: clamp(1.15rem, 2.6vw, 1.45rem);
  font-weight: 500;
  line-height: 1.35;
  color: var(--text-primary);
  margin: 0 0 0.6rem;
  z-index: 1;
  position: relative;

  span.accent-word {
    color: var(--accent, #57D53B);
    font-weight: 700;
  }

  body.theme-dark & {
    color: #f1f5f9;
  }
`;

/* Short description */
const ShortDesc = styled.p`
  max-width: 380px;
  margin: 0 auto 1.8rem;
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.55;
  z-index: 1;
  position: relative;

  body.theme-dark & {
    color: #94a3b8;
  }
`;

/* Buttons row - inverted order */
const ButtonsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.85rem;
  flex-wrap: wrap;
  z-index: 1;
  position: relative;
`;

/* Primary button (now first) */
const PrimaryBtn = styled.button`
  position: relative;
  overflow: hidden;
  min-width: 220px;
  padding: 0.85rem 1.6rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border: none;
  background: linear-gradient(135deg, #57D53B, #4AC02F);
  color: #fff;
  box-shadow:
    0 8px 24px rgba(87,213,59,0.30),
    0 2px 6px rgba(87,213,59,0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow:
      0 14px 32px rgba(87,213,59,0.45),
      0 4px 12px rgba(87,213,59,0.25);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

/* Secondary button (now second) */
const SecondaryBtn = styled.button`
  position: relative;
  overflow: hidden;
  padding: 0.85rem 2.2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-primary);
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: rgba(87,213,59,0.5);
    background: rgba(87,213,59,0.06);
  }

  body.theme-dark & {
    border-color: rgba(255,255,255,0.14);
    color: #e2e8f0;
  }
`;

/* Divider */
const Divider = styled.div`
  width: 60%;
  height: 1px;
  margin: 1.8rem auto 1.2rem;
  background: var(--border-subtle);
  border-radius: 1px;
`;

/* Stats row */
const StatsRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
  z-index: 1;
  position: relative;
`;

const StatItem = styled.div`
  text-align: center;
  flex: 1 1 100px;
  min-width: 80px;
  position: relative;
`;

const StatNumber = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1.1;
  letter-spacing: -0.03em;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.35rem;
  letter-spacing: 0.02em;
`;

/* Vertical separator between stats */
const StatSeparator = styled.div`
  width: 1px;
  height: 32px;
  background: var(--border-subtle);
  align-self: center;
  flex-shrink: 0;

  @media (max-width: 480px) {
    display: none;
  }
`;

/* Old styles kept for HeroTitle */
const Title = styled.h1`
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-black);
  color: var(--text-primary);
  line-height: 1.1;
  margin: 0;
  opacity: 1; /* Fixed: title now visible */

  span {
    color: var(--accent, #57D53B);
    background-size: 220% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmer} 4s linear infinite;
  }
`;

const Badge = styled.div`
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--accent, #57D53B);
  margin-bottom: 1.5rem;
  opacity: 0;
`;

/* ===== NEW HERO DETAILS ===== */
export function HeroDetails() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].hero.cta;
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const card = cardRef.current;
    if (!card) return;

    const timeline = gsap.timeline({ paused: true });
    timeline
      .fromTo(card, { opacity: 0, y: 36, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" })
      .fromTo(card.querySelector("[data-cta-badge]"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.6")
      .fromTo(card.querySelector("[data-cta-title]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.35")
      .fromTo(card.querySelector("[data-cta-desc]"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, "-=0.25")
      .fromTo(card.querySelector("[data-cta-buttons]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, "-=0.2")
      .fromTo(card.querySelector("[data-cta-divider]"), { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.5, ease: "power2.out" }, "-=0.15")
      .fromTo(card.querySelector("[data-cta-stats]"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.2");

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        timeline.play();
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    observer.observe(section);
    return () => {
      observer.disconnect();
      timeline.kill();
    };
  }, []);

  return (
    <DetailsSection ref={sectionRef} aria-label="Hero information">
      <Container>
        <CTACard ref={cardRef} data-details-card>
          <DotCluster aria-hidden="true">
            <span></span><span></span><span></span>
          </DotCluster>

          {/* Badge live */}
          <LiveBadge data-cta-badge>
            <GlowDot aria-hidden="true" />
            {t.badge}
          </LiveBadge>

          {/* Integrated title */}
          <MainTitle data-cta-title>
            {t.title}
          </MainTitle>

          {/* Short description */}
          <ShortDesc data-cta-desc>
            {t.desc}
          </ShortDesc>

          {/* Two buttons - inverted order */}
          <ButtonsRow data-cta-buttons>
            <PrimaryBtn onClick={() => navigate("/register")} aria-label={t.btnPrimary}>
              {t.btnPrimary}
              <img src={arrow} alt="" aria-hidden="true" style={{ width: "0.9rem" }} />
            </PrimaryBtn>

            <SecondaryBtn onClick={() => window.open("https://calendly.com/viaitaliaagency/30min", "_blank", "noopener,noreferrer")} aria-label={t.btnSecondary}>
              <span>{t.btnSecondary}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </SecondaryBtn>
          </ButtonsRow>

          {/* Divider */}
          <Divider data-cta-divider aria-hidden="true" />

          {/* 3 mini-stats */}
          <StatsRow data-cta-stats>
            <StatItem>
              <StatNumber>500+</StatNumber>
              <StatLabel>{t.statStudents}</StatLabel>
            </StatItem>

            <StatSeparator aria-hidden="true" />

            <StatItem>
              <StatNumber>15+</StatNumber>
              <StatLabel>{t.statPartners}</StatLabel>
            </StatItem>

            <StatSeparator aria-hidden="true" />

            <StatItem>
              <StatNumber>98%</StatNumber>
              <StatLabel>{t.statSuccess}</StatLabel>
            </StatItem>
          </StatsRow>
        </CTACard>
      </Container>
    </DetailsSection>
  );
}

/* ===== OLD HERO TITLE KEPT ===== */
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
          {t.title}
        </Title>
      </Container>
    </Section>
  );
}

export default HeroTitle;

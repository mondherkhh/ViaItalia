import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

const CARD_THEMES = [
  {
    cardColor: "#ffffff",
    darkColor: "#17221e",
    accentColor: "#138A5B",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    cardColor: "#f4f7fb",
    darkColor: "#202033",
    accentColor: "#C9343E",
    imageUrl:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
  },
  {
    cardColor: "#f8f4ee",
    darkColor: "#202b39",
    accentColor: "#d99145",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
  {
    cardColor: "#eef5f4",
    darkColor: "#1c2930",
    accentColor: "#4aa9a0",
    imageUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
  },
];

const HowItWorksSection = styled.section`
  position: relative;
  overflow: visible;
  color: var(--text);
  background: #f1f3f2;
  transition: background 220ms ease, color 220ms ease;

  body.theme-dark &,
  :root[data-theme="dark"] & {
    background:
      radial-gradient(circle at 10% 18%, rgba(19, 138, 91, 0.1), transparent 28%),
      radial-gradient(circle at 90% 78%, rgba(201, 52, 62, 0.08), transparent 30%),
      #3b3f43;
    color: #ffffff;
  }
`;

const Intro = styled.div`
  position: relative;
  z-index: 2;
  max-width: 720px;
  margin: 0 auto;
  padding: clamp(5rem, 10vw, 8rem) 1.25rem 2rem;
  text-align: center;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0.4rem 1rem;
  color: #138A5B;
  background: rgba(19, 138, 91, 0.1);
  border: 1px solid rgba(19, 138, 91, 0.28);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 1.2rem 0 0;
  color: #202124;
  font-size: clamp(2.2rem, 5.5vw, 4.5rem);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.055em;

  body.theme-dark &,
  :root[data-theme="dark"] & {
    color: #ffffff;
  }

  span {
    color: #138A5B;
  }
`;

const Subtitle = styled.p`
  max-width: 620px;
  margin: 1.2rem auto 0;
  color: #6b7280;
  font-size: clamp(0.95rem, 1.8vw, 1.1rem);
  line-height: 1.7;

  body.theme-dark &,
  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

/* هذه المساحة هي التي تجبر الصفحة على المرور عبر المراحل الأربع. */
const DeckScrollArea = styled.div`
  position: relative;
  height: var(--deck-height, 520vh);
`;

const DeckSticky = styled.div`
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  min-height: 600px;
  padding: 2rem 1rem;
`;

const DeckFrame = styled.div`
  position: relative;
  width: min(520px, calc(100vw - 2rem));
  height: min(360px, 58vh);
  min-height: 300px;
  perspective: 1400px;
`;

const DeckCard = styled.article`
  position: absolute;
  inset: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(1.25rem, 4vw, 2rem);
  color: #202124;
  background: ${({ $cardColor }) => $cardColor};
  border: 1px solid rgba(32, 33, 36, 0.12);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(32, 33, 36, 0.16);
  transform: translateY(${({ $index }) => $index * 24}px)
    scale(${({ $index }) => 1 - $index * 0.035})
    rotate(${({ $index }) => ($index % 2 === 0 ? -1.2 : 1.2)}deg);
  transform-origin: center bottom;
  will-change: transform, opacity;

  body.theme-dark &,
  :root[data-theme="dark"] & {
    color: #ffffff;
    background: ${({ $darkColor }) => $darkColor};
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    background-image: linear-gradient(
        135deg,
        ${({ $accentColor }) => `${$accentColor}cc`},
        transparent 45%,
        rgba(0, 0, 0, 0.08)
      ),
      ${({ $imageUrl }) => `url("${$imageUrl}")`};
    background-position: center;
    background-size: cover;
    opacity: 0.16;
    mix-blend-mode: multiply;
    pointer-events: none;
  }

  body.theme-dark &::before,
  :root[data-theme="dark"] &::before {
    opacity: 0.22;
    mix-blend-mode: screen;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: ${({ $accentColor }) => $accentColor};
    transform: scaleX(0.35);
    transform-origin: left;
  }
`;

const CardTop = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;

const CardIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.1rem;
  height: 3.1rem;
  color: ${({ $accentColor }) => $accentColor};
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(32, 33, 36, 0.1);
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(32, 33, 36, 0.12);

  body.theme-dark &,
  :root[data-theme="dark"] & {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.14);
  }

  svg {
    width: 1.65rem;
    height: 1.65rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }
`;

const StepNumber = styled.span`
  color: ${({ $accentColor }) => $accentColor};
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.08em;
  opacity: 0.72;
`;

const CardBody = styled.div`
  position: relative;
  z-index: 1;
  max-width: 90%;
`;

const CardTitle = styled.h2`
  margin: 0 0 0.75rem;
  color: inherit;
  font-size: clamp(1.3rem, 3vw, 1.85rem);
  font-weight: 800;
  letter-spacing: -0.04em;
`;

const CardDesc = styled.p`
  max-width: 440px;
  margin: 0;
  color: #4b5563;
  font-size: clamp(0.84rem, 1.6vw, 0.98rem);
  line-height: 1.65;

  body.theme-dark &,
  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

const Highlight = styled.span`
  position: relative;
  z-index: 1;
  align-self: flex-start;
  display: inline-flex;
  width: fit-content;
  padding: 0.38rem 0.8rem;
  color: ${({ $accentColor }) => $accentColor};
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid ${({ $accentColor }) => `${$accentColor}55`};
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;

  body.theme-dark &,
  :root[data-theme="dark"] & {
    background: rgba(255, 255, 255, 0.09);
  }
`;

const ScrollLabel = styled.div`
  position: absolute;
  bottom: 1.8rem;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: #6b7280;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transform: translateX(-50%);

  &::before {
    content: "";
    display: block;
    width: 1.8rem;
    height: 1px;
    background: currentColor;
    opacity: 0.55;
  }

  body.theme-dark &,
  :root[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

const StepIcon = ({ index }) => {
  const icons = [
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>,
    <>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M15 3v4h4M9 12h6M9 16h6" />
    </>,
    <>
      <path d="M3 9.5 12 4l9 5.5-9 5.5z" />
      <path d="M6 12.5V17c3 2 9 2 12 0v-4.5M21 10v6" />
    </>,
    <>
      <path d="M3 12h12" />
      <path d="m11 7 5 5-5 5" />
      <path d="M18 5h3v14h-3" />
    </>,
  ];

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[index % icons.length]}
    </svg>
  );
};

const ModernJourneyPage = () => {
  const { language } = useLanguage();
  const t = translations[language].howItWorks;
  const sectionRef = useRef(null);
  const deckRef = useRef(null);
  const cardsRef = useRef([]);

  const steps = t.steps || [];
  const visibleSteps = steps.slice(0, 4);
  const deckHeight = `${Math.max(480, (visibleSteps.length - 1) * 145 + 120)}vh`;

  useEffect(() => {
    const context = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean);
      if (!cards.length || !deckRef.current) return;

      cards.forEach((card, index) => {
        gsap.set(card, {
          x: 0,
          y: index * 24,
          scale: 1 - index * 0.035,
          rotation: index % 2 === 0 ? -1.2 : 1.2,
          opacity: 1,
          zIndex: cards.length - index,
        });
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: deckRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          snap:
            cards.length > 1
              ? {
                  snapTo: 1 / (cards.length - 1),
                  duration: { min: 0.25, max: 0.7 },
                  delay: 0.08,
                  ease: "power2.out",
                }
              : false,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, index) => {
        if (index === cards.length - 1) return;
        const nextCard = cards[index + 1];

        timeline.to(
          card,
          {
            y: -560,
            x: index % 2 === 0 ? -95 : 95,
            rotation: index % 2 === 0 ? -10 : 10,
            scale: 0.84,
            opacity: 0.12,
            duration: 1,
          },
          index
        );

        timeline.to(
          nextCard,
          {
            y: 0,
            x: 0,
            rotation: 0,
            scale: 1,
            zIndex: cards.length + index,
            duration: 1,
          },
          index
        );
      });

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => context.revert();
  }, [language, visibleSteps.length]);

  return (
    <HowItWorksSection id="how-it-works" ref={sectionRef}>
      <Intro>
        <Badge>{t.eyebrow}</Badge>
        <Title>
          {t.titleStart} <span>{t.titleHighlight}</span>
        </Title>
        <Subtitle>{t.subtitle}</Subtitle>
      </Intro>

      <DeckScrollArea ref={deckRef} style={{ height: deckHeight }}>
        <DeckSticky>
          <DeckFrame>
            {visibleSteps.map((step, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              return (
                <DeckCard
                  key={`${step.number || index}-${step.title}`}
                  ref={(element) => {
                    cardsRef.current[index] = element;
                  }}
                  $index={index}
                  $cardColor={theme.cardColor}
                  $darkColor={theme.darkColor}
                  $accentColor={theme.accentColor}
                  $imageUrl={theme.imageUrl}
                >
                  <CardTop>
                    <CardIcon $accentColor={theme.accentColor}>
                      <StepIcon index={index} />
                    </CardIcon>
                    <StepNumber $accentColor={theme.accentColor}>
                      {step.number || String(index + 1).padStart(2, "0")}
                    </StepNumber>
                  </CardTop>

                  <CardBody>
                    <CardTitle>{step.title}</CardTitle>
                    <CardDesc>{step.desc}</CardDesc>
                  </CardBody>

                  <Highlight $accentColor={theme.accentColor}>{step.badge}</Highlight>
                </DeckCard>
              );
            })}
          </DeckFrame>
          <ScrollLabel>Scroll to explore</ScrollLabel>
        </DeckSticky>
      </DeckScrollArea>
    </HowItWorksSection>
  );
};

export default ModernJourneyPage;


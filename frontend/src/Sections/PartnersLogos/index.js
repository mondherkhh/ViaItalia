import React from "react";
import styled, { keyframes } from "styled-components";
import { useLanguage } from "../../contexts/LanguageContext";
import { translations } from "../../translations";

import Bologna from "../../assets/525-5257894_thumb-image-university-of-bologna-logo-hd-png.png";
import Genova from "../../assets/Universita-di-Genova-logo.png";
import Politecnico from "../../assets/Politecnico-di-Milano-logo.png";
import Unimi from "../../assets/Unimi-logo.png";
import Roma from "../../assets/Uniroma1.svg.png";

const logos = [
  { id: "sapienza", name: "Sapienza Università di Roma", image: Roma },
  { id: "unimi", name: "Università degli Studi di Milano — La Statale", image: Unimi },
  { id: "politecnico", name: "Politecnico di Milano", image: Politecnico },
  { id: "bologna", name: "Università di Bologna", image: Bologna },
  { id: "genova", name: "Università di Genova", image: Genova },
];

const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const Section = styled.section`
  width: 100%;
  padding: 6rem 0 8rem;
  overflow: hidden;
  background: #10141f;
  color: #fff;

  @media (max-width: 640px) {
    padding: 3.5rem 0 4.5rem;
  }
`;

const Heading = styled.h2`
  margin: 0 auto 4rem;
  padding: 0 1.25rem;
  color: #fff;
  font-size: clamp(1.35rem, 2.5vw, 2.35rem);
  font-weight: 700;
  text-align: center;
`;

const Viewport = styled.div`
  position: relative;
  width: min(1180px, 100%);
  min-height: 118px;
  margin: 0 auto;
  overflow: hidden;

  &::before,
  &::after {
    position: absolute;
    z-index: 2;
    top: 0;
    bottom: 0;
    width: clamp(2rem, 9vw, 7rem);
    content: "";
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(90deg, #10141f, transparent);
  }

  &::after {
    right: 0;
    background: linear-gradient(270deg, #10141f, transparent);
  }
`;

const Track = styled.div`
  display: flex;
  width: max-content;
  animation: ${scroll} 10s linear infinite;
  will-change: transform;

  &:hover {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: translateX(0);
  }
`;

const LogoItem = styled.div`
  display: flex;
  flex: 0 0 270px;
  align-items: center;
  justify-content: center;
  height: 84px;
  gap: 0.8rem;
  margin: 0 1.4rem;
  padding: 0;

  img {
    display: block;
    max-width: 42px;
    max-height: 34px;
    width: auto;
    height: auto;
    object-fit: contain;
    filter: none;
    opacity: 1;
    transition: transform 180ms ease, opacity 180ms ease;
  }

  &:hover img {
    transform: scale(1.04);
    opacity: 1;
  }

  @media (max-width: 640px) {
    flex-basis: 220px;
    height: 70px;
    gap: 0.55rem;
    margin: 0 0.8rem;

    img {
      max-width: 32px;
      max-height: 28px;
    }
  }
`;

const LogoName = styled.span`
  max-width: 190px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.25;
  text-align: left;
  white-space: nowrap;

  @media (max-width: 640px) {
    max-width: 145px;
    font-size: 0.66rem;
    white-space: normal;
  }
`;

function LogoSet({ copy = 1 }) {
  return logos.map((logo) => (
    <LogoItem key={`${copy}-${logo.id}`} title={logo.name}>
      <img src={logo.image} alt="" />
      <LogoName>{logo.name}</LogoName>
    </LogoItem>
  ));
}

export default function PartnersLogos({ heading }) {
  const { language } = useLanguage();
  const translatedHeading = heading || translations[language]?.partnersLogos?.title || translations.fr.partnersLogos.title;

  return (
    <Section aria-labelledby="partners-heading">
      <Heading id="partners-heading">{translatedHeading}</Heading>
      <Viewport>
        <Track>
          <LogoSet copy="a" />
          <LogoSet copy="b" />
        </Track>
      </Viewport>
    </Section>
  );
}

import React, { useState } from "react";
import styled from "styled-components";
import { useLanguage } from "../../contexts/LanguageContext";
import { translations } from "../../translations";

const Section = styled.section`
  position: relative;
  overflow: hidden;
  padding: 7rem 4%;
  background: #0b0d13;
  color: #fff;

  @media (max-width: 640px) {
    padding: 4.5rem 1rem;
  }
`;

const Inner = styled.div`
  width: min(1160px, 100%);
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 4rem;

  @media (max-width: 760px) {
    display: block;
    margin-bottom: 2.5rem;
  }
`;

const Copy = styled.div`
  max-width: 760px;
`;

const Eyebrow = styled.p`
  margin: 0 0 1.2rem;
  color: #00c864;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.34em;
  text-transform: uppercase;
`;

const Title = styled.h2`
  margin: 0;
  color: #f8fafc;
  font-size: clamp(2.5rem, 6vw, 4.7rem);
  font-weight: 700;
  letter-spacing: -0.055em;
  line-height: 0.98;
`;

const Subtitle = styled.p`
  max-width: 680px;
  margin: 1.5rem 0 0;
  color: rgba(255, 255, 255, 0.56);
  font-size: 1rem;
  line-height: 1.7;
`;

const List = styled.div`
  display: grid;
  gap: 1.3rem;
`;

const Item = styled.article`
  overflow: hidden;
  border: 1px solid ${({ $open }) => ($open ? "rgba(0, 200, 100, 0.42)" : "rgba(255, 255, 255, 0.13)")};
  border-radius: 28px;
  background: ${({ $open }) => ($open ? "rgba(0, 200, 100, 0.055)" : "rgba(255, 255, 255, 0.018)")};
  transition: border-color 240ms ease, background 240ms ease, transform 240ms ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 200, 100, 0.4);
  }
`;

const Question = styled.button`
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr) auto;
  width: 100%;
  min-height: 128px;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 2.2rem;
  border: 0;
  background: transparent;
  color: #f8fafc;
  font: inherit;
  font-size: clamp(1rem, 2vw, 1.35rem);
  font-weight: 700;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #00c864;
    outline-offset: -4px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 3.2rem minmax(0, 1fr);
    min-height: 96px;
    gap: 1rem;
    padding: 1.1rem 1rem;
  }
`;

const Plus = styled.span`
  display: inline-flex;
  width: 3.8rem;
  height: 3.8rem;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ $open }) => ($open ? "rgba(0, 200, 100, 0.7)" : "rgba(255, 255, 255, 0.24)")};
  border-radius: 50%;
  color: ${({ $open }) => ($open ? "#00c864" : "#fff")};
  font-size: 1.7rem;
  font-weight: 300;
  line-height: 1;
  transform: rotate(${({ $open }) => ($open ? "45deg" : "0deg")});
  transition: transform 240ms ease, border-color 240ms ease, color 240ms ease;

  @media (max-width: 640px) {
    width: 2.8rem;
    height: 2.8rem;
    font-size: 1.35rem;
  }
`;

const Meta = styled.span`
  justify-self: end;
  padding: 0.45rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.3em;
  line-height: 1;
  text-transform: uppercase;

  @media (max-width: 640px) {
    display: none;
  }
`;

const Answer = styled.div`
  display: grid;
  grid-template-rows: ${({ $open }) => ($open ? "1fr" : "0fr")};
  transition: grid-template-rows 300ms ease;
`;

const AnswerInner = styled.div`
  min-height: 0;
  overflow: hidden;
`;

const AnswerText = styled.p`
  margin: 0;
  padding: 0 2.2rem 1.8rem 8.2rem;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.98rem;
  line-height: 1.75;

  @media (max-width: 640px) {
    padding: 0 1.1rem 1.3rem 4.8rem;
    font-size: 0.9rem;
  }
`;

export default function FAQ() {
  const { language } = useLanguage();
  const t = translations[language]?.faq || translations.fr.faq;
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Section id="faq" aria-labelledby="faq-title">
      <Inner>
        <Header>
          <Copy>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <Title id="faq-title">{t.title}</Title>
            <Subtitle>{t.subtitle}</Subtitle>
          </Copy>
        </Header>

        <List>
          {t.items.map((item, index) => {
            const open = activeIndex === index;
            return (
              <Item key={item.question} $open={open}>
                <Question
                  type="button"
                  aria-expanded={open}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setActiveIndex(open ? -1 : index)}
                >
                  <Plus $open={open} aria-hidden="true">+</Plus>
                  <span>{item.question}</span>
                  <Meta>{item.meta}</Meta>
                </Question>
                <Answer id={`faq-answer-${index}`} $open={open}>
                  <AnswerInner>
                    <AnswerText>{item.answer}</AnswerText>
                  </AnswerInner>
                </Answer>
              </Item>
            );
          })}
        </List>
      </Inner>
    </Section>
  );
}

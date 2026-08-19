import React from "react";
import styled from "styled-components";
import { useLanguage } from "../contexts/LanguageContext";

const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LangBtn = styled.button`
  background: none;
  border: none;
  color: ${({ $active }) =>
    $active ? "#ffffff" : "rgba(255,255,255,0.4)"};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  transition: all 0.25s ease;
  letter-spacing: 0.05em;

  &:hover {
    color: #fff;
    background: rgba(255,255,255,0.08);
  }

  ${({ $active }) =>
    $active &&
    `
    background: rgba(0,200,100,0.15);
    border: 1px solid rgba(0,200,100,0.3);
  `}
`;

const Divider = styled.div`
  width: 1px;
  height: 20px;
  background: rgba(255,255,255,0.15);
`;

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <SelectorContainer>
      <LangBtn
        $active={language === "en"}
        onClick={() => setLanguage("en")}
      >
        EN
      </LangBtn>
      <Divider />
      <LangBtn
        $active={language === "fr"}
        onClick={() => setLanguage("fr")}
      >
        FR
      </LangBtn>
    </SelectorContainer>
  );
};

export default LanguageSelector;

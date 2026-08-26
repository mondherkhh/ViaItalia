import { useEffect, useRef, useState, useMemo } from "react";
import styled from "styled-components";
import { gsap } from "gsap";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { FiMenu, FiMoon, FiSun, FiX } from "react-icons/fi";
import logo from "../../assets/logo.svg";
import LanguageSelector from "../LanguageSelector";

/* ── Container ── */
const HeaderPanel = styled.div`
  position: relative;
  width: min(1320px, 100%);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const HeaderWrap = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  padding: 0.8rem 2rem;
  pointer-events: none;
  background: var(--nav);
  border-bottom: 1px solid transparent;
  box-shadow: none;
  transition: padding 0.3s ease, background 0.3s ease, border-color 0.3s ease;

  ${HeaderPanel} {
    pointer-events: auto;
  }

  :root[data-theme="dark"] &,
  body.theme-dark & {
    background: #0b0b0b;
  }

  &.scrolled {
    padding-top: 0.55rem;
    padding-bottom: 0.55rem;
    border-bottom-color: var(--border);
  }

  @media (max-width: 768px) {
    padding: 0.65rem 1rem;

    &.scrolled {
      padding-top: 0.55rem;
      padding-bottom: 0.55rem;
    }
  }
`;

/* ── Logo ── */
export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover { 
    transform: scale(1.02);
  }
`;

export const Logo = styled.img`
  width: 54px;
  height: 54px;
  object-fit: contain;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
  
  @media (max-width: 480px) {
    width: 60px;
    height: 55px;
  }
`;

/* ── Nav Center ── */
const Nav = styled.nav`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1.4rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.button`
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;
  white-space: nowrap;

  color: ${({ $active }) =>
    $active ? "var(--text)" : "var(--text-muted)"};
  opacity: ${({ $active }) => ($active ? 1 : 0.78)};

  :root[data-theme="dark"] &,
  body.theme-dark & {
    color: ${({ $active }) =>
      $active ? "#ffffff" : "rgba(255,255,255,0.62)"};
  }

  &:hover {
    color: #138A5B;
    opacity: 1;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -6px;
    left: 0;
    height: 2px;
    width: ${({ $active }) => ($active ? "100%" : "0%")};
    background: linear-gradient(90deg, #138A5B, #C9343E);
    transition: width 0.3s ease;
  }
`;

/* ── Left Button ── */
const LoginBtn = styled.button`
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  padding: 0.55rem 1rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease,
    transform 0.25s ease;

  :root[data-theme="dark"] &,
  body.theme-dark & {
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:hover {
    background: rgba(19, 138, 91, 0.12);
    border-color: #138A5B;
    transform: translateY(-2px);
  }
`;

const ThemeToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--surface-muted);
  color: var(--text);
  cursor: pointer;
  transition: transform 180ms ease, background 180ms ease, color 180ms ease;

  &:hover {
    transform: translateY(-2px);
    background: #138A5B;
    color: #ffffff;
  }

  &:active {
    transform: scale(0.96);
  }
`;

/* ── Right Section ── */
const RightSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.8rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

/* ── Burger ── */
const Burger = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  color: var(--text);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: rgba(19, 138, 91, 0.1);
    border-color: #138A5B;
  }

  &:active {
    transform: scale(0.96);
  }

  :root[data-theme="dark"] &,
  body.theme-dark & {
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

const MobileLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  button {
    width: 100%;
    padding: 0.72rem 0.8rem;
    background: transparent;
    border: 0;
    border-radius: 8px;
    color: var(--text);
    font-size: 0.96rem;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;

    &:hover {
      color: #138A5B;
      background: rgba(19, 138, 91, 0.1);
    }
  }
`;

/* ── Mobile Menu ── */
const MobileMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.7rem);
  right: 0;
  left: auto;
  width: min(280px, calc(100vw - 2rem));
  padding: 0.8rem;
  background: var(--nav);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 16px 35px rgba(0, 0, 0, 0.2);
  display: none;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;

  :root[data-theme="dark"] &,
  body.theme-dark & {
    background: #111111;
    border-color: rgba(255, 255, 255, 0.18);
  }

  & > ${ThemeToggle},
  & > ${LoginBtn} {
    align-self: stretch;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const Header = () => {
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const t = translations[language].nav;

  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const headerRef = useRef(null);
  const menuRef = useRef(null);

  const sections = useMemo(() => [
    { id: "home", label: t.home },
    { id: "about", label: t.about },
    { id: "how-it-works", label: t.howItWorks },
    { id: "services", label: t.services },
    { id: "contact", label: t.contact },
  ], [t]);

  /* ── Scroll Detection ── */
  useEffect(() => {
    const handleScroll = () => {
      // Header scroll effect
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Scroll spy for active section
      let current = "home";
      sections.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = id;
          }
        }
      });
      setActive(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Smooth Scroll ── */
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  /* ── Mobile Menu Animation ── */
  useEffect(() => {
    if (!menuRef.current) return;

    if (open) {
      gsap.to(menuRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        pointerEvents: "auto",
        visibility: "visible",
      });
    } else {
      gsap.to(menuRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        pointerEvents: "none",
        visibility: "hidden",
      });
    }
  }, [open]);

  /* ── Header Entrance ── */
  useEffect(() => {
    gsap.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  return (
    <HeaderWrap className={scrolled ? "scrolled" : ""}>
      <HeaderPanel>
      
      {/* LEFT */}
      <LogoContainer>
        <Logo src={logo} alt="ViaItalia Logo" />
      </LogoContainer>

      {/* CENTER */}
      <Nav>
        {sections.map((item) => (
          <NavItem
            key={item.id}
            $active={active === item.id}
            onClick={() => scrollTo(item.id)}
          >
            {item.label}
          </NavItem>
        ))}
      </Nav>

      {/* RIGHT */}
      <RightSection>
        <ThemeToggle
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
        </ThemeToggle>
        <LanguageSelector />
        <LoginBtn onClick={() => (window.location.href = "/login")}>
          {t.login}
        </LoginBtn>
      </RightSection>

      {/* MOBILE */}
      <Burger
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <FiX size={21} aria-hidden="true" /> : <FiMenu size={21} aria-hidden="true" />}
      </Burger>

      <MobileMenu ref={menuRef}>
        <MobileLinks>
          {sections.map((item) => (
            <button key={item.id} onClick={() => scrollTo(item.id)}>
              {item.label}
            </button>
          ))}
        </MobileLinks>
        <ThemeToggle
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
        </ThemeToggle>
        <LanguageSelector />
        <LoginBtn onClick={() => (window.location.href = "/login")}>
          {t.login}
        </LoginBtn>
      </MobileMenu>
      </HeaderPanel>
    </HeaderWrap>
  );
};

export default Header;

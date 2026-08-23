import { useEffect, useRef, useState, useMemo } from "react";
import styled from "styled-components";
import { gsap } from "gsap";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { FiMoon, FiSun } from "react-icons/fi";
import logo from "../../assets/logo.svg";
import LanguageSelector from "../LanguageSelector";

/* ── Container ── */
const HeaderWrap = styled.header`
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 3rem);
  max-width: 1200px;
  z-index: 999;

  background: var(--nav);
  border: 1px solid var(--border);
  border-radius: 30px;

  padding: 0.55rem 1.25rem;

  display: flex;
  align-items: center;
  justify-content: space-between;

  box-shadow: 
    0 4px 20px rgba(32, 33, 36, 0.12),
    0 0 0 1px rgba(201,52,62,0.12);

  transition: all 0.3s ease;

  &.scrolled {
    top: 1rem;
    background: var(--nav);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    box-shadow: 
      0 8px 32px rgba(32, 33, 36, 0.16),
      0 0 0 1px rgba(32,33,36,0.14) inset;
  }

  @media (max-width: 768px) {
    width: calc(100% - 2rem);
    top: 1rem;
    padding: 0.6rem 1rem;

    &.scrolled {
      top: 0.5rem;
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
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  white-space: nowrap;

  color: ${({ $active }) =>
    $active ? "#C9343E" : "var(--text)"};

  &:hover {
    color: #C9343E;
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
  background: var(--surface-muted);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 0.5rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(19,138,91,0.10);
    border-color: rgba(19,138,91,0.40);
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
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

/* ── Burger ── */
const Burger = styled.div`
  display: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

/* ── Mobile Menu ── */
const MobileMenu = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;

  background: var(--nav);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 2rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  opacity: 0.5;
  pointer-events: none;

  button {
    background: none;
    border: none;
    color: var(--text);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      color: #C9343E;
    }
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
      });
    } else {
      gsap.to(menuRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        pointerEvents: "none",
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
      <Burger onClick={() => setOpen(!open)}>☰</Burger>

      <MobileMenu ref={menuRef}>
        {sections.map((item) => (
          <button key={item.id} onClick={() => scrollTo(item.id)}>
            {item.label}
          </button>
        ))}
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

    </HeaderWrap>
  );
};

export default Header;
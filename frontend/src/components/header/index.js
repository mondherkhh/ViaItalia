import { useEffect, useRef, useState, useMemo } from "react";
import styled from "styled-components";
import { gsap } from "gsap";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import logo from "../../assets/logo.svg";
import LanguageSelector from "../LanguageSelector";

/* ── Container ── */
const HeaderWrap = styled.header`
  position: fixed;
  top: 4rem;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 4rem);
  max-width: 1200px;
  z-index: 999;

  background: #14141a;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 30px;

  padding: 0.8rem 1.6rem;

  display: flex;
  align-items: center;
  justify-content: space-between;

  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255,255,255,0.1);

  transition: all 0.3s ease;

  &.scrolled {
    top: 1rem;
    background: rgba(20, 20, 26, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255,255,255,0.15) inset;
  }

  @media (max-width: 768px) {
    width: calc(100% - 2rem);
    top: 1.2rem;
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
  width: 70px;
  height: 70px;
  object-fit: contain;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
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
  gap: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.button`
  background: none;
  border: none;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  white-space: nowrap;

  color: ${({ $active }) =>
    $active ? "#ffffff" : "rgba(255,255,255,0.25)"};

  &:hover {
    color: #fff;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -6px;
    left: 0;
    height: 2px;
    width: ${({ $active }) => ($active ? "100%" : "0%")};
    background: linear-gradient(90deg, #00c864, #ef4444);
    transition: width 0.3s ease;
  }
`;

/* ── Left Button ── */
const LoginBtn = styled.button`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.15);
  color: white;
  padding: 0.5rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(0,200,100,0.1);
    border-color: rgba(0,200,100,0.4);
    transform: translateY(-2px);
  }
`;

/* ── Right Section ── */
const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

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

  background: #14141a;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 14px;
  padding: 2rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;

  opacity: 0.5;
  pointer-events: none;

  button {
    background: none;
    border: none;
    color: rgba(255,255,255,0.8);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      color: #fff;
    }
  }
`;

const Header = () => {
  const { language } = useLanguage();
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
        <LanguageSelector />
        <LoginBtn onClick={() => (window.location.href = "/login")}>
          {t.login}
        </LoginBtn>
      </MobileMenu>

    </HeaderWrap>
  );
};

export default Header;
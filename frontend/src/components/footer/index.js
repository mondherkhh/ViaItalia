import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import Instagram from "../../assets/instagram-square-brands.svg";
import Facebook from "../../assets/facebook-square-brands.svg";
import Mail from "../../assets/envelope-open-solid.svg";
import Mobile from "../../assets/mobile.svg";
import ScrollToTop from "../scrollTotop";

gsap.registerPlugin(ScrollTrigger);

const FOOTER = styled.footer`
  background:
    radial-gradient(circle at 15% 50%, rgba(0, 255, 150, 0.06), transparent 40%),
    radial-gradient(circle at 85% 50%, rgba(255, 80, 80, 0.06), transparent 40%),
    linear-gradient(170deg, #080f0a 0%, #0d0d0d 50%, #100808 100%);
  padding: 5rem 0 0 0;
  position: relative;
  overflow: hidden;
`;

const TopLine = styled.div`
  width: 90%;
  max-width: 1200px;
  margin: 0 auto 4rem;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    rgba(0,200,100,0.5) 30%,
    rgba(255,80,80,0.5) 70%,
    transparent
  );
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 4rem;
  width: 90%;
  max-width: 1200px;
  margin: 0 auto 4rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const Col = styled.div``;

const Brand = styled.h2`
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #00c864, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
`;

const About = styled.p`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.5);
  line-height: 1.7;
  margin: 0 0 1.5rem;
`;

const Socials = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const SocialBtn = styled.a`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  cursor: pointer;

  img {
    width: 1rem;
    filter: invert(1);
    opacity: 0.6;
    transition: opacity 0.25s;
  }

  &:hover {
    border-color: rgba(0,200,100,0.4);
    background: rgba(0,200,100,0.08);
    transform: translateY(-3px);
    img { opacity: 1; }
  }
`;

const ColTitle = styled.h4`
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin: 0 0 1.25rem;
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const FooterLink = styled.a`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  transition: color 0.2s;

  &:hover { color: #00c864; }
`;

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  margin-bottom: 0.75rem;
  transition: color 0.2s;

  img {
    width: 1rem;
    filter: invert(1);
    opacity: 0.5;
  }

  &:hover { color: rgba(255,255,255,0.9); }
`;

const BottomBar = styled.div`
  border-top: 1px solid rgba(255,255,255,0.07);
  padding: 1.75rem 0;

  > div {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    @media (max-width: 600px) {
      flex-direction: column;
      text-align: center;
    }
  }
`;

const Copy = styled.p`
  font-size: 0.8rem;
  color: rgba(255,255,255,0.25);
  margin: 0;
`;

const BottomLinks = styled.div`
  display: flex;
  gap: 1.5rem;

  a {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.25);
    text-decoration: none;
    transition: color 0.2s;
    &:hover { color: rgba(255,255,255,0.6); }
  }
`;

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language].footer;

  const footerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      footerRef.current.querySelectorAll('.anim'),
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 80%",
        }
      }
    );
  }, []);

  return (
    <>
      <FOOTER ref={footerRef}>
        <TopLine />

        <Grid>
          {/* Brand col */}
          <Col className="anim">
            <Brand>{t.brand}</Brand>
            <About>{t.description}</About>
            <Socials>
              <SocialBtn href="https://www.facebook.com/share/18gE6aiDxC/" target="_blank">
                <img src={Facebook} alt="Facebook" />
              </SocialBtn>
              <SocialBtn href="https://www.instagram.com/via_italiaconsulting" target="_blank">
                <img src={Instagram} alt="Instagram" />
              </SocialBtn>
            </Socials>
          </Col>

          {/* Links col */}
          <Col className="anim">
            <ColTitle>{t.navigation}</ColTitle>
            <LinkList>
              <FooterLink href={`#${t.home.toLowerCase().replace(/\s+/g, '-')}`}>{t.home}</FooterLink>
              <FooterLink href={`#${t.aboutUs.toLowerCase().replace(/\s+/g, '-')}`}>{t.aboutUs}</FooterLink>
              <FooterLink href={`#${t.services.toLowerCase().replace(/\s+/g, '-')}`}>{t.services}</FooterLink>
            </LinkList>
          </Col>

          {/* Contact col */}
          <Col className="anim">
            <ColTitle>{t.contact}</ColTitle>
            <ContactItem href={`tel:${t.phone.replace(/\s/g, '')}`}>
              <img src={Mobile} alt="" />
              {t.phone}
            </ContactItem>

            <ContactItem href={`mailto:${t.email}`}>
              <img src={Mail} alt="" />
              {t.email}
            </ContactItem>

          </Col>
        </Grid>

        <BottomBar>
          <div>
            <Copy>{t.copyright}</Copy>
            <BottomLinks>
              <a href="#privacy">{t.privacy}</a>
              <a href="#terms">{t.terms}</a>
              <a href="#cookies">{t.cookies}</a>
            </BottomLinks>
          </div>
        </BottomBar>
      </FOOTER>
      <ScrollToTop />
    </>
  );
};

export default Footer;
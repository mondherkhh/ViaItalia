import React, { useRef, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import Facebook from "../../assets/facebook-square-brands.svg";
import Instagram from "../../assets/instagram-square-brands.svg";
import TikTok from "../../assets/tik-tok.svg";
import WhatsApp from "../../assets/whatsapp-svgrepo-com.svg";
import emailjs from '@emailjs/browser';

gsap.registerPlugin(ScrollTrigger);

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
`;

const shimmer = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

/* ── Section ── */
const ContactSection = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 5%;          /* ← was 6rem, reduced */
  position: relative;
  overflow: hidden;


  `;





// 1. Add this styled component
const Toast = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #00c864, #009944);
  color: #fff;
  padding: 1rem 1.5rem;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 8px 32px rgba(0,200,100,0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: ${float} 0.4s ease;
  max-width: 360px;
  line-height: 1.5;
`;


/* ── Header ── */
const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;     /* ← was 4rem */
  opacity: 0;
`;

const Eyebrow = styled.span`
  display: inline-block;
  font-size: 0.72rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #00c864;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: #fff;
  margin: 1rem 0;

  span {
    background: linear-gradient(90deg, #00c864, #ef4444);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmer} 4s linear infinite;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: rgba(255,255,255,0.45);
  margin: 0;
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.6;
`;

/* ── Layout ── */
const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 5rem;
  width: 100%;
  max-width: 1100px;
  align-items: stretch;      /* ← was center, now stretch so both cols same height */

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

/* ── Left: social circles ── */
const SocialSide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;   /* ← add this */
  gap: 2rem;
  opacity: 0;
  height: 100%;              /* ← add this */
`;

const SocialLabel = styled.p`
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin: 0;
  text-align: center;
`;

const CirclesRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SocialCircle = styled.a`
  width: 70px;              /* ← was 110px */
  height: 70px;             /* ← was 110px */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${float} 4s ease-in-out infinite;
  animation-delay: ${p => p.delay || '0s'};

  img {
    width: 44px;             /* ← was 44px */
    height: 44px;
    filter: invert(1);
  }

  &:hover {
    transform: scale(1.1) translateY(-6px) !important;
    animation-play-state: paused;
  }

  &.facebook {
    background: #1877F2;
    box-shadow:
      0 12px 40px rgba(24,119,242,0.5),
      0 0 0 6px rgba(24,119,242,0.12);
    &:hover {
      box-shadow:
        0 20px 60px rgba(24,119,242,0.7),
        0 0 0 10px rgba(24,119,242,0.15);
    }
  }

  &.instagram {
    background: radial-gradient(circle at 30% 110%,
      #ffdb47 0%, #f76f3b 25%,
      #c13584 55%, #7b2fbe 100%
    );
    box-shadow:
      0 12px 40px rgba(193,53,132,0.5),
      0 0 0 6px rgba(193,53,132,0.12);
    &:hover {
      box-shadow:
        0 20px 60px rgba(193,53,132,0.7),
        0 0 0 10px rgba(193,53,132,0.15);
    }
  }

  &.tiktok {
    background: #000000;
    box-shadow:
      0 12px 40px rgba(0,0,0,0.5),
      0 0 0 6px rgba(0,0,0,0.12);
    &:hover {
      box-shadow:
        0 20px 60px rgba(0,0,0,0.7),
        0 0 0 10px rgba(0,0,0,0.15);
    }
  }

  &.whatsapp {
    background: #25D366;
    box-shadow:
      0 12px 40px rgba(37,211,102,0.5),
      0 0 0 6px rgba(37,211,102,0.12);
    &:hover {
      box-shadow:
        0 20px 60px rgba(37,211,102,0.7),
        0 0 0 10px rgba(37,211,102,0.15);
    }
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  color: rgba(255,255,255,0.2);
  font-size: 0.78rem;
  letter-spacing: 0.1em;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.08);
  }
`;
const ContactInfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

const ContactInfoItem = styled.a`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.9rem 1.1rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.25s ease;

  &:hover {
    border-color: rgba(0,200,100,0.35);
    background: rgba(0,200,100,0.06);
    transform: translateX(4px);
  }
`;

const ContactInfoIcon = styled.span`
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const ContactInfoText = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContactInfoLabel = styled.span`
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #00c864;
  font-weight: 600;
  margin-bottom: 0.15rem;
`;

const ContactInfoValue = styled.span`
  font-size: 0.88rem;
  color: rgba(255,255,255,0.8);
  font-weight: 500;
`;

/* ── Right: form ── */
const FormSide = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  opacity: 0;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const inputBase = `
  width: 100%;
  padding: 1rem 1.25rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  color: #fff;
  font-size: 0.9rem;
  font-family: inherit;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;

  &::placeholder { color: rgba(255,255,255,0.28); }

  &:focus {
    border-color: rgba(0,200,100,0.45);
    background: rgba(0,200,100,0.04);
    box-shadow: 0 0 0 3px rgba(0,200,100,0.08);
  }
`;

const Input = styled.input`${inputBase}`;

const TextArea = styled.textarea`
  ${inputBase}
  min-height: 140px;
  resize: none;
`;

const SubmitBtn = styled.button`
  padding: 1.1rem;
  background: linear-gradient(135deg, #00c864, #009944);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(0,200,100,0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 36px rgba(0,200,100,0.5);
  }

  &:active { transform: translateY(0); }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: 0 4px 24px rgba(0,200,100,0.3);
    }
    
    &:active {
      transform: none;
    }
  }
`;

/* ── Component ── */
const Contact = () => {
  const { language } = useLanguage();
  const t = translations[language].contact;

  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const socialRef = useRef(null);
  const formRef    = useRef(null);
  // 2. Add toast state at the top of your component
const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trig = {
        trigger: sectionRef.current,
        start: "top 70%",
        toggleActions: "play none none reverse",
      };

      gsap.to(headerRef.current, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: trig,
      });

      gsap.to(socialRef.current, {
        opacity: 1, x: 0, duration: 1, delay: 0.2, ease: "power3.out",
        scrollTrigger: trig,
      });

      gsap.to(formRef.current, {
        opacity: 1, x: 0, duration: 1, delay: 0.35, ease: "power3.out",
        scrollTrigger: trig,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setIsError(false);
    
    try {
      // Try EmailJS first, fallback to mailto if it fails
      const result = await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          message: formData.message,
          to_email: t.emailAddress
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );
      
      if (result.status === 200) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setIsSubmitted(false), 3000);
      } else {
        // Fallback to mailto if EmailJS fails
        const subject = encodeURIComponent(`Message de ${formData.name} - Viaitalia`);
        const body = encodeURIComponent(
          `Nom: ${formData.name}\n` +
          `Email: ${formData.email}\n` +
          `Téléphone: ${formData.phone}\n\n` +
          `Message:\n${formData.message}`
        );
        
        window.location.href = `mailto:${t.emailAddress}?subject=${subject}&body=${body}`;
        
        // Show success message for fallback
// 3. Replace the alert() line with this
setShowToast(true);
setTimeout(() => setShowToast(false), 4000);

        setIsSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setIsSubmitted(false), 3000);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      
      // Fallback handling
      const subject = encodeURIComponent(`Message de ${formData.name} - Viaitalia`);
      const body = encodeURIComponent(
        `Nom: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Téléphone: ${formData.phone}\n\n` +
        `Message:\n${formData.message}`
      );
      
      window.location.href = `mailto:${t.emailAddress}?subject=${subject}&body=${body}`;
      alert(t.toastTitle + ' ' + t.toastMessage);
      
      setIsError(true);
      setTimeout(() => setIsError(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContactSection ref={sectionRef} id="contact">

      <Header ref={headerRef}>
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <Title>{t.titleStart} <span>{t.titleHighlight}</span></Title>
        <Subtitle>{t.subtitle}</Subtitle>
      </Header>

      <Layout>

        {/* ── Social side ── */}
   <SocialSide ref={socialRef} style={{ transform: 'translateX(-40px)' }}>
  <SocialLabel>{t.followUs}</SocialLabel>

  <CirclesRow>
    <SocialCircle
      className="facebook"
      href="https://www.facebook.com/share/18gE6aiDxC/?mibextid=wwXIfr"
      target="_blank" rel="noreferrer" delay="0s"
    >
      <img src={Facebook} alt="Facebook" />
    </SocialCircle>
    <SocialCircle
      className="instagram"
      href="https://www.instagram.com/via_italiaconsulting?igsh=cW96NWZ4czBnOXZh"
      target="_blank" rel="noreferrer" delay="0.6s"
    >
      <img src={Instagram} alt="Instagram" />
    </SocialCircle>
    <SocialCircle
      className="tiktok"
      href="https://www.tiktok.com/@viaitaliaagency?_r=1&__t=ZS-964CWCWZO5A"
      target="_blank" rel="noreferrer" delay="1.2s"
    >
      <img src={TikTok} alt="TikTok" />
    </SocialCircle>
    <SocialCircle
      className="whatsapp"
      href="https://wa.me/+21622552722"
      target="_blank" rel="noreferrer" delay="1.8s"
    >
      <img src={WhatsApp} alt="WhatsApp" />
    </SocialCircle>
  </CirclesRow>

  <OrDivider>{t.orSendMessage}</OrDivider>

  {/* ── Contact info ── */}
  <ContactInfoBlock>
    <ContactInfoItem href={`tel:${t.phoneNumber.replace(/\s/g, '')}`}>
      <ContactInfoIcon>📞</ContactInfoIcon>
      <ContactInfoText>
        <ContactInfoLabel>{t.phone}</ContactInfoLabel>
        <ContactInfoValue>{t.phoneNumber}</ContactInfoValue>
      </ContactInfoText>
    </ContactInfoItem>
    <ContactInfoItem href={`mailto:${t.emailAddress}`}>
      <ContactInfoIcon>✉️</ContactInfoIcon>
      <ContactInfoText>
        <ContactInfoLabel>{t.email}</ContactInfoLabel>
        <ContactInfoValue>{t.emailAddress}</ContactInfoValue>
      </ContactInfoText>
    </ContactInfoItem>
  </ContactInfoBlock>

</SocialSide>

        {/* ── Form side ── */}
        <FormSide
          ref={formRef}
          style={{ transform: 'translateX(40px)' }}
          onSubmit={handleSubmit}
        >
          <FormRow>
            <Input
              type="text"
              name="name"
              placeholder={t.fullName}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input
              type="email"
              name="email"
              placeholder={t.email}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </FormRow>
          <Input
            type="tel"
            name="phone"
            placeholder={t.phone}
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <TextArea
            name="message"
            placeholder={t.yourMessage}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            required
          />

          <SubmitBtn
            type="submit"
            disabled={isLoading || isSubmitted}
          >
            {isLoading ? t.sending : isSubmitted ? t.sent : t.sendMessage}
          </SubmitBtn>
        </FormSide>

      </Layout>
{showToast && (
  <Toast>
    {t.toastTitle}
    {t.toastMessage}
  </Toast>
)}
      
    </ContactSection>
  );
};

export default Contact;
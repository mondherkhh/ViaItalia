import styled from "styled-components";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactComponent as SvgIcon } from "../../assets/arrow-up.svg";

export const Up = styled.div`
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 50px;
  height: 50px;
  cursor: pointer;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;

  @media screen and (max-width: 768px) {
    right: 20px;
    bottom: 20px;
    width: 45px;
    height: 45px;
  }

  &.visible {
    opacity: 1;
    visibility: visible;
  }

  &:hover {
    transform: translateY(-5px);
  }

  svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.4));
  }
`;

const ScrollToTop = () => {
  const ref = useRef(null);
  gsap.registerPlugin(ScrollTrigger);

  const scrollUp = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const element = ref.current;
    
    // Show/hide based on scroll position
    const handleScroll = () => {
      if (window.scrollY > 300) {
        element.classList.add('visible');
      } else {
        element.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Up onClick={scrollUp} ref={ref}>
      <SvgIcon />
    </Up>
  );
};

export default ScrollToTop;
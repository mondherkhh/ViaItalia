import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Scene = styled.main`
  position: relative;
  width: 100%;
  min-height: 116svh;
  background: transparent;
  overflow: hidden;
`;

const Stage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--page-background, #f1f3f2);
  z-index: 20;

  body.theme-dark & {
    background: var(--background);
  }
`;

const Image = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: opacity 0.9s ease-in-out;
  will-change: opacity;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0) 46%, rgba(255,255,255,0)),
    linear-gradient(180deg, rgba(255,255,255,0), transparent 30%, rgba(255,255,255,0));

  body.theme-dark & {
    background:
      linear-gradient(90deg, rgba(5, 13, 16, 0), rgba(10, 18, 29, 0) 46%, rgba(19, 9, 14, 0)),
      linear-gradient(180deg, rgba(5, 13, 16, 0), transparent 30%, rgba(10, 12, 22, 0));
  }
`;

const Content = styled.div`
  position: relative;
  top: 0;
  left: 0;
  display: block;
  width: 100vw;
  height: 100vh;
  z-index: 21;
  pointer-events: none;
  & > * { pointer-events: auto; }
`;

export default function FrameScrollVideo({ children }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const images = [
    "https://www.dreamstudiesabroad.com/images/articles/italycourtyard1.jpg",
    "https://static.vecteezy.com/system/resources/thumbnails/065/288/502/small/waving-italian-flag-against-dramatic-sky-over-historical-buildings-in-rome-during-early-evening-photo.jpg",
    "https://www.waitaly.net/wp-content/uploads/2016/02/cittadinanza-italiana-come-ottenerla.jpeg",
  ];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(timerRef.current);
  }, [images.length]);

  return (
    <Scene>
      <Stage aria-hidden="true">
        {images.map((src, i) => (
          <Image key={i} src={src} alt="Agence Via Italia" $show={i === current} />
        ))}
        <Overlay />
      </Stage>
      <Content data-frame-content>{children}</Content>
    </Scene>
  );
}

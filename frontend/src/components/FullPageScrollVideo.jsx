import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Scene = styled.main`
  position: relative;
  min-height: 160svh;
  background: transparent;
`;

const Stage = styled.div`
  position: ${({ $active }) => ($active ? "fixed" : "absolute")};
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #10141f;
  z-index: ${({ $active }) => ($active ? 20 : 0)};
  pointer-events: none;
`;

const Canvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transform: translateZ(0);
  will-change: contents;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(8, 12, 23, 0.78), rgba(8, 12, 23, 0.42) 46%, rgba(8, 12, 23, 0.72)),
    linear-gradient(180deg, rgba(8, 12, 23, 0.44), transparent 30%, rgba(8, 12, 23, 0.58));
`;

const Content = styled.div`
  position: ${({ $active }) => ($active ? "fixed" : "absolute")};
  top: 0;
  left: 0;
  display: ${({ $active }) => ($active ? "block" : "none")};
  width: 100vw;
  height: 100vh;
  z-index: ${({ $active }) => ($active ? 21 : 1)};
  pointer-events: none;
  transform-origin: top center;
  will-change: transform;
  & > * { pointer-events: auto; }
`;

export default function FrameScrollVideo({
  children,
  frameCount = 60,
  framePath = "/media/frames/frame-",
  extension = "jpg",
}) {
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(true);
  const sceneRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const frameRef = useRef(0);
  const requestedFrameRef = useRef(0);
  const rafRef = useRef(0);
  const progressRef = useRef(0);
  const activeRef = useRef(true);

  useEffect(() => {
    let cancelled = false;
    const images = Array.from({ length: frameCount }, (_, index) => {
      const image = new Image();
      image.decoding = "async";
      image.src = `${framePath}${String(index + 1).padStart(4, "0")}.${extension}`;
      return image;
    });
    imagesRef.current = images;

    Promise.all(
      images.map(
        (image) =>
          new Promise((resolve) => {
            image.onload = resolve;
            image.onerror = resolve;
          })
      )
    ).then(() => {
      if (!cancelled) {
        setLoaded(true);
        drawFrame(0);
      }
    });

    return () => {
      cancelled = true;
      imagesRef.current = [];
    };
  }, [frameCount, framePath, extension]);

  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    const image = imagesRef.current[index];
    if (!canvas || !image || !image.complete || !image.naturalWidth) return;

    const context = canvas.getContext("2d");
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    frameRef.current = index;
  };

  useEffect(() => {
    if (!loaded) return undefined;
    const scene = sceneRef.current;

    const render = () => {
      rafRef.current = 0;
      const nextFrame = requestedFrameRef.current;
      if (nextFrame !== frameRef.current) drawFrame(nextFrame);

      const progress = progressRef.current;
      if (canvasRef.current) {
        canvasRef.current.style.transform = `translateZ(0) scale(${(1 + progress * 0.18).toFixed(4)})`;
      }
      const content = scene?.querySelector("[data-frame-content]");
      if (content) content.style.transform = `translateZ(0) scale(${(0.55 + progress * 0.45).toFixed(4)})`;

      if (progress >= 0.999 && activeRef.current) {
        activeRef.current = false;
        setActive(false);
      }
    };

    const schedule = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(render);
    };

    const update = () => {
      const rect = scene.getBoundingClientRect();
      const travel = Math.max(1, scene.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / travel));
      progressRef.current = progress;
      requestedFrameRef.current = Math.min(frameCount - 1, Math.round(progress * (frameCount - 1)));

      const shouldBeActive = rect.top <= 0 && progress < 0.999;
      if (shouldBeActive !== activeRef.current) {
        activeRef.current = shouldBeActive;
        setActive(shouldBeActive);
      }
      schedule();
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loaded, frameCount]);

  return (
    <Scene ref={sceneRef}>
      <Stage $active={active} aria-hidden="true">
        <Canvas ref={canvasRef} />
        <Overlay />
      </Stage>
      <Content data-frame-content $active={active}>{children}</Content>
    </Scene>
  );
}

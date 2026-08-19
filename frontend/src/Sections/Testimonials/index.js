import React, { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { translations } from "../../translations";
import { useLanguage } from "../../contexts/LanguageContext";
import reviewService from "../../api/reviewService";

const marqueeLeft = keyframes`
  from { transform: translateX(-10%); }
  to { transform: translateX(-60%); }
`;

const marqueeRight = keyframes`
  from { transform: translateX(-60%); }
  to { transform: translateX(-10%); }
`;

const Section = styled.section`
  position: relative;
  overflow: hidden;
  padding: 6rem 0 7rem;
  background:
    radial-gradient(circle at 10% 10%, rgba(0, 200, 100, 0.12), transparent 28%),
    radial-gradient(circle at 90% 90%, rgba(239, 68, 68, 0.08), transparent 26%),
    #10141f;
  color: #fff;
`;

const Header = styled.div`
  position: relative;
  z-index: 2;
  max-width: 700px;
  margin: 0 auto 3rem;
  padding: 0 1.5rem;
  text-align: center;
`;

const Eyebrow = styled.span`
  display: inline-block;
  margin-bottom: 0.9rem;
  color: #00c864;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.28em;
  text-transform: uppercase;
`;

const Title = styled.h2`
  margin: 0 0 1rem;
  color: #fff;
  font-size: clamp(2rem, 5vw, 3.4rem);
  font-weight: 850;
  letter-spacing: -0.04em;
  line-height: 1.08;

  span {
    background: linear-gradient(90deg, #00c864, #7de8ab, #ef4444, #00c864);
    background-size: 250% auto;
    animation: ${marqueeLeft} 8s linear infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const Subtitle = styled.p`
  max-width: 520px;
  margin: 0 auto;
  color: #9ca3af;
  font-size: 1rem;
  line-height: 1.7;
`;

const TrackViewport = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 0.8rem 0 1.1rem;

  &::before,
  &::after {
    position: absolute;
    z-index: 1;
    top: 0;
    bottom: 0;
    width: 14vw;
    content: "";
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(90deg, #10141f, transparent);
  }

  &::after {
    right: 0;
    background: linear-gradient(270deg, #10141f, transparent);
  }

  &:hover .testimonial-track {
    animation-play-state: paused;
  }
`;

const Track = styled.div`
  display: flex;
  width: max-content;
  animation: ${({ $reverse }) => ($reverse ? marqueeRight : marqueeLeft)} ${({ $speed }) => $speed}s linear infinite;
  will-change: transform;
`;

const Card = styled.article`
  width: min(300px, 78vw);
  min-height: 146px;
  margin: 0 0.75rem;
  padding: 1rem 1.15rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  background: rgba(17, 27, 42, 0.72);
  box-shadow: none;
  transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(0, 200, 100, 0.5);
    background: rgba(17, 27, 42, 0.9);
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.65rem;
  margin-bottom: 0.8rem;
`;

const Author = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 0.65rem;
`;

const Avatar = styled.div`
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid rgba(0, 200, 100, 0.5);
  border-radius: 50%;
  background: rgba(0, 200, 100, 0.16);
  color: #fff;
  font-weight: 800;
`;

const AuthorText = styled.div`
  min-width: 0;
`;

const Name = styled.div`
  overflow: hidden;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Role = styled.div`
  margin-top: 0.2rem;
  color: #8fa0b4;
  font-size: 0.72rem;
`;

const Stars = styled.div`
  flex: 0 0 auto;
  color: #ffd166;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
`;

const Quote = styled.p`
  margin: 0;
  color: #d8e0ea;
  font-size: 0.84rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

`;

const EmptyState = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  color: #9ca3af;
  text-align: center;
`;

const Testimonials = () => {
  const { language } = useLanguage();
  const t = translations[language].testimonials;
  const [approvedReviews, setApprovedReviews] = useState([]);

  useEffect(() => {
    let active = true;

    reviewService
      .listApproved(50)
      .then((response) => {
        if (active) setApprovedReviews(response.data?.data || []);
      })
      .catch(() => {
        if (active) setApprovedReviews([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const items = useMemo(() => {
    if (approvedReviews.length) {
      return approvedReviews.map((review, index) => {
        const firstName = review.user?.firstName || "Client";
        const lastName = review.user?.lastName || "Via Italia";
        const name = `${firstName} ${lastName}`.trim();
        const initials = `${firstName[0] || "V"}${lastName[0] || "I"}`.toUpperCase();

        return {
          id: review.id || index,
          text: review.content,
          name,
          initials,
          rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
          username: `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`,
        };
      });
    }

    return (t.items || []).map((item, index) => ({
      id: `fallback-${index}`,
      text: item.text,
      name: item.name || "Client Via Italia",
      initials: item.avatar || "VI",
      rating: 5,
      username: `@${(item.name || "clientviaitalia").toLowerCase().replace(/[^a-z0-9]+/g, "")}`,
    }));
  }, [approvedReviews, t.items]);

  const midpoint = Math.ceil(items.length / 2);
  const firstRow = items.length > 1 ? items.slice(0, midpoint) : [...items, ...items];
  const secondRow = items.length > 1 ? items.slice(midpoint) : firstRow;

  const renderCards = (row, rowKey) =>
    Array.from({ length: 8 }, () => row)
      .flat()
      .map((review, index) => (
      <Card key={`${rowKey}-${review.id}-${index}`}>
        <TopRow>
          <Author>
            <Avatar>{review.initials}</Avatar>
            <AuthorText>
              <Name>{review.name}</Name>
              <Role>{review.username}</Role>
            </AuthorText>
          </Author>
        </TopRow>
        <Quote>{review.text}</Quote>
      </Card>
    ));

  return (
    <Section aria-label="Témoignages clients">
      <Header>
        <Eyebrow>{t.eyebrow || "Avis clients"}</Eyebrow>
        <Title>
          {t.titleStart || "Ils nous font"} <span>{t.titleHighlight || "confiance"}</span>
        </Title>
        <Subtitle>{t.subtitle || "Découvrez les expériences de nos clients."}</Subtitle>
      </Header>

      {items.length ? (
        <>
          <TrackViewport>
            <Track className="testimonial-track" $speed={50}>
              {renderCards(firstRow, "top")}
            </Track>
          </TrackViewport>
          <TrackViewport>
            <Track className="testimonial-track" $reverse $speed={50}>
              {renderCards(secondRow, "bottom")}
            </Track>
          </TrackViewport>
        </>
      ) : (
        <EmptyState>Aucun avis client disponible pour le moment.</EmptyState>
      )}
    </Section>
  );
};

export default Testimonials;

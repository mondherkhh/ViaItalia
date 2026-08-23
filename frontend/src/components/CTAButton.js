import React from 'react';
import styled from 'styled-components';

const CTAButton = styled.button`
  background: ${props => props.primary ? 'var(--green)' : 'rgba(0, 0, 0, 0.7)'};
  color: var(--white);
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  img {
    width: 1.2rem;
    margin-left: 0.6rem;
    transition: transform 0.3s ease;

    @media only Screen and (max-width: 768px) {
      width: 1rem;
      margin-left: 0.5rem;
    }
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    background: ${props => props.primary ? 'var(--green)' : 'rgba(0, 0, 0, 0.8)'};
    border: ${props => props.primary ? 'none' : '1px solid rgba(255, 255, 255, 0.3)'};

    &::before {
      left: 100%;
    }

    img {
      transform: translateX(3px);
    }
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;

    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

export default CTAButton;

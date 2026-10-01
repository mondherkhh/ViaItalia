import styled from "styled-components";

const colors = {
  blue: "var(--color-blue)",
  red: "var(--color-red)",
  orange: "var(--color-orange)",
  purple: "var(--color-purple)",
  green: "var(--color-green)",
};

export const IconCircle = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  background: ${({ $color }) => colors[$color || "green"] + "22"};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => colors[$color || "green"]};
  border: 1px solid ${({ $color }) => colors[$color || "green"] + "33"};
`;

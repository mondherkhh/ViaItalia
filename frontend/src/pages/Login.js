import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { gsap } from "gsap";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import logoSvg from "../assets/logo.svg";

/* ─────────────────────────── */
/* BACKGROUND */
/* ─────────────────────────── */
const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  background: radial-gradient(circle at top left, rgba(0,200,100,0.15), transparent 40%),
              radial-gradient(circle at bottom right, rgba(239,68,68,0.15), transparent 40%),
              #0f0f14;
`;

/* ─────────────────────────── */
/* CARD */
/* ─────────────────────────── */
const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;

  padding: 2.5rem;

  border-radius: 20px;
  background: rgba(20,20,25,0.6);
  backdrop-filter: blur(20px);

  border: 1px solid rgba(255,255,255,0.06);

  box-shadow:
    0 20px 40px rgba(0,0,0,0.4),
    inset 0 0 0 1px rgba(255,255,255,0.02);

  opacity: 0;
  transform: translateY(40px);

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

/* ─────────────────────────── */
/* LOGO */
/* ─────────────────────────── */
const Logo = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;

  img {
    height: 150px;
    width: auto;
  }

  &:hover {
    transform: scale(1.05);
  }
`;

/* ─────────────────────────── */
/* TEXT */
/* ─────────────────────────── */
const Title = styled.h1`
  text-align: center;
  font-size: 1.9rem;
  font-weight: 800;
  margin-bottom: 0.5rem;

  background: linear-gradient(90deg, #00c864, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255,255,255,0.5);
  font-size: 0.95rem;
  margin-bottom: 2rem;
`;

/* ─────────────────────────── */
/* FORM */
/* ─────────────────────────── */
const FormGroup = styled.div`
  margin-bottom: 1.3rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 0.4rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;

  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);

  background: rgba(20,20,25,0.8);
  color: white;

  transition: 0.25s;

  &:focus {
    outline: none;
    border-color: #00c864;
    box-shadow: 0 0 12px rgba(0,200,100,0.3);
  }
`;

/* ─────────────────────────── */
/* BUTTON */
/* ─────────────────────────── */
const Button = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 0.9rem;

  border-radius: 12px;
  border: none;

  background: linear-gradient(90deg, #00c864, #00a653);
  color: white;
  font-weight: 600;

  cursor: pointer;
  transition: 0.25s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,200,100,0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/* ─────────────────────────── */
/* ERROR */
/* ─────────────────────────── */
const Error = styled.div`
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.2);
  color: #ff6b6b;

  padding: 0.8rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  text-align: center;
`;

/* ─────────────────────────── */
/* SWITCH */
/* ─────────────────────────── */
const Switch = styled.p`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.6);

  span {
    color: #00c864;
    cursor: pointer;
    font-weight: 600;
  }
`;

/* ─────────────────────────── */
/* COMPONENT */
/* ─────────────────────────── */
const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const cardRef = useRef();

  const handleLogoClick = () => {
    navigate("/");
  };

  useEffect(() => {
    gsap.to(cardRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/auth/login", form);

      loginUser(res.data.token, res.data.role, res.data.user);

      if (res.data.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <LoginContainer>
      <LoginCard ref={cardRef}>
        <Logo onClick={handleLogoClick}>
          <img src={logoSvg} alt="logo" />
        </Logo>

        <Title>Welcome Back</Title>
        <Subtitle>Login to continue your journey</Subtitle>

        {error && <Error>{error}</Error>}

        <form onSubmit={submit}>
          <FormGroup>
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Password</Label>
            <Input
              name="password"
              type="password"
              onChange={handleChange}
              required
            />
          </FormGroup>

          <Button disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Switch>
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>
            Sign up
          </span>
        </Switch>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
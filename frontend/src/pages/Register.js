import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import logoSvg from "../assets/logo.svg";

gsap.registerPlugin();

/* ───────── CONTAINER ───────── */
const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #006400, #8B0000);
`;

/* ───────── CARD ───────── */
const RegisterCard = styled.div`
  background: rgba(28, 28, 35, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);

  opacity: 0;
  transform: translateY(40px) scale(0.95);

  @media (max-width: 768px) {
    padding: 2rem;
    margin: 1rem;
  }
`;

/* ───────── LOGO ───────── */
const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.8rem;

  img {
    height: 55px;
    transition: 0.3s;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

/* ───────── TEXT ───────── */
const Title = styled.h1`
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.3rem;

  background: linear-gradient(90deg, var(--green), var(--red));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255,255,255,0.6);
  margin-bottom: 2rem;
`;

/* ───────── FORM ───────── */
const FormGroup = styled.div`
  margin-bottom: 1.3rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: rgba(255,255,255,0.8);
  margin-bottom: 0.4rem;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(20,20,25,0.9);
  color: white;

  &:focus {
    outline: none;
    border-color: var(--green);
    box-shadow: 0 0 12px rgba(0,255,51,0.3);
  }
`;

/* ───────── BUTTON ───────── */
const SubmitButton = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;

  background: linear-gradient(135deg, var(--green), rgba(0,255,51,0.8));
  border: none;
  color: white;

  transition: 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0,255,51,0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* ───────── MESSAGE ───────── */
const Message = styled.div`
  margin-bottom: 1rem;
  padding: 0.8rem;
  border-radius: 10px;
  text-align: center;

  background: rgba(239,68,68,0.1);
  color: #ff6b6b;
`;

/* ───────── FOOTER ───────── */
const SwitchText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: rgba(255,255,255,0.6);

  span {
    color: var(--green);
    cursor: pointer;
    font-weight: 600;
  }
`;

/* ───────── COMPONENT ───────── */
const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    passport: "",
    address: "",
    phoneNumber: ""
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardRef = useRef(null);

  /* ───────── ANIMATION ───────── */
  useEffect(() => {
    gsap.to(cardRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1,
      ease: "power3.out"
    });
  }, []);

  /* ───────── HANDLERS ───────── */
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      await axiosInstance.post("/auth/register", {
        ...formData,
        role: "USER"
      });

      // smooth success animation
      gsap.to(cardRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.5
      });

      setTimeout(() => {
        navigate("/login");
      }, 500);

    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard ref={cardRef}>
        <LogoContainer>
          <img src={logoSvg} alt="logo" />
        </LogoContainer>

        <Title>Create Account</Title>
        <Subtitle>Start your journey to Italy 🇮🇹</Subtitle>

        {message && <Message>{message}</Message>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>First Name</Label>
            <Input name="firstName" onChange={handleChange} required />
          </FormGroup>

          <FormGroup>
            <Label>Last Name</Label>
            <Input name="lastName" onChange={handleChange} required />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input type="email" name="email" onChange={handleChange} required />
          </FormGroup>

          <FormGroup>
            <Label>Password</Label>
            <Input type="password" name="password" onChange={handleChange} required />
          </FormGroup>

          <FormGroup>
            <Label>Confirm Password</Label>
            <Input type="password" name="confirmPassword" onChange={handleChange} required />
          </FormGroup>

          <FormGroup>
            <Label>Passport</Label>
            <Input name="passport" onChange={handleChange} required />
          </FormGroup>

          <FormGroup>
            <Label>Address</Label>
            <Input name="address" onChange={handleChange} required />
          </FormGroup>

          <FormGroup>
            <Label>Phone</Label>
            <Input name="phoneNumber" onChange={handleChange} required />
          </FormGroup>

          <SubmitButton disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Register"}
          </SubmitButton>
        </form>

        <SwitchText>
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </SwitchText>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
import React, { useState, useEffect, useRef } from 'react';
import { Rive, Layout } from '@rive-app/canvas';
import './Login.css';
import login from '../Model/teddy_login.riv';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [animationState, setAnimationState] = useState('idle');
  const canvasRef = useRef(null);
  const riveRef = useRef(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  const handleLogin = (e) => {
    e.preventDefault();
    if (emailRegex.test(email.trim()) && passwordRegex.test(password)) {
      setAnimationState('success');
    } else {
      setAnimationState('fail');
    }

    // Reset animation state after a short delay
    setTimeout(() => setAnimationState('idle'), 2000); // Adjust the delay as needed
  };

  useEffect(() => {
    const loadRiveAnimation = async () => {
      if (canvasRef.current) {
        try {
          const rive = new Rive({
            src: login,
            canvas: canvasRef.current,
            layout: new Layout({
              fit: 'contain',
            }),
            autoplay: true,
            stateMachines: ['Login Machine'],
          });

          riveRef.current = rive;

          rive.on('load', () => {
            console.log('Rive animation loaded');

            const inputs = rive.stateMachineInputs('Login Machine');
            if (!inputs) {
              console.error('No inputs found in state machine.');
              return;
            }

            const isCheckingInput = inputs.find(input => input.name === 'isChecking');
            const isHandsUpInput = inputs.find(input => input.name === 'isHandsUp');
            const numLookInput = inputs.find(input => input.name === 'numLook');
            const trigSuccessInput = inputs.find(input => input.name === 'trigSuccess');
            const trigFailInput = inputs.find(input => input.name === 'trigFail');

            riveRef.current.inputs = {
              isCheckingInput,
              isHandsUpInput,
              numLookInput,
              trigSuccessInput,
              trigFailInput,
            };

            // Set initial idle state
            setAnimationState('idle');
            if (isCheckingInput) isCheckingInput.value = false;
            if (isHandsUpInput) isHandsUpInput.value = false;
          });

        } catch (error) {
          console.error('Error loading Rive animation:', error);
        }
      }
    };

    loadRiveAnimation();
  }, []);

  useEffect(() => {
    if (riveRef.current && riveRef.current.inputs) {
      const { isCheckingInput, isHandsUpInput, numLookInput, trigSuccessInput, trigFailInput } = riveRef.current.inputs;

      if (isCheckingInput) isCheckingInput.value = animationState === 'checking';
      if (isHandsUpInput) isHandsUpInput.value = animationState === 'isHandsUp';
      if (numLookInput) numLookInput.value = email.length;

      if (animationState === 'success' && trigSuccessInput) {
        trigSuccessInput.fire();
      } else if (animationState === 'fail' && trigFailInput) {
        trigFailInput.fire();
      } else if (animationState === 'idle') {
        if (isCheckingInput) isCheckingInput.value = false;
        if (isHandsUpInput) isHandsUpInput.value = false;
      }
    }
  }, [animationState, email]);

  return (
    <div className="login-screen">
      <div className="animation-container">
        <canvas ref={canvasRef} width="500" height="500" />
      </div>
      <div className="form-container">
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setAnimationState('checking')}
            onBlur={() => setAnimationState('idle')}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setAnimationState('isHandsUp')}
            onBlur={() => setAnimationState('idle')}
          />
        </div>
        <button className="login-button" onClick={handleLogin}>
          Login
        </button>
        <button className="signup-button">
          Not having an account? Sign up!
        </button>
      </div>
    </div>
  );
};

export default Login;

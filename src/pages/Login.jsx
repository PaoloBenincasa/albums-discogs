import React, { useState } from 'react';
import { supabase } from '../services/api';
import { useNavigate } from 'react-router';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Errore nel login:', error);
        console.error('Dettagli errore:', error.message);
      } else {
        console.log('Login effettuato');
        const user = data.user;
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userData?.user?.confirmed_at) {
          console.log('Email confermata');
          navigate('/');
        } else {
          console.error('Email non confermata');
        }
      }
    } catch (error) {
      console.error('Errore imprevisto nel login:', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
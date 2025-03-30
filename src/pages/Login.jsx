import React, { useState } from 'react';
import { supabase } from '../services/api';
import { useNavigate, Link } from 'react-router';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Errore nel login:', error);
        toast.error(error.message);
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
    <div className='container d-flex justify-content-center align-items-center w-100'>
      <div className='d-flex flex-column align-items-center row gap-2 p-2 mt-5  loginForm '>
        <h1 className='text-center mb-1'>Login</h1>
        <p className='text-center mb-5 dirtText'>welcome back!</p>
        <label className=' dirtText' htmlFor="email">enter your email</label>
        <input className='inputW' type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className=' dirtText' htmlFor="password">enter your password</label>
        <input className='inputW' type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className='w-25 mt-4 btnOrange mx-auto' onClick={handleLogin}>Login</button>

        <p className='text-center'>don't have an account yet?                   
          <Link className="orange ms-1" to="/signup">signup</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
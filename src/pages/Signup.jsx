import React, { useState } from 'react';
import { supabase } from '../services/api';
import { useNavigate, Link } from 'react-router';
import 'bootstrap/dist/css/bootstrap.min.css';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSignup = async () => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                },
            },
        });
        if (error) {
            console.error('Errore nella registrazione:', error);
        } else {
            console.log('Registrazione effettuata');
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className='container  d-flex justify-content-center align-items-center w-100'>
            <div className='d-flex flex-column align-items-center row gap-2 mt-5 p-2 loginForm'>
                <h1 className='text-center mb-1'>Signup</h1>
                <p className='text-center mb-5 dirtText'>create an account!</p>

                <label className=' dirtText' htmlFor="email">enter your email</label>
                <input className='inputW' type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

                <label className=' dirtText' htmlFor="password">enter your password</label>
                <input className='inputW' type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

                <label className=' dirtText' htmlFor="displayName">enter your display name</label>
                <input className='inputW' type="text" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

                <button className='w-25 mt-4 btnOrange mx-auto' onClick={handleSignup}>Signup</button>

                <p className='text-center'>already have an account? <Link className="orange" to="/login">login</Link></p>

        

                <div className={`modal ${isModalOpen ? 'show' : ''}`} style={{ display: isModalOpen ? 'block' : 'none' }}>
                    <div className='modal-dialog'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Email confirmation</h5>
                                <button type='button' className='btn-close' onClick={handleCloseModal} aria-label='Close'></button>
                            </div>
                            <div className='modal-body'>
                                <p>We have sent you a confirmation email. Click on the link to verify your account.</p>
                            </div>
                            <div className='modal-footer'>
                                <button type='button' className='btn btn-secondary' onClick={handleCloseModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;


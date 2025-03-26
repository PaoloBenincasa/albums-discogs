import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';

const Account = () => {
    const { user } = useAuth();
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('username, bio')
                        .eq('id', user.id)
                        .single();

                    if (!error && data) {
                        setUsername(data.username || '');
                        setBio(data.bio || '');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        try {
            await supabase
                .from('users')
                .upsert({ id: user.id, username, bio });
            alert('Profile updated successfully!');
            navigate('/profile');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        if (window.confirm('Are you sure you want to delete your account?')) {
            try {
                await supabase.auth.signOut();
                await supabase.from('users').delete().eq('id', user.id);
                navigate('/');
            } catch (error) {
                console.error('Error deleting account:', error);
                alert('Failed to delete account.');
            }
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!user) {
        return <p>You must be logged in to view this page.</p>;
    }

    return (
        <div className='container d-flex justify-content-center align-items-center w-100'>
            <div className='d-flex flex-column align-items-center row gap-2 p-2 mt-5 loginForm'>
                <h1 className='text-center mb-1'>your account</h1>
                <p className='text-center mb-5 dirtText'>manage your profile</p>

                <label className='dirtText' htmlFor="username">username</label>
                <input className='inputW' type="text" placeholder="" value={username} onChange={(e) => setUsername(e.target.value)} />

                <label className='dirtText' htmlFor="bio">bio</label>
                <textarea cols="30" rows="6" className='inputW' placeholder="tell us about yourself" value={bio} onChange={(e) => setBio(e.target.value)} />

                <button className='w-50 mt-4 btnOrange mx-auto' onClick={handleUpdateProfile}>Update Profile</button>
                <div className='w-50 text-center mt-2 btnDelete mx-auto' onClick={handleDeleteAccount}>Delete Account</div>
            </div>
        </div>
    );
};

export default Account;
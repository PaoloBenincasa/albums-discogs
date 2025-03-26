import React, { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
    const { user } = useAuth();

    return (
        <>
            <div>
                <header className='container-fluid d-flex flex-column align-items-center'>
                    <div className='hero'>
                        <h1>myAlbums</h1>
                        <h4 className='p-3'>
                            rate your favorite records <br />

                            write a review <br />

                            enjoy the music
                        </h4>
                        {user ? ( 
                            <Link to={`/profile`} className="orange">
                                my albums
                            </Link>
                        ) : (
                            <Link to="/signup" className="orange">
                                start now!
                            </Link>
                        )}
                    </div>
                </header>
            </div>

        </>
    );
};

export default Home;
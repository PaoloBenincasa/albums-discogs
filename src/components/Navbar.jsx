import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [username, setUsername] = useState('');



  useEffect(() => {
    if (user) {
      const fetchUsername = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('username') // Modifica qui: recupera 'username'
          .eq('id', user.id)
          .single();

        if (data) {
          setUsername(data.username || ''); // Modifica qui: usa data.username
        } else if (error) {
          console.error('Errore nel recupero dello username:', error);
        }
      };

      fetchUsername();
    } else {
      setUsername('');
    }
  }, [user]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Errore nel logout:', error);
    } else {
      console.log('Logout effettuato');
      navigate('/');
    }
  };

  if (loading) {
    return <div>Caricamento...</div>;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light container-fluid">
      <div className="collapse navbar-collapse d-flex justify-content-around align-items-center">
        <Link className="navbar-brand" to="/">
          <div className='d-flex orange'>
            <i className="bi bi-boombox-fill pe-1 "></i>
            <div >
              myAlbums
            </div>
          </div>
        </Link>
        <ul className="navbar-nav ml-auto">
          <li className="nav-item dropdown">
            <button
              className="nav-link dropdown-toggle btn btn-link"
              id="accountDropdown"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {user ? username : 'account'} {/* Modifica qui: usa la variabile 'username' */}
            </button>
            <div className="dropdown-menu " aria-labelledby="accountDropdown">
              {user ? (
                <>
                  <Link className="dropdown-item" to="/profile">my albums</Link>
                  <Link className="dropdown-item" to={`/user/${user.id}/reviews`}>my reviews</Link>
                  <Link className="dropdown-item" to="/account">edit profile</Link>
                  <button className="dropdown-item" onClick={handleLogout}>logout</button>
                </>
              ) : (
                <>
                  <Link className="dropdown-item" to="/login">login</Link>
                  <Link className="dropdown-item" to="/signup">signup</Link>
                </>
              )}
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
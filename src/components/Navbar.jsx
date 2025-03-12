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
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (data) {
          setUsername(data.display_name || '');
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
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">myAlbums</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item dropdown">
            <button
              className="nav-link dropdown-toggle btn btn-link"
              id="accountDropdown"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {user ? user.user_metadata.display_name : 'Account'}
            </button>
            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="accountDropdown">
              {user ? (
                <>
                  <Link className="dropdown-item" to="/profile">Profilo</Link>
                  <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link className="dropdown-item" to="/login">Login</Link>
                  <Link className="dropdown-item" to="/signup">Signup</Link>
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
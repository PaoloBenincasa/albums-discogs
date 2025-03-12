import Navbar from './Navbar';
import { Outlet } from 'react-router';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default Layout;
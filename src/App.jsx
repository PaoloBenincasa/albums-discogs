import React from 'react';
import { RouterProvider } from 'react-router'; 
import router from './routes/Routes';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <div className="vh-100">
      <RouterProvider router={router} />
      <ToastContainer position='bottom-right' />

    </div>
  );
}

function Root() {
  return (
    <div>
      <App />
    </div>
  );
}

export default Root;
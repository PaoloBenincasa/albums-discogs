import React from 'react';
import { RouterProvider } from 'react-router'; 
import router from './routes/Routes';

function App() {
  return (
    <div className="vh-100">
      <RouterProvider router={router} />
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
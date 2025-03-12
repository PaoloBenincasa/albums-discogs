import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Root from './App.jsx'; // Importa Root invece di App
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

createRoot(document.getElementById('root')).render(
  <Root /> // Renderizza Root
);

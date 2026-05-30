// // src/main.jsx
// // Entry point for the React application
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css' // Import global styles
// import App from './App.jsx' // Import main App component
// import Home from './Home.jsx';
// import ResumeAnalyzer from './ResumeAnalyzer.jsx';
// import MinimalResumeAnalyzer from './MinimalResumeAnalyzer.jsx';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// // Mount the App component to the root DOM node
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <Router>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/interview" element={<App />} />
//         <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
//         <Route path="/resume-analyzer-minimal" element={<MinimalResumeAnalyzer />} />
//       </Routes>
//     </Router>
//   </StrictMode>,
// )
// src/main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ClerkProvider>
  </StrictMode>
);

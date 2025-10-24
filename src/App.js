import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContextApi';
// import AuthForm from './pages/AuthForm'; // <-- Place your AuthForm here
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import RequireAuth from './components/RequireAuth';
import AuthForm from './pages/Login';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthForm/>} />
          {/* Protected routes */}
          <Route element={<RequireAuth />}>
            <Route path="/home" element={<Home />} />
          </Route>
          <Route path="/not-found" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;

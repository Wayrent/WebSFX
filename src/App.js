import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/global.css';
import './styles/header.css';
import './styles/footer.css';
import './styles/soundItem.css';

const App = () => {
  return (
    <Router>
      <div className="container">
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
        <footer className="footer">
          &copy; {new Date().getFullYear()} SoundLibrary. Все права защищены.
        </footer>
      </div>
    </Router>
  );
};

export default App;

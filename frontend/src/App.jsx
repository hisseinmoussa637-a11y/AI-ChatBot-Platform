import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatBoard from './pages/ChatBoard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('token')));

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem('token')));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/chat"
          element={isAuthenticated ? <ChatBoard /> : <Navigate to="/login" replace />}
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? '/chat' : '/login'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function ChatBoard() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchMessages();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages');
      setMessages(res.data.reverse());
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    try {
      const res = await api.post('/messages/send', { userMessage: input });
      setMessages((prev) => [...prev, res.data.data]);
      setInput('');
    } catch (error) {
      alert(error.response?.data?.message || 'Send failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h2>🤖 AI ChatBot</h2>
        <div className="header-actions">
          <span>Hi {user?.name || 'User'}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="messages-box">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h3>Start a conversation</h3>
            <p>Send a message to the AI assistant.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={msg._id || index} className="message-row">
              <div className="message user-message">
                <span>You</span>
                <p>{msg.userMessage}</p>
              </div>
              <div className="message bot-message">
                <span>AI</span>
                <p>{msg.aiResponse}</p>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ChatBoard;

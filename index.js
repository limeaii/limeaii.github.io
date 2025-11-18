
const { useState, useEffect, createContext, useContext, useRef } = React;

// --- Authentication Hook ---

const AuthContext = createContext(undefined);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserRaw = localStorage.getItem('cemil-ai-user');
    if (storedUserRaw) {
      try {
        const parsed = JSON.parse(storedUserRaw);
        if (parsed && parsed.username) {
          setUser(parsed);
        } else {
          localStorage.removeItem('cemil-ai-user');
        }
      } catch (e) {
        localStorage.removeItem('cemil-ai-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username, pass) => {
    const storedCreds = localStorage.getItem(`cemil_user_${username}`);
    if (storedCreds) {
      const creds = JSON.parse(storedCreds);
      if (creds.password === pass) {
        const loggedInUser = { username };
        setUser(loggedInUser);
        localStorage.setItem('cemil-ai-user', JSON.stringify(loggedInUser));
        return true;
      }
    }
    return false;
  };

  const signup = (username, pass) => {
    if (localStorage.getItem(`cemil_user_${username}`)) {
      return false; // User already exists
    }
    const newUserCreds = { password: pass };
    localStorage.setItem(`cemil_user_${username}`, JSON.stringify(newUserCreds));
    const newUser = { username };
    setUser(newUser);
    localStorage.setItem('cemil-ai-user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cemil-ai-user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Components ---

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signup } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const success = login(username, password);
      if (!success) {
        setError('Invalid username or password.');
      }
    } else {
      const success = signup(username, password);
      if (!success) {
        setError('An account with this username already exists.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl border border-gray-100">
        <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-black">
              Cemil.ai
            </h1>
          <p className="mt-2 text-gray-500">{isLogin ? 'Welcome back' : 'Create your account'}</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="block w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="Enter your username"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
             <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          <button type="submit" className="w-full py-3 font-bold text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "New to Cemil.ai?" : 'Already a member?'}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-2 font-semibold text-black hover:underline">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const QAPanel = () => {
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello. How can I help you?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    try {
      // Access generateAnswer from the global service object
      const response = await window.geminiService.generateAnswer(input, history);
      const modelMessage = { role: 'model', content: response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'model', content: "Connection error. Please check your network." }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-2xl px-6 py-4 rounded-2xl text-base leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-black text-white rounded-br-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="px-6 py-4 rounded-2xl bg-white border border-gray-200 rounded-bl-none">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-4 pt-4">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            className="w-full pl-6 pr-16 py-4 text-lg bg-white text-gray-900 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black focus:ring-0 resize-none shadow-sm transition-all placeholder-gray-400"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">Cemil.ai can make mistakes. Check important info.</p>
      </div>
    </div>
  );
};

const MainApp = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-extrabold tracking-tight text-black">
            Cemil.ai
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-gray-600">{user?.username}</span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-semibold text-black bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-5xl mx-auto">
          <QAPanel />
        </div>
      </main>
    </div>
  );
};

const App = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans antialiased selection:bg-black selection:text-white">
      {user ? <MainApp /> : <AuthPage />}
    </div>
  );
};

// --- Mounting Logic ---
console.log("Attempting to mount React app...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

const { useState, useEffect, createContext, useContext, useRef } = React;

// --- Authentication Hook ---

const AuthContext = createContext(undefined);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserRaw = localStorage.getItem('gemini-creative-suite-user');
    if (storedUserRaw) {
      try {
        const parsed = JSON.parse(storedUserRaw);
        if (parsed && parsed.username) {
          setUser(parsed);
        } else {
          localStorage.removeItem('gemini-creative-suite-user');
        }
      } catch (e) {
        localStorage.removeItem('gemini-creative-suite-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username, pass) => {
    const storedCreds = localStorage.getItem(`user_${username}`);
    if (storedCreds) {
      const creds = JSON.parse(storedCreds);
      if (creds.password === pass) {
        const loggedInUser = { username };
        setUser(loggedInUser);
        localStorage.setItem('gemini-creative-suite-user', JSON.stringify(loggedInUser));
        return true;
      }
    }
    return false;
  };

  const signup = (username, pass) => {
    if (localStorage.getItem(`user_${username}`)) {
      return false; // User already exists
    }
    const newUserCreds = { password: pass };
    localStorage.setItem(`user_${username}`, JSON.stringify(newUserCreds));
    const newUser = { username };
    setUser(newUser);
    localStorage.setItem('gemini-creative-suite-user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gemini-creative-suite-user');
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
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-lg shadow-lg">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
              Gemini Creative Suite
            </h1>
          <p className="mt-2 text-slate-400">{isLogin ? 'Sign in to continue' : 'Create an account to get started'}</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="block w-full px-4 py-3 text-lg text-white bg-slate-700 border border-slate-600 rounded-md peer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder=" "
            />
            <label htmlFor="username" className="absolute text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-slate-800 px-2 peer-focus:px-2 peer-focus:text-sky-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2">
              Username
            </label>
          </div>
          <div className="relative">
             <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-4 py-3 text-lg text-white bg-slate-700 border border-slate-600 rounded-md peer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder=" "
            />
            <label htmlFor="password" className="absolute text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-slate-800 px-2 peer-focus:px-2 peer-focus:text-sky-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2">
              Password
            </label>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" className="w-full py-3 font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm text-center text-slate-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-2 font-medium text-sky-400 hover:underline">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

const QAPanel = () => {
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! How can I help you today?" }
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
      if (window.geminiService && window.geminiService.generateAnswer) {
        const response = await window.geminiService.generateAnswer(input, history);
        const modelMessage = { role: 'model', content: response };
        setMessages((prev) => [...prev, modelMessage]);
      } else {
        setMessages((prev) => [...prev, { role: 'model', content: "Error: Service not ready. Please refresh." }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'model', content: "An error occurred." }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto pr-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="max-w-lg px-4 py-3 rounded-2xl bg-slate-700 text-slate-200">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything..."
            className="w-full pl-4 pr-16 py-3 text-lg bg-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-sky-600 text-white hover:bg-sky-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const ImageGenPanel = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
        if (window.geminiService && window.geminiService.generateImage) {
            const result = await window.geminiService.generateImage(prompt);
            if (result) {
                setImageUrl(result);
            } else {
                setError('Failed to generate image. Please try a different prompt.');
            }
        } else {
             setError('Error: AI Service not ready.');
        }
    } catch(e) {
        setError('An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-2">AI Image Generation</h2>
      <p className="text-slate-400 mb-6">Describe the image you want to create.</p>
      
      <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A majestic lion wearing a crown in a futuristic city"
          className="flex-grow w-full px-4 py-3 text-lg bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="px-6 py-3 font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <div className="mt-8">
        {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-lg aspect-square w-full max-w-lg mx-auto border-2 border-dashed border-slate-600">
                <div className="w-16 h-16 border-4 border-sky-500 border-dashed rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-300">Conjuring your masterpiece...</p>
            </div>
        )}
        {error && <p className="text-red-400">{error}</p>}
        {imageUrl && !isLoading && (
          <div className="group relative w-full max-w-lg mx-auto">
            <img
              src={imageUrl}
              alt={prompt}
              className="rounded-lg shadow-2xl w-full h-full object-cover"
            />
            <a 
              href={imageUrl} 
              download={`gemini-art-${Date.now()}.png`}
              className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Download Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>
        )}
         {!imageUrl && !isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-lg aspect-square w-full max-w-lg mx-auto border-2 border-dashed border-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 text-slate-400">Your generated image will appear here</p>
            </div>
        )}
      </div>
    </div>
  );
};

const MainApp = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('qa');

  const TabButton = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-sky-600 text-white'
          : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
            Gemini Creative Suite
          </h1>
          <nav className="flex items-center gap-2">
            <TabButton
              tabName="qa"
              label="Q&A"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7s-8-3.134-8-7c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.293 5.293a1 1 0 01-1.414 0L10 10.414l-2.293 2.293a1 1 0 01-1.414-1.414l2.293-2.293-2.293-2.293a1 1 0 011.414-1.414L10 7.586l2.293-2.293a1 1 0 011.414 1.414L11.414 9l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>}
            />
            <TabButton
              tabName="image"
              label="Image Generation"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>}
            />
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{user?.username}</span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {activeTab === 'qa' && <QAPanel />}
        {activeTab === 'image' && <ImageGenPanel />}
      </main>
    </div>
  );
};

const App = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-slate-900 text-white min-h-screen font-sans flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
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
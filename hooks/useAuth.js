// No imports needed - React is global
const { createContext, useState, useContext, useEffect } = React;

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
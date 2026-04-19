import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'donor' | 'ngo' | 'volunteer' | 'institution';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    displayName: string,
    role: 'admin' | 'donor' | 'ngo' | 'volunteer' | 'institution'
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getAuthErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: unknown } }).response;
    const data = response?.data as { message?: string; errors?: Array<{ msg?: string }> } | undefined;

    if (data?.message) {
      return data.message;
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0 && data.errors[0]?.msg) {
      return data.errors[0].msg ?? fallback;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const signup = async (
    email: string,
    password: string,
    displayName: string,
    role: 'admin' | 'donor' | 'ngo' | 'volunteer' | 'institution'
  ) => {
    try {
      setError(null);
      const response = await authAPI.signup({ name: displayName, email, password, role });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err, 'Signup failed');
      setError(errorMessage);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err, 'Login failed');
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err, 'Logout failed');
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

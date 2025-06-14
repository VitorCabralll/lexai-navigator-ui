
import { useState, useEffect, createContext, useContext } from 'react';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>({ email: 'teste@exemplo.com', uid: 'test-user' });
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    // Simular login
    setUser({ email, uid: 'test-user' });
  };

  const signUp = async (email: string, password: string) => {
    // Simular registro
    setUser({ email, uid: 'test-user' });
  };

  const logout = async () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

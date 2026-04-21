import * as React from 'react';
import { Member } from '../types';

interface AuthContextType {
  user: Member | null;
  loading: boolean;
  login: (user: Member) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<Member | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refreshUser = React.useCallback(() => {
    const savedUser = localStorage.getItem('pmii_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Normalize role property casing
        if (!parsed.role) {
          if (parsed.Role) parsed.role = parsed.Role;
          else if (parsed.ROLE) parsed.role = parsed.ROLE;
        }
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('pmii_user');
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = (newUser: Member) => {
    // Normalize role property casing if it comes from Spreadsheet headers
    const rawUser = newUser as any;
    if (!newUser.role) {
      if (rawUser.Role) newUser.role = rawUser.Role;
      else if (rawUser.ROLE) newUser.role = rawUser.ROLE;
    }
    
    localStorage.setItem('pmii_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('pmii_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  getUsers,
  getCurrentUser,
  saveCurrentUser,
  findUserByEmail,
  createUser,
  updateUserById,
  generateId,
} from '../services/storage';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await getCurrentUser();
        if (stored) {
          // Re-validate user still exists in users list
          const users = await getUsers();
          const still = users.find((u) => u.id === stored.id);
          if (still) {
            setUser(still);
          } else {
            await saveCurrentUser(null);
          }
        }
      } catch (e) {
        console.error('Error restoring session:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const found = await findUserByEmail(email.trim());
        if (!found) {
          return { success: false, error: 'No existe una cuenta con ese correo electrónico.' };
        }
        if (found.password !== password) {
          return { success: false, error: 'Contraseña incorrecta.' };
        }
        await saveCurrentUser(found);
        setUser(found);
        return { success: true };
      } catch (e) {
        return { success: false, error: 'Error al iniciar sesión. Intenta de nuevo.' };
      }
    },
    []
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const trimmedEmail = email.trim().toLowerCase();
        const existing = await findUserByEmail(trimmedEmail);
        if (existing) {
          return { success: false, error: 'Ya existe una cuenta con ese correo electrónico.' };
        }
        const newUser: User = {
          id: generateId(),
          name: name.trim(),
          email: trimmedEmail,
          password,
          defaultProfitPercentage: 30,
          createdAt: new Date().toISOString(),
        };
        await createUser(newUser);
        await saveCurrentUser(newUser);
        setUser(newUser);
        return { success: true };
      } catch (e) {
        return { success: false, error: 'Error al crear la cuenta. Intenta de nuevo.' };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await saveCurrentUser(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return;
      const updated = await updateUserById(user.id, updates);
      if (updated) {
        setUser(updated);
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

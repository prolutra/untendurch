import Parse from 'parse';
import { create } from 'zustand';

export type AuthStore = AuthActions & AuthState;

interface AuthActions {
  currentUser: () => Parse.User | undefined;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setSessionToken: (token: null | string) => void;
}

interface AuthState {
  sessionToken: null | string;
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: () => Parse.User.current() ?? undefined,

  login: async (username: string, password: string) => {
    try {
      const parseUser = await Parse.User.logIn(username, password);
      set({ sessionToken: parseUser.getSessionToken() ?? null });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  },

  logout: async () => {
    set({ sessionToken: null });
    await Parse.User.logOut();
  },

  sessionToken: null,

  setSessionToken: (token) => set({ sessionToken: token }),
}));

/**
 * Initialize session token from current user if exists.
 * Must be called after Parse is initialized.
 */
export function initializeAuthStore() {
  try {
    const currentUser = Parse.User.current();
    if (currentUser) {
      useAuthStore
        .getState()
        .setSessionToken(currentUser.getSessionToken() ?? null);
    }
  } catch {
    // Parse not initialized yet, ignore
  }
}

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createUser, getUserId, onboardingApi } from "../api/index";
import type { DNA } from "../api/types";

interface UserState {
  loading: boolean;
  userId: string | null;
  onboardingComplete: boolean;
  hasPrimaryReality: boolean;
  dna: DNA | null;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserState | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [userId, setUserIdState] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [hasPrimaryReality, setHasPrimaryReality] = useState(false);
  const [dna, setDna] = useState<DNA | null>(null);

  const refresh = useCallback(async () => {
    let id = await getUserId();
    if (!id) {
      const user = await createUser("Você");
      id = user.id;
    }
    setUserIdState(id);
    try {
      const status = await onboardingApi.status();
      setOnboardingComplete(status.onboardingComplete);
      setHasPrimaryReality(status.hasPrimaryReality);
      setDna(status.dna);
    } catch {
      setOnboardingComplete(false);
      setHasPrimaryReality(false);
      setDna(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  return (
    <UserContext.Provider
      value={{ loading, userId, onboardingComplete, hasPrimaryReality, dna, refresh }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserState {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser precisa estar dentro de UserProvider.");
  return ctx;
}

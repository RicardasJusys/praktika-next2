import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CreditsContext = createContext();

export function CreditsProvider({ children }) {
  const { data: session } = useSession();
  const [credits, setCredits] = useState(0);

  // Whenever the session loads (or changes), seed our local credits
  useEffect(() => {
    if (session?.user?.credits != null) {
      setCredits(session.user.credits);
    }
  }, [session]);

  return (
    <CreditsContext.Provider value={{ credits, setCredits }}>
      {children}
    </CreditsContext.Provider>
  );
}

// Custom hook to use credits
export function useCredits() {
  return useContext(CreditsContext);
}

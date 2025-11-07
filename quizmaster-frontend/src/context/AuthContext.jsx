import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      try {
        if (u) {
          const snap = await getDoc(doc(db, "users", u.uid));
          // Prefer role from Firestore; during local dev allow optional override via env or localStorage
          if (snap.exists()) {
            setRole(snap.data().role || null);
          } else {
            // Dev-friendly default role to unblock navigation when the user doc isn't set up yet
            const devOverride =
              (process.env.NODE_ENV !== 'production' && (process.env.REACT_APP_DEFAULT_ROLE || localStorage.getItem('devRole'))) ||
              null;
            setRole(devOverride);
          }
        } else {
          setRole(null);
        }
      } catch {
        setRole(null);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  return (
    <AuthCtx.Provider value={{ user, role, loading }}>
      {!loading && children}
    </AuthCtx.Provider>
  );
}

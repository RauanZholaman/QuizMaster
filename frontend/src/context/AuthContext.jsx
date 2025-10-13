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
          setRole(snap.exists() ? snap.data().role : null);
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

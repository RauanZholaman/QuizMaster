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
  const [profile, setProfile] = useState(null);

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

          const data = snap.exists() ? snap.data() : null;

          // Prefer role from Firestore; during local dev allow optional override via env or localStorage
          const roleFromDB = data?.role ?? null;
          const devOverride =
            (process.env.NODE_ENV !== "production" && (process.env.REACT_APP_DEFAULT_ROLE || localStorage.getItem("devRole"))) ||
            null;
          setRole(roleFromDB ?? devOverride);

          // Set profile details if available
          if (data) {
            setProfile({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              ...data,
            });
          } else {
            setProfile(null);
          }
        } else {
          // Profile and Role resets on logout
          setRole(null);
          setProfile(null);
        }
      } catch {
        setRole(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  return (
    <AuthCtx.Provider value={{ user, role, loading, profile }}>
      {!loading && children}
    </AuthCtx.Provider>
  );
}

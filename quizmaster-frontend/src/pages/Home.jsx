import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, role } = useAuth();

  return (
    <div style={{padding:16}}>
      <h1>Home (Authenticated)</h1>
      <p>Welcome {user?.email}</p>
      <p>Your role: {role || "loading…"}</p>
      <p>Use the navbar to explore pages.</p>
    </div>
  );
}

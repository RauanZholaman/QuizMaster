import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar() {
  const { user, role } = useAuth();

  const doLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };
//style={{display:"flex", gap:12, padding:12, borderBottom:"1px solid #eee"
  return (
    <nav className="MyNavbar">
      <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 15}}>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
        <Link to="#">Create Quiz</Link>
        <Link to="/question-bank">Question Bank</Link>
        <Link to="#">Take Quiz</Link>
        <Link to="#">Dashboard</Link>
      </div>
        <span style={{marginLeft: "auto"}}>
        {user ? (
          <>
            <strong>{user.email}</strong>{role ? ` (${role})` : ""}
            {" • "}
            <button onClick={doLogout}>Logout</button>
          </>
        ) : (
          <em>Not signed in</em>
        )}
      </span>
 
    </nav>
  );
}

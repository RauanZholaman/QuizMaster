import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // After login, React Router will navigate based on ProtectedRoute
      window.location.href = "/";
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{maxWidth: 360, margin: "40px auto"}}>
      <h2>Log in</h2>
      {err && <p style={{color:"red"}}>{err}</p>}
      <input
        placeholder="Email"
        value={email}
        onChange={e=>setEmail(e.target.value)}
        style={{display:"block", width:"100%", marginBottom:8}}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e=>setPass(e.target.value)}
        style={{display:"block", width:"100%", marginBottom:12}}
      />
      <button type="submit">Sign in</button>
    </form>
  );
}

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [role, setRole] = useState("student");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        role,               // "student" or "educator"
        createdAt: serverTimestamp(),
      });
      // Redirect happens automatically via ProtectedRoute when you hit "/"
      window.location.href = "/";
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Sign Up</h2>
      {err && <p style={{color:"red"}}>{err}</p>}
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPass(e.target.value)} />
      <select value={role} onChange={e=>setRole(e.target.value)}>
        <option value="student">Student</option>
        <option value="educator">Educator</option>
      </select>
      <button type="submit">Create account</button>
    </form>
  );
}

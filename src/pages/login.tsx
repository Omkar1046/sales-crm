import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, Mail, Lock, Eye, EyeOff } from "lucide-react";
import styles from "./Login.module.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(email, password);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }
    setLoading(false);
  };

  const demoAccounts = [
    { email: "admin@demo.com", password: "password", role: "Admin" },
    { email: "manager@demo.com", password: "password", role: "Manager" },
    { email: "rep@demo.com", password: "password", role: "Sales Rep" },
  ];

  const fillDemoAccount = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  if (user) return null;

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-card"]}>
        <div className={styles["login-header"]}>
          <div className={styles["icon-wrapper"]}>
            <TrendingUp className={styles["icon"]} />
          </div>
          <h2>Welcome to Sales CRM</h2>
          <p>Sign in to your account to continue</p>
        </div>

        <form
          className={styles["login-form"]}
          onSubmit={handleSubmit}>
          {error && <div className={styles["error-box"]}>{error}</div>}

          <label>Email Address</label>
          <div
            className={styles["input-group"]}
            style={{ width: "100%" }}>
            <Mail className={styles["input-icon"]} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <label>Password</label>
          <div className={styles["input-group"]}>
            <Lock className={styles["input-icon"]} />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ width: "100%", boxSizing: "border-box" }}
            />
            <button
              type="button"
              className={styles["show-password"]}
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles["btn-primary"]}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className={styles["demo-section"]}>
          <span className={styles["divider"]}>Demo Accounts</span>
          {demoAccounts.map((account, i) => (
            <button
              key={i}
              className={styles["demo-btn"]}
              onClick={() => fillDemoAccount(account.email, account.password)}>
              <strong>{account.role}</strong>
              <div>{account.email}</div>
            </button>
          ))}
        </div>

        <p className={styles["signup-text"]}>
          Don’t have an account? <Link href="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

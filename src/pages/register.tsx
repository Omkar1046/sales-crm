import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import styles from "./Register.module.css";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("rep");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
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

    const success = await register(name, email, password, role);

    if (success) {
      router.push("/dashboard");
    } else {
      setError("Registration failed. Please try again.");
    }

    setLoading(false);
  };

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className={styles.registerBg}>
      <div className={styles.registerWrapper}>
        <div className={styles.registerHeader}>
          <div className={styles.iconWrapper}>
            <div className={styles.iconBg}>
              <TrendingUp className={styles.icon} />
            </div>
          </div>
          <h2>Create your account</h2>
          <p>Join our sales team and start managing leads</p>
        </div>

        <div className={styles.registerCard}>
          <form
            className={styles.registerForm}
            onSubmit={handleSubmit}>
            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.formGroup}>
              <label
                htmlFor="name"
                className={styles.formLabel}>
                Full Name
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <User size={20} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.inputField}
                  placeholder="Enter your full name"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label
                htmlFor="email"
                className={styles.formLabel}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.inputField}
                  placeholder="Enter your email"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label
                htmlFor="password"
                className={styles.formLabel}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.inputField}
                  placeholder="Enter your password"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
                <button
                  type="button"
                  className={styles.showPasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label
                htmlFor="role"
                className={styles.formLabel}>
                Role
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={styles.selectField}>
                <option value="rep">Sales Representative</option>
                <option value="manager">Sales Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.registerBtn}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className={styles.registerFooter}>
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className={styles.registerFooterLink}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

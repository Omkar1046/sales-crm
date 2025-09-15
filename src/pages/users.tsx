import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types";
import { Plus, User as UserIcon, Mail, Shield, Search, Filter } from "lucide-react";
import styles from "./Users.module.css";

const Users: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "rep" as "rep" | "manager" | "admin",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setShowModal(false);
        setFormData({ name: "", email: "", password: "", role: "rep" });
      } else {
        alert(data.message || "Error creating user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return styles.roleAdmin;
      case "manager":
        return styles.roleManager;
      case "rep":
        return styles.roleRep;
      default:
        return styles.roleDefault;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return "👑";
      case "manager":
        return "👔";
      case "rep":
        return "💼";
      default:
        return "👤";
    }
  };

  if (loading || !user) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.accessDenied}>
          <Shield className={styles.accessDeniedIcon} />
          <h2 className={styles.accessDeniedTitle}>Access Denied</h2>
          <p className={styles.accessDeniedText}>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.usersContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>User Management</h1>
          <p className={styles.pageSubtitle}>Manage team members and their roles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={styles.addUserBtn}>
          <Plus className={styles.addUserIcon} />
          Add User
        </button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardRow}>
            <div className={styles.summaryCardIconBgGray}>
              <UserIcon className={styles.summaryCardIconGray} />
            </div>
            <div className={styles.summaryCardText}>
              <p className={styles.summaryCardLabel}>Total Users</p>
              <p className={styles.summaryCardValue}>{users.length}</p>
            </div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardRow}>
            <div className={styles.summaryCardIconBgPurple}>
              <span className={styles.summaryCardEmoji}>👑</span>
            </div>
            <div className={styles.summaryCardText}>
              <p className={styles.summaryCardLabel}>Admins</p>
              <p className={styles.summaryCardValue}>{users.filter((u) => u.role === "admin").length}</p>
            </div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardRow}>
            <div className={styles.summaryCardIconBgBlue}>
              <span className={styles.summaryCardEmoji}>👔</span>
            </div>
            <div className={styles.summaryCardText}>
              <p className={styles.summaryCardLabel}>Managers</p>
              <p className={styles.summaryCardValue}>{users.filter((u) => u.role === "manager").length}</p>
            </div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardRow}>
            <div className={styles.summaryCardIconBgGreen}>
              <span className={styles.summaryCardEmoji}>💼</span>
            </div>
            <div className={styles.summaryCardText}>
              <p className={styles.summaryCardLabel}>Sales Reps</p>
              <p className={styles.summaryCardValue}>{users.filter((u) => u.role === "rep").length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersRow}>
          <div className={styles.filtersCol}>
            <div className={styles.inputWrapper}>
              <Search className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.inputField}
              />
            </div>
          </div>
          <div className={styles.filtersColFixed}>
            <div className={styles.inputWrapper}>
              <Filter className={styles.inputIcon} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={styles.inputField}>
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="rep">Sales Rep</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className={styles.tableCard}>
        {usersLoading ? (
          <div className={styles.tableLoading}>
            <div className={styles.loadingSpinnerSmall}></div>
            <p className={styles.tableLoadingText}>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.tableEmpty}>
            <UserIcon className={styles.tableEmptyIcon} />
            <p className={styles.tableEmptyText}>No users found</p>
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableTh}>User</th>
                  <th className={styles.tableTh}>Email</th>
                  <th className={styles.tableTh}>Role</th>
                  <th className={styles.tableTh}>Created</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className={styles.tableRow}>
                    <td className={styles.tableTd}>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                          <span className={styles.userAvatarEmoji}>{getRoleIcon(u.role)}</span>
                        </div>
                        <div className={styles.userNameWrap}>
                          <div className={styles.userName}>{u.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.tableTd}>
                      <div className={styles.userContact}>
                        <Mail className={styles.userContactIcon} />
                        {u.email}
                      </div>
                    </td>
                    <td className={styles.tableTd}>
                      <span className={`${styles.roleBadge} ${getRoleColor(u.role)}`}>{u.role}</span>
                    </td>
                    <td className={styles.tableTd}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Add New User</h3>
            <form
              onSubmit={handleSubmit}
              className={styles.modalForm}>
              <div>
                <label className={styles.modalLabel}>Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.modalInput}
                />
              </div>
              <div>
                <label className={styles.modalLabel}>Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.modalInput}
                />
              </div>
              <div>
                <label className={styles.modalLabel}>Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={styles.modalInput}
                />
              </div>
              <div>
                <label className={styles.modalLabel}>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as "rep" | "manager" | "admin" })}
                  className={styles.modalInput}>
                  <option value="rep">Sales Representative</option>
                  <option value="manager">Sales Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: "", email: "", password: "", role: "rep" });
                  }}
                  className={styles.modalCancelBtn}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.modalSubmitBtn}>
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

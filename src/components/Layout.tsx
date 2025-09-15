import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Home, Users, Target, TrendingUp, Settings, LogOut, Menu, X } from "lucide-react";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <>{children}</>;
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home, roles: ["rep", "manager", "admin"] },
    { name: "Leads", href: "/leads", icon: Users, roles: ["rep", "manager", "admin"] },
    { name: "Opportunities", href: "/opportunities", icon: Target, roles: ["rep", "manager", "admin"] },
    { name: "Users", href: "/users", icon: Settings, roles: ["admin"] },
  ];

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className={styles.layoutBg}>
      {/* Mobile sidebar */}
      <div className={`${styles.mobileSidebarOverlay} ${sidebarOpen ? styles.show : ""}`}>
        <div
          className={styles.mobileSidebarBackdrop}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={styles.mobileSidebar}>
          <div className={styles.mobileSidebarHeader}>
            <h1 className={styles.logoText}>Sales CRM</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className={styles.closeBtn}>
              <X className={styles.closeIcon} />
            </button>
          </div>
          <nav className={styles.sidebarNav}>
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${styles.sidebarNavLink} ${isActive ? styles.activeNavLink : ""}`}
                  onClick={() => setSidebarOpen(false)}>
                  <Icon className={styles.sidebarNavIcon} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className={styles.sidebarFooter}>
            <div className={styles.userInfoRow}>
              <div className={styles.userAvatarSm}>
                <span className={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className={styles.userInfoText}>
                <p className={styles.userName}>{user.name}</p>
                <p className={styles.userRole}>{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={styles.logoutBtn}>
              <LogOut className={styles.logoutIcon} />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={styles.desktopSidebarWrapper}>
        <div className={styles.desktopSidebar}>
          <div className={styles.desktopSidebarHeader}>
            <TrendingUp className={styles.logoIcon} />
            <h1 className={styles.logoText}>Sales CRM</h1>
          </div>
          <nav className={styles.sidebarNav}>
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${styles.sidebarNavLink} ${isActive ? styles.activeNavLink : ""}`}>
                  <Icon className={styles.sidebarNavIcon} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className={styles.sidebarFooter}>
            <div className={styles.userInfoRow}>
              <div className={styles.userAvatarLg}>
                <span className={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className={styles.userInfoText}>
                <p className={styles.userName}>{user.name}</p>
                <p className={styles.userRole}>{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={styles.logoutBtn}>
              <LogOut className={styles.logoutIcon} />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.mainContentWrapper}>
        {/* Mobile header */}
        <div className={styles.mobileHeader}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={styles.menuBtn}>
            <Menu className={styles.menuIcon} />
          </button>
          <h1 className={styles.mobileHeaderTitle}>Sales CRM</h1>
          <div style={{ width: 24 }} /> {/* Spacer */}
        </div>

        <main className={styles.mainContent}>
          <div className={styles.mainContentInner}>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

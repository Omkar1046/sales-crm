import styles from "./Dashboard.module.css";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { DashboardStats } from "@/types";
import { Users, Target, DollarSign, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#A78BFA", "#EF4444"];

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Dashboard</h1>
          <p className={styles.dashboardWelcome}>Welcome back, {user.name}!</p>
        </div>
        <div className={styles.roleBadge}>{user.role}</div>
      </div>

      {statsLoading ? (
        <div className={styles.statsGrid}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={styles.statCardLoading}>
              <div className={styles.statCardLoadingBarShort}></div>
              <div className={styles.statCardLoadingBarTall}></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statCardIcon + " " + styles.statCardIconBlue}>
                <Users className={styles.statIconSvg + " " + styles.statIconBlue} />
              </div>
              <div>
                <p className={styles.statLabel}>Total Leads</p>
                <p className={styles.statValue}>{stats.totalLeads}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statCardIcon + " " + styles.statCardIconGreen}>
                <Target className={styles.statIconSvg + " " + styles.statIconGreen} />
              </div>
              <div>
                <p className={styles.statLabel}>Opportunities</p>
                <p className={styles.statValue}>{stats.totalOpportunities}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statCardIcon + " " + styles.statCardIconYellow}>
                <span
                  className={styles.statIconSvg + " " + styles.statIconYellow}
                  style={{ fontSize: 24, lineHeight: 1 }}>
                  ₹
                </span>
              </div>
              <div>
                <p className={styles.statLabel}>Total Value</p>
                <p className={styles.statValue}>{stats.totalValue.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statCardIcon + " " + styles.statCardIconPurple}>
                <TrendingUp className={styles.statIconSvg + " " + styles.statIconPurple} />
              </div>
              <div>
                <p className={styles.statLabel}>Conversion Rate</p>
                <p className={styles.statValue}>{stats.totalLeads > 0 ? Math.round((stats.totalOpportunities / stats.totalLeads) * 100) : 0}%</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className={styles.chartsGrid}>
            {/* Leads by Status */}
            <div className={styles.chartCard}>
              <div className={styles.chartCardHeader}>
                <BarChart3 className={styles.chartCardHeaderIcon} />
                <h3 className={styles.chartCardHeaderTitle}>Leads by Status</h3>
              </div>
              <div className={styles.chartCardBody}>
                <ResponsiveContainer
                  width="100%"
                  height="100%">
                  <BarChart data={stats.leadsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Opportunities by Stage */}
            <div className={styles.chartCard}>
              <div className={styles.chartCardHeader}>
                <PieChart className={styles.chartCardHeaderIcon} />
                <h3 className={styles.chartCardHeaderTitle}>Opportunities by Stage</h3>
              </div>
              <div className={styles.chartCardBody}>
                <ResponsiveContainer
                  width="100%"
                  height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={stats.opportunitiesByStage}
                      dataKey="count"
                      nameKey="stage"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label>
                      {stats.opportunitiesByStage.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} opportunities`, name]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.pieLegendGrid}>
                {stats.opportunitiesByStage.map((item, index) => (
                  <div
                    key={item.stage}
                    className={styles.pieLegendItem}>
                    <div
                      className={styles.pieLegendColor}
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className={styles.pieLegendLabel}>
                      {item.stage}: {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <div className={styles.quickActionsHeader}>
              <h3>Quick Actions</h3>
            </div>
            <div className={styles.quickActionsGrid}>
              <button
                onClick={() => router.push("/leads")}
                className={styles.quickActionBtn}>
                <Users className={styles.quickActionIcon + " " + styles.quickActionIconBlue} />
                <div>
                  <p className={styles.quickActionLabel}>Manage Leads</p>
                  <p className={styles.quickActionDesc}>Add and track new leads</p>
                </div>
              </button>

              <button
                onClick={() => router.push("/opportunities")}
                className={styles.quickActionBtn}>
                <Target className={styles.quickActionIcon + " " + styles.quickActionIconGreen} />
                <div>
                  <p className={styles.quickActionLabel}>View Opportunities</p>
                  <p className={styles.quickActionDesc}>Track your deals</p>
                </div>
              </button>

              {user.role === "admin" && (
                <button
                  onClick={() => router.push("/users")}
                  className={styles.quickActionBtn}>
                  <Users className={styles.quickActionIcon + " " + styles.quickActionIconPurple} />
                  <div>
                    <p className={styles.quickActionLabel}>Manage Users</p>
                    <p className={styles.quickActionDesc}>Add team members</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.dashboardError}>
          <p>Failed to load dashboard data</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

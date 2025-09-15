import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Opportunity } from "@/types";
import { Plus, Edit, Trash2, DollarSign, Target, Search, Filter } from "lucide-react";
import styles from "./Opportunities.module.css";

const Opportunities: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    value: "",
    stage: "Discovery" as "Discovery" | "Proposal" | "Won" | "Lost",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchOpportunities();
    }
  }, [user]);

  const fetchOpportunities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/opportunities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOpportunities(data.opportunities);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setOpportunitiesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const url = editingOpportunity ? `/api/opportunities/${editingOpportunity.id}` : "/api/opportunities";
      const method = editingOpportunity ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          value: Number(formData.value),
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchOpportunities();
        setShowModal(false);
        setEditingOpportunity(null);
        setFormData({ title: "", value: "", stage: "Discovery" });
      }
    } catch (error) {
      console.error("Error saving opportunity:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/opportunities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchOpportunities();
      }
    } catch (error) {
      console.error("Error deleting opportunity:", error);
    }
  };

  const handleStageUpdate = async (id: string, newStage: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/opportunities/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stage: newStage }),
      });

      const data = await response.json();
      if (data.success) {
        fetchOpportunities();
      }
    } catch (error) {
      console.error("Error updating opportunity stage:", error);
    }
  };

  const openEditModal = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setFormData({
      title: opportunity.title,
      value: opportunity.value.toString(),
      stage: opportunity.stage,
    });
    setShowModal(true);
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !stageFilter || opp.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Map stage to CSS module classes
  const getStageClass = (stage: string) => {
    switch (stage) {
      case "Discovery":
        return styles.stageDiscovery;
      case "Proposal":
        return styles.stageProposal;
      case "Won":
        return styles.stageWon;
      case "Lost":
        return styles.stageLost;
      default:
        return styles.stageDefault;
    }
  };

  const totalValue = filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0);
  const wonValue = filteredOpportunities.filter((opp) => opp.stage === "Won").reduce((sum, opp) => sum + opp.value, 0);

  if (loading || !user) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.opportunitiesContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Opportunities</h1>
          <p className={styles.pageSubtitle}>Track your sales opportunities</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={styles.addOpportunityBtn}>
          <Plus className={styles.addOpportunityIcon} />
          Add Opportunity
        </button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardRow}>
            <div className={styles.summaryCardIconBgBlue}>
              <Target className={styles.summaryCardIconBlue} />
            </div>
            <div className={styles.summaryCardText}>
              <p className={styles.summaryCardLabel}>Total Opportunities</p>
              <p className={styles.summaryCardValue}>{filteredOpportunities.length}</p>
            </div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardRow}>
            <div className={styles.summaryCardIconBgGreen}>
              <span
                className={styles.summaryCardIconGreen}
                style={{ fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ₹
              </span>
            </div>
            <div className={styles.summaryCardText}>
              <p className={styles.summaryCardLabel}>Total Value</p>
              {/* <p className={styles.summaryCardValue}>${totalValue.toLocaleString()}</p> */ <p className={styles.summaryCardValue}>{totalValue.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</p>}
            </div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardRow}>
            <div className={styles.summaryCardIconBgYellow}>
              <span
                className={styles.summaryCardIconYellow}
                style={{ fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ₹
              </span>
            </div>
            <div className={styles.summaryCardText}>
              <p className={styles.summaryCardLabel}>Won Value</p>
              {/* <p className={styles.summaryCardValue}>${wonValue.toLocaleString()}</p> */ <p className={styles.summaryCardValue}>{wonValue.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</p>}
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
                placeholder="Search opportunities..."
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
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className={styles.inputField}>
                <option value="">All Stages</option>
                <option value="Discovery">Discovery</option>
                <option value="Proposal">Proposal</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className={styles.tableCard}>
        {opportunitiesLoading ? (
          <div className={styles.tableLoading}>
            <div className={styles.loadingSpinnerSmall}></div>
            <p className={styles.tableLoadingText}>Loading opportunities...</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className={styles.tableEmpty}>
            <Target className={styles.tableEmptyIcon} />
            <p className={styles.tableEmptyText}>No opportunities found</p>
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableTh}>Opportunity</th>
                  <th className={styles.tableTh}>Value</th>
                  <th className={styles.tableTh}>Stage</th>
                  <th className={styles.tableTh}>Created</th>
                  <th className={styles.tableThRight}>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {filteredOpportunities.map((opportunity) => (
                  <tr
                    key={opportunity.id}
                    className={styles.tableRow}>
                    <td className={styles.tableTd}>
                      <div className={styles.oppInfo}>
                        <div className={styles.oppAvatar}>
                          <Target className={styles.oppAvatarIcon} />
                        </div>
                        <div className={styles.oppNameWrap}>
                          <div className={styles.oppName}>{opportunity.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.tableTd}>
                      <div className={styles.oppValue}>
                        <DollarSign className={styles.oppValueIcon} />
                        {opportunity.value.toLocaleString()}
                      </div>
                    </td>
                    <td className={styles.tableTd}>
                      <select
                        value={opportunity.stage}
                        onChange={(e) => handleStageUpdate(opportunity.id, e.target.value)}
                        className={`${styles.stageSelect} ${getStageClass(opportunity.stage)}`}>
                        <option value="Discovery">Discovery</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                    <td className={styles.tableTd}>{new Date(opportunity.createdAt).toLocaleDateString()}</td>
                    <td className={styles.tableTdRight}>
                      <div className={styles.actionsRow}>
                        <button
                          onClick={() => openEditModal(opportunity)}
                          className={styles.actionBtnBlue}
                          title="Edit">
                          <Edit className={styles.actionIcon} />
                        </button>
                        <button
                          onClick={() => handleDelete(opportunity.id)}
                          className={styles.actionBtnRed}
                          title="Delete">
                          <Trash2 className={styles.actionIcon} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Opportunity Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{editingOpportunity ? "Edit Opportunity" : "Add New Opportunity"}</h3>
            <form
              onSubmit={handleSubmit}
              className={styles.modalForm}>
              <div>
                <label className={styles.modalLabel}>Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={styles.modalInput}
                />
              </div>
              <div>
                <label className={styles.modalLabel}>Value ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className={styles.modalInput}
                />
              </div>
              <div>
                <label className={styles.modalLabel}>Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as "Discovery" | "Proposal" | "Won" | "Lost" })}
                  className={styles.modalInput}>
                  <option value="Discovery">Discovery</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingOpportunity(null);
                    setFormData({ title: "", value: "", stage: "Discovery" });
                  }}
                  className={styles.modalCancelBtn}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.modalSubmitBtn}>
                  {editingOpportunity ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunities;

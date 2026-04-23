import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { Container, Row, Col, Button, Spinner, Badge, Modal } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaWater, FaCheckCircle, FaCalendarAlt, FaTrash, FaExclamationTriangle, FaRobot, FaCog, FaPlus, FaChevronRight, FaChevronLeft, FaTimes } from "react-icons/fa";
import { AuthContext } from "./auth/authcontext";
import { baseUrl } from "./auth/config";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";

// --- Skeleton Component for better UX ---
const TaskSkeleton = () => (
  <div className="task-card-premium-horiz skeleton">
    <div className="card-top">
      <div className="skeleton-icon" />
    </div>
    <div className="task-info">
      <div className="skeleton-line title" />
      <div className="skeleton-line text" />
    </div>
  </div>
);

export default function Dashboard() {
  const { token, activeTankId } = useContext(AuthContext);

  const navigate = useNavigate();

  const [tankData, setTankData] = useState(null);
  const [waterAiData, setWaterAiData] = useState(null);
  const [taskBuckets, setTaskBuckets] = useState({ ALL: [], AI: [], BASIC: [], CUSTOM: [], COMPLETED: [] });

  const [loading, setLoading] = useState(true); // Full screen loader
  const [refreshing, setRefreshing] = useState(false); // Background sync
  const [actionLoading, setActionLoading] = useState(null);

  const [category, setCategory] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const scrollRef = useRef(null);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!token || !activeTankId) return;

      // Only show full loader if we have no data, otherwise use background refresh state
      if (!isRefresh && !tankData) setLoading(true);
      else setRefreshing(true);

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [healthRes, aiRes, taskRes] = await Promise.all([
          fetch(`${baseUrl}/monitoring/${activeTankId}/health/`, { headers }),
          fetch(`${baseUrl}/intelligence/water/tank/${activeTankId}`, { headers }),
          fetch(`${baseUrl}/monitoring/tanks/${activeTankId}/care-tasks/`, { headers }),
        ]);

        const healthJson = await healthRes.json();
        const aiJson = await aiRes.json();
        const taskJson = await taskRes.json();

        if (healthJson.data) setTankData(healthJson.data);
        if (aiJson) setWaterAiData(aiJson);

        const allTasks = taskJson?.data?.calendar_ready || [];

        setTaskBuckets({
          ALL: allTasks,
          AI: taskJson?.data?.care_schedules?.ai_recommended || [],
          BASIC: allTasks.filter((t) => t.source === "BASIC"),
          CUSTOM: taskJson?.data?.care_schedules?.custom_tasks || [],
          COMPLETED: allTasks?.filter((t) => t.status === "COMPLETED"),
        });
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, activeTankId, tankData],
  );

  useEffect(() => {
    fetchData();
  }, [activeTankId]); // Only refetch when tank changes

  const handleMarkComplete = async (taskId) => {
    setActionLoading(taskId);
    try {
      const res = await fetch(`${baseUrl}/monitoring/tanks/care-tasks/${taskId}/complete/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setShowModal(false);
        fetchData(true); // Background refresh
      }
    } catch (err) {
      alert("Error updating task");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    setActionLoading(taskId);
    try {
      const res = await fetch(`${baseUrl}/monitoring/care-tasks/${taskId}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchData(true); // Background refresh
    } catch (err) {
      alert("Error deleting task");
    } finally {
      setActionLoading(null);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  // If no active tank → show redirect CTA
  if (!activeTankId) {
    return (
      <div className="dashboard-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: "70vh" }}>
        <div className="text-center">
          <h4 className="mb-3">No Active Tank</h4>
          <p className="text-muted mb-4">Activate a tank to start monitoring and managing your aquarium.</p>

          <Button variant="info" onClick={() => navigate("/tanks")}>
            Activate a Tank
          </Button>
        </div>
      </div>
    );
  }

  // 1. Initial Loading State (First time only)
  if (loading && !tankData) {
    return (
      <div className="dashboard-loader">
        <div className="scanner-line"></div>
        <Spinner animation="border" variant="info" />
        <span className="ms-3 text-info fw-bold">INITIALIZING SYSTEM...</span>
      </div>
    );
  }

  return (
    <div className={`dashboard-wrapper ${refreshing ? "ui-refreshing" : ""}`}>
      {/* Subtle refreshing indicator */}
      {refreshing && (
        <div className="refresh-pill">
          <Spinner animation="border" size="sm" variant="info" className="me-2" />
          Updating Sync...
        </div>
      )}

      <Container className="py-4 position-relative">
        <header className="dashboard-header-premium mb-5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="breadcrumb-label">SYSTEM DASHBOARD</span>
            <h1 className="tank-display-name">{tankData?.tank_name || "Primary Tank"}</h1>
            <div className="system-status">
              <span className="pulse-dot"></span>
              <span className="status-text">{refreshing ? "SYNCING..." : "REAL-TIME BIOMETRICS ACTIVE"}</span>
            </div>
          </motion.div>
        </header>

        <Row className="g-4">
          {/* Health Card Column remains same */}
          <Col lg={4}>
            <motion.div className="glass-card-premium health-gauge-card h-100" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h5 className="card-label">OVERALL VITALITY</h5>
              <div className="gauge-wrapper">
                <svg viewBox="0 0 100 100" className="biometric-svg">
                  <circle className="gauge-bg" cx="50" cy="50" r="42" />
                  <motion.circle
                    className="gauge-progress"
                    cx="50"
                    cy="50"
                    r="42"
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 - (264 * (tankData?.overall_health || 0)) / 100 }}
                    transition={{ duration: 2, ease: "circOut" }}
                  />
                </svg>
                <div className="gauge-content">
                  <span className="gauge-value">{tankData?.overall_health || 0}</span>
                  <span className="gauge-unit">%</span>
                </div>
              </div>
              <div className="vital-stats-grid">
                <div className="vital-item">
                  <span className="v-label">WATER</span>
                  <span className="v-value">{tankData?.water_health_score}/100</span>
                  <div className="v-bar">
                    <div className="v-fill" style={{ width: `${tankData?.water_health_score}%` }}></div>
                  </div>
                </div>
                <div className="vital-item">
                  <span className="v-label">SPECIES</span>
                  <span className="v-value">{tankData?.species_health_score}/100</span>
                  <div className="v-bar">
                    <div className="v-fill bg-cyan" style={{ width: `${tankData?.species_health_score}%` }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Col>

          {/* Maintenance Log Section */}
          <Col lg={8}>
            <div className="command-center-header">
              <h4 className="section-title">
                <FaCalendarAlt className="me-2 text-info" /> MAINTENANCE LOG
              </h4>
              <div className="d-flex align-items-center gap-3">
                <div className="category-switcher">
                  {["ALL", "AI", "BASIC", "COMPLETED"].map((cat) => (
                    <button key={cat} className={`switch-btn ${category === cat ? "active" : ""}`} onClick={() => setCategory(cat)}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="scroll-controls">
                  <button className="ctrl-btn" onClick={() => scroll("left")}>
                    <FaChevronLeft />
                  </button>
                  <button className="ctrl-btn" onClick={() => scroll("right")}>
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>

            <div className="task-scroller-container">
              <div className="task-scroller-horizontal" ref={scrollRef}>
                <AnimatePresence mode="popLayout">
                  {/* Show Skeletons if we are in a hard loading state, otherwise show tasks */}
                  {loading
                    ? [1, 2, 3].map((i) => <TaskSkeleton key={i} />)
                    : taskBuckets[category]
                        .filter((task) => (category !== "COMPLETED" ? task?.status?.toLowerCase() == "pending" : true))
                        .map((task) => (
                          <motion.div
                            key={task.id}
                            layout
                            className={`task-card-premium-horiz clickable-card ${task.source === "AI" ? "ai-border" : ""} ${actionLoading === task.id ? "processing" : ""}`}
                            onClick={() => {
                              setSelectedTask(task);
                              setShowModal(true);
                            }}
                          >
                            {actionLoading === task.id && (
                              <div className="card-overlay-spinner">
                                <Spinner size="sm" variant="info" />
                              </div>
                            )}

                            <div className="card-top">
                              <div className={`icon-shield ${task.source === "AI" ? "ai" : ""}`}>{task.source === "AI" ? <FaRobot /> : <FaWater />}</div>
                              <Badge className="task-badge">{task.source}</Badge>
                            </div>
                            <div className="task-info">
                              <h6>{task.title}</h6>
                              <p className="truncated-text">{task.description}</p>
                            </div>
                            <div className="task-footer-horiz">
                              <span className="task-date-alt">{task.scheduled_date}</span>
                              <div className="mini-actions">
                                <button
                                  className="mini-btn check"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkComplete(task.id);
                                  }}
                                >
                                  <FaCheckCircle />
                                </button>
                                <button
                                  className="mini-btn del"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task.id);
                                  }}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="header-actions">
              <Button className="btn-glass-round-premium">
                <FaCog />
              </Button>
              <Button className="btn-glass-round-premium plus">
                <FaPlus />
              </Button>
            </div>
          </Col>
        </Row>

        {/* --- Task Detail Modal --- */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="premium-modal-content" backdropClassName="premium-modal-backdrop">
          <div className="modal-glass-wrapper">
            <Modal.Header>
              <div className="d-flex align-items-center gap-3">
                <div className={`modal-icon-shield ${selectedTask?.source === "AI" ? "ai" : ""}`}>{selectedTask?.source === "AI" ? <FaRobot /> : <FaWater />}</div>
                <div>
                  <Modal.Title className="modal-task-title">{selectedTask?.title}</Modal.Title>
                  <span className="modal-task-date">Scheduled for {selectedTask?.scheduled_date}</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </Modal.Header>
            <Modal.Body className="custom-scrollbar">
              <h6 className="modal-label">DESCRIPTION</h6>
              <p className="modal-description-text">{selectedTask?.description}</p>

              <div className="modal-meta-box">
                <div className="meta-item">
                  <span>SOURCE TYPE</span>
                  <Badge className="task-badge">{selectedTask?.source}</Badge>
                </div>
                <div className="meta-item">
                  <span>STATUS</span>
                  <span className={`status-indicator ${selectedTask?.status?.toLowerCase()}`}>{selectedTask?.status}</span>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button className="modal-btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button className="modal-btn-primary" onClick={() => handleMarkComplete(selectedTask?.id)} disabled={actionLoading === selectedTask?.id}>
                {actionLoading === selectedTask?.id ? <Spinner size="sm" className="me-2" /> : <FaCheckCircle className="me-2" />}
                Mark Complete
              </Button>
            </Modal.Footer>
          </div>
        </Modal>

        {/* AI Intelligence Hub Stays Same */}
        {waterAiData && (
          <motion.div className="ai-intel-hub mt-5" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <div className="hub-header">
              <div className="ai-branding">
                <div className="ai-core-icon">
                  <FaRobot />
                </div>
                <div>
                  <h4>AQUA-INTEL MONITORING</h4>
                  <p>Neural analysis of ecosystem parameters</p>
                </div>
              </div>
              {waterAiData.anomalies_detected && <Badge className="alert-pill">ANOMALY DETECTED</Badge>}
            </div>

            <Row className="hub-content">
              <Col md={6} className="border-end-glass">
                <h6 className="hub-label">PARAMETER ANOMALIES</h6>
                <div className="anomaly-scroll">
                  {waterAiData.anomalies?.map((item, i) => (
                    <div key={i} className="anomaly-row-premium">
                      <FaExclamationTriangle className="text-warning" />
                      <div className="ms-3">
                        <span className="p-name">{item.parameter}</span>
                        <div className="p-vals">
                          <span className="obs">Observed: {item.observed_value}</span>
                          <span className="divider">|</span>
                          <span className="target">Target: {item.safe_range}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Col>
              <Col md={6}>
                <h6 className="hub-label">NEURAL RECOMMENDATIONS</h6>
                <div className="rec-list-premium">
                  {waterAiData.recommended_actions?.map((action, i) => (
                    <div key={i} className="rec-item-premium">
                      <FaChevronRight className="text-info" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </motion.div>
        )}
      </Container>
    </div>
  );
}

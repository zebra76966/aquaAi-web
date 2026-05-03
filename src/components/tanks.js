import React, { useState, useEffect, useContext, useCallback } from "react";
import { Container, Row, Col, Button, Spinner, Badge, Modal } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaFish, FaSearch, FaWater, FaThermometerHalf, FaExclamationTriangle, FaEye, FaCog } from "react-icons/fa";
import { AuthContext } from "./auth/authcontext";
import { baseUrl } from "./auth/config";
import "./tanks.css";
import { useNavigate } from "react-router-dom";

export default function Tanks() {
  const { token, logout, activeTankId, activateTank, permissions } = useContext(AuthContext);

  const navigate = useNavigate();

  const [tanksData, setTanksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTank, setSelectedTank] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTanks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/tanks/get-tanks/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (response.ok && result.data.tanks) {
        setTanksData(
          result.data.tanks.map((tank) => ({
            id: tank.id,
            name: tank.name,
            waterType: tank.tank_type.toLowerCase() + " water",
            size: `${tank.size} ${tank.size_unit}`,
            image: tank.image_url || null,
            waterParams: tank?.latest_water_parameters || {},
          })),
        );
      } else if (response.status === 401) logout();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  const handleDeleteTank = async () => {
    if (!selectedTank) return;
    setDeleting(true);
    try {
      const response = await fetch(`${baseUrl}/tanks/tank/delete/${selectedTank.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setTanksData((prev) => prev.filter((t) => t.id !== selectedTank.id));
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const filteredTanks = tanksData.filter((t) => t.name.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <div className="tanks-wrapper">
      <div className="animated-bg">
        <div className="mesh-gradient"></div>
      </div>

      <Container className="py-5 position-relative" style={{ zIndex: 1 }}>
        <header className="tanks-header-flex mb-5">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="hero-text">Habitats</h1>
            <p className="subtitle-text">Monitoring {tanksData.length} unique aquatic systems</p>
          </motion.div>

          <div className="action-cluster">
            <div className="search-glass-container">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Quick search..." onChange={(e) => setSearchText(e.target.value)} />
            </div>
            {tanksData.length < (permissions?.max_habitats || 99) ? (
              <Button className="btn-glow-plus">
                <FaPlus /> <span>New Tank</span>
              </Button>
            ) : (
              <Badge className="limit-pill">Limit Reached</Badge>
            )}
            <Button variant="outline-info" onClick={() => navigate("/featured")}>
              Feature D Lab
            </Button>
          </div>
        </header>

        <Row className="g-4">
          <AnimatePresence>
            {filteredTanks.map((tank) => {
              const isActive = tank.id === activeTankId;
              const p = tank.waterParams;

              return (
                <Col key={tank.id} lg={4} md={6}>
                  <motion.div layout whileHover={{ scale: 1.02 }} className={`tank-card-premium ${isActive ? "active-system" : ""}`}>
                    <div className="card-inner-blur"></div>

                    <div className="card-top">
                      <div className="tank-visual">
                        <div className="visual-mask">{tank.image ? <img src={tank.image} alt="" /> : <FaFish className="fallback-fish" />}</div>
                        {isActive && (
                          <div className="live-indicator">
                            <span>LIVE</span>
                          </div>
                        )}
                      </div>

                      <div className="tank-info-main">
                        <div className="d-flex justify-content-between align-items-center">
                          <h3 className="tank-name-text">{tank.name}</h3>
                          <FaEye className="view-details-icon" />
                        </div>
                        <p className="tank-spec-text">
                          {tank.waterType} • {tank.size}
                        </p>
                      </div>
                    </div>

                    <div className="stats-dashboard-row">
                      <div className="stat-pill">
                        <FaThermometerHalf className="text-danger" />
                        <div className="stat-data">
                          <span className="stat-val">{p.temperature || "--"}°C</span>
                          <span className="stat-label">TEMP</span>
                        </div>
                      </div>
                      <div className="stat-pill">
                        <FaWater className="text-info" />
                        <div className="stat-data">
                          <span className="stat-val">{p.estimated_ph || "--"}</span>
                          <span className="stat-label">pH</span>
                        </div>
                      </div>
                      <div className="stat-pill">
                        <FaExclamationTriangle className="text-warning" />
                        <div className="stat-data">
                          <span className="stat-val">{p.estimated_ammonia_ppm || "0"}</span>
                          <span className="stat-label">NH3</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer-actions">
                      <div className="main-actions">
                        <Button className="btn-glass-util">
                          <FaCog />
                        </Button>
                        <Button className={`btn-state-action ${isActive ? "active" : ""}`} onClick={() => (!isActive ? activateTank(tank.id) : navigate("/dashboard"))}>
                          {isActive ? "Viewing Stats" : "Activate System"}
                        </Button>
                      </div>
                      <button
                        className="btn-delete-link"
                        onClick={() => {
                          setSelectedTank(tank);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FaTrash /> Remove Habitat
                      </button>
                    </div>
                  </motion.div>
                </Col>
              );
            })}
          </AnimatePresence>
        </Row>
      </Container>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="glass-modal">
        <Modal.Body className="p-4 text-center">
          <FaExclamationTriangle size={50} className="text-danger mb-3" />
          <h4 className="text-white">Delete Habitat</h4>
          <p className="text-muted">
            Are you sure you want to delete <strong>{selectedTank?.name}</strong>? This action cannot be undone.
          </p>
          <div className="d-flex gap-3 mt-4">
            <Button variant="secondary" className="w-100" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="w-100" onClick={handleDeleteTank} disabled={deleting}>
              {deleting ? <Spinner size="sm" /> : "Delete"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

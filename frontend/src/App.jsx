import { useState } from "react";
import "./styles.css";

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPage from "./pages/ForgotPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";

import ProjectModal from "./components/ProjectModal";
import DeleteModal from "./components/DeleteModal";

import { genId } from "./utils/helpers";

export default function App() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  /* AUTH */
  const handleRegister = ({ name, email, phone, password }) => {
    if (users.find(u => u.email === email)) {
      setError("Email already registered.");
      return;
    }
    const user = { id: genId(), name, email, phone, password };
    setUsers(prev => [...prev, user]);
    setInfo("Account created! Please log in.");
    setError("");
    navigate("/login");
  };

  const handleLogin = ({ email, password }) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      setError("Invalid email or password.");
      return;
    }
    setCurrentUser(user);
    setError("");
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveProject(null);
    navigate("/login");
  };

  /* PROJECTS */
  const createProject = (name) => {
    const p = { id: genId(), name, createdAt: new Date().toISOString(), images: [] };
    setProjects(prev => [...prev, p]);
    setModal(null);
  };

  const editProject = (id, name) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    setModal(null);
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject?.id === id) setActiveProject(null);
    setModal(null);
  };

  const openProject = (p) => {
    setActiveProject(p);
    navigate("/project");
  };

  return (
    <>
      {/* Modals */}
      {modal?.type === "create" && (
        <ProjectModal title="New Project" onSave={createProject} onClose={() => setModal(null)} />
      )}
      {modal?.type === "edit" && (
        <ProjectModal title="Rename Project" initial={modal.data.name}
          onSave={name => editProject(modal.data.id, name)} onClose={() => setModal(null)} />
      )}
      {modal?.type === "delete" && (
        <DeleteModal name={modal.data.name}
          onConfirm={() => deleteProject(modal.data.id)} onClose={() => setModal(null)} />
      )}

      {/* Routes */}
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={
          <LoginPage
            error={error}
            info={info}
            setError={setError}
            setInfo={setInfo}
            onLogin={handleLogin}
          />
        } />

        <Route path="/register" element={
          <RegisterPage
            error={error}
            setError={setError}
            onRegister={handleRegister}
          />
        } />

        <Route path="/forgot" element={<ForgotPage />} />

        <Route path="/dashboard" element={
          currentUser ? (
            <DashboardPage
              user={currentUser}
              projects={projects}
              onLogout={handleLogout}
              onCreateProject={() => setModal({ type: "create" })}
              onEditProject={p => setModal({ type: "edit", data: p })}
              onDeleteProject={p => setModal({ type: "delete", data: p })}
              onOpenProject={openProject}
            />
          ) : <Navigate to="/login" />
        } />

        <Route path="/project" element={
          activeProject ? (
            <ProjectPage
              project={activeProject}
              onBack={() => navigate("/dashboard")}
              onLogout={handleLogout}
              user={currentUser}
            />
          ) : <Navigate to="/dashboard" />
        } />

      </Routes>
    </>
  );
}
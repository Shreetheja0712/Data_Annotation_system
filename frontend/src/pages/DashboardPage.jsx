import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";

export default function DashboardPage({
  user, projects, onLogout,
  onCreateProject, onEditProject, onDeleteProject
}) {
  const navigate = useNavigate();

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="dashboard">
        <div className="hero-greeting">
          <div className="hero-hello">👋 Good to see you</div>
          <div className="hero-name">Hello, <span>{user.name.split(" ")[0]}</span></div>
        </div>

        <button className="create-project-btn" onClick={onCreateProject}>
          <div className="cpb-icon">+</div>
          <div className="cpb-label">CREATE PROJECT</div>
          <div className="cpb-sub">Start a new project and upload your assets</div>
        </button>

        <div className="section-header">
          <div className="section-title">
            Your Projects {projects.length > 0 && `(${projects.length})`}
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <div className="empty-title">No projects yet</div>
            <div className="empty-sub">Click "Create Project" above to get started</div>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onOpen={() => navigate(`/project/${p.id}`)}
                onEdit={() => onEditProject(p)}
                onDelete={() => onDeleteProject(p)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

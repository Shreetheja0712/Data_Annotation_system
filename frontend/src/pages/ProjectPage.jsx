import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { fmtDate } from "../utils/helpers";

export default function ProjectPage({ projects, user, onLogout, onAddImages, onDeleteImage }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div style={{ padding: 40, color: "var(--muted)", textAlign: "center" }}>
        Project not found. <button className="link-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
      </div>
    );
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    if (e.dataTransfer.files.length) onAddImages(projectId, e.dataTransfer.files);
  };

  const annotatedCount = project.images.filter(img => img.annotations?.length > 0).length;

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="project-detail">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>

        <div className="project-detail-header">
          <div>
            <div className="pd-name">{project.name}</div>
            <div className="pd-meta">
              Created {fmtDate(project.createdAt)} · {project.images.length} image{project.images.length !== 1 ? "s" : ""}
              {annotatedCount > 0 && ` · ${annotatedCount} annotated`}
            </div>
          </div>
        </div>

        <div
          className={`upload-zone${drag ? " drag-over" : ""}`}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileRef}
            className="upload-input"
            type="file"
            multiple
            accept="image/*"
            onChange={e => { onAddImages(projectId, e.target.files); e.target.value = ""; }}
          />
          <div className="upload-icon">🖼️</div>
          <div className="upload-label">Drop images here or click to browse</div>
          <div className="upload-sub">Supports JPG, PNG, GIF, WebP</div>
        </div>

        {project.images.length > 0 && (
          <div className="gallery-section">
            <div className="gallery-header">
              <span className="gallery-title">Images</span>
              <span className="gallery-hint">Click an image to annotate objects</span>
            </div>
            <div className="gallery">
              {project.images.map(img => (
                <div
                  key={img.id}
                  className="gallery-item"
                  onClick={() => navigate(`/project/${projectId}/annotate/${img.id}`)}
                >
                  <img src={img.src} alt={img.name} />
                  {img.annotations?.length > 0 && (
                    <div className="gallery-badge">{img.annotations.length} obj</div>
                  )}
                  <div className="gallery-item-name">{img.name}</div>
                  <button
                    className="gallery-item-del"
                    onClick={e => { e.stopPropagation(); onDeleteImage(projectId, img.id); }}
                  >✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {project.images.length === 0 && (
          <div className="empty-state" style={{ marginTop: 24 }}>
            <div className="empty-icon">📷</div>
            <div className="empty-title">No images yet</div>
            <div className="empty-sub">Upload images above to start annotating</div>
          </div>
        )}
      </div>
    </>
  );
}

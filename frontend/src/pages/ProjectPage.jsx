import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { fmtDate } from "../utils/helpers";

export default function ProjectPage({
  project, onBack, onLogout, user,
  onAddImages, onDeleteImage
}) {
  const [drag, setDrag] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const files = e.dataTransfer.files;
    if (files.length) onAddImages(files);
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="project-detail">
        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>

        <div className="project-detail-header">
          <div>
            <div className="pd-name">{project.name}</div>
            <div className="pd-meta">
              Created {fmtDate(project.createdAt)} · {project.images.length} image{project.images.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div
          className={`upload-zone${drag ? " drag-over" : ""}`}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
        >
          <input className="upload-input" type="file" multiple
            onChange={e => { onAddImages(e.target.files); e.target.value = ""; }} />
          <div className="upload-icon">🖼️</div>
          <div className="upload-label">Drop images here or click to browse</div>
          <div className="upload-sub">Supports JPG, PNG, GIF, WebP</div>
        </div>

        <div className="gallery">
          {project.images.map(img => (
            <div key={img.id} className="gallery-item" onClick={() => setLightbox(img)}>
              <img src={img.src} alt={img.name} />
              <button className="gallery-item-del"
                onClick={e => { e.stopPropagation(); onDeleteImage(img.id); }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close">✕</button>
          <img src={lightbox.src} alt={lightbox.name} />
        </div>
      )}
    </>
  );
}
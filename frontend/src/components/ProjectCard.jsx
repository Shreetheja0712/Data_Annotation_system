import { fmtDate } from "../utils/helpers";

export default function ProjectCard({ project, onOpen, onEdit, onDelete }) {
  const preview = project.images.slice(0, 3);
  const extra = project.images.length - 3;

  return (
    <div className="project-card">
      <div className="pc-name">{project.name}</div>
      <div className="pc-meta">
        {fmtDate(project.createdAt)} · {project.images.length} image{project.images.length !== 1 ? "s" : ""}
      </div>

      {preview.length > 0 && (
        <div className="pc-images-preview">
          {preview.map(img => (
            <img key={img.id} className="pc-thumb" src={img.src} alt={img.name} />
          ))}
          {extra > 0 && <div className="pc-thumb-more">+{extra}</div>}
        </div>
      )}

      <div className="pc-actions">
        <button className="btn-sm btn-open" onClick={onOpen}>Open</button>
        <button className="btn-sm btn-edit" onClick={onEdit}>Edit</button>
        <button className="btn-sm btn-delete" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
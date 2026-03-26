import { useState } from "react";

export default function ProjectModal({ title, initial = "", onSave, onClose }) {
  const [name, setName] = useState(initial);
  const [err, setErr] = useState("");

  const submit = () => {
    if (!name.trim()) {
      setErr("Project name is required.");
      return;
    }
    onSave(name.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{title}</div>

        {err && <div className="error-msg">{err}</div>}

        <div className="form-group">
          <label className="form-label">Project Name</label>
          <input className="form-input"
            value={name}
            onChange={e => { setName(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-confirm" onClick={submit}>Save</button>
        </div>
      </div>
    </div>
  );
}
export default function DeleteModal({ name, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Delete Project?</div>

        <p style={{ color: "var(--muted)" }}>
          This will permanently delete <strong>{name}</strong>.
        </p>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-confirm-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
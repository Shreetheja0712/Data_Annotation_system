export default function DeleteModal({ name, onConfirm, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Delete Project?</div>
        <p className="modal-warn">
          This will permanently delete <strong style={{color:"var(--text)"}}>{name}</strong> and all its images.
        </p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-confirm btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

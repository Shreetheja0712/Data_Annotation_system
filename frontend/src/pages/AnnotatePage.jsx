import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { genId } from "../utils/helpers";

const LABEL_COLORS = [
  "#6c63ff", "#ff6584", "#3ecf8e", "#ffb347",
  "#00d4ff", "#ff4d6d", "#a8ff3e", "#ff8c00",
  "#d63fff", "#3effd4",
];

export default function AnnotatePage({ projects, user, onLogout, onSaveAnnotations }) {
  const { projectId, imageId } = useParams();
  const navigate = useNavigate();

  const project = projects.find(p => p.id === projectId);
  const image = project?.images.find(img => img.id === imageId);

  const [annotations, setAnnotations] = useState(() =>
    image?.annotations ? [...image.annotations] : []
  );
  const [drawing, setDrawing] = useState(null); // { x, y, w, h } in % coords
  const [selectedId, setSelectedId] = useState(null);
  const [labelInput, setLabelInput] = useState("");
  const [editingLabel, setEditingLabel] = useState(null); // annot id being relabeled
  const [imgLoaded, setImgLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  const canvasRef = useRef(null);
  const startRef = useRef(null);
  const isDragging = useRef(false);

  // Sync annotations if image changes from outside (e.g., hot-reload)
  useEffect(() => {
    if (image) setAnnotations(image.annotations ? [...image.annotations] : []);
  }, [imageId]);

  // ── MOUSE DRAWING ──────────────────────────────────────────────
  const toPercent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setSelectedId(null);
    setEditingLabel(null);
    const pos = toPercent(e);
    startRef.current = pos;
    setDrawing({ x: pos.x, y: pos.y, w: 0, h: 0 });
    isDragging.current = true;
  };

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !startRef.current) return;
    const pos = toPercent(e);
    const x = Math.min(startRef.current.x, pos.x);
    const y = Math.min(startRef.current.y, pos.y);
    const w = Math.abs(pos.x - startRef.current.x);
    const h = Math.abs(pos.y - startRef.current.y);
    setDrawing({ x, y, w, h });
  }, []);

  const onMouseUp = useCallback((e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (!drawing) return;
    // Only save if box is large enough (>1% in either dimension)
    if (drawing.w > 1 && drawing.h > 1) {
      const newAnnot = {
        id: genId(),
        label: `Object ${annotations.length + 1}`,
        color: LABEL_COLORS[annotations.length % LABEL_COLORS.length],
        ...drawing,
      };
      const updated = [...annotations, newAnnot];
      setAnnotations(updated);
      setSelectedId(newAnnot.id);
      setEditingLabel(newAnnot.id);
      setLabelInput(`Object ${annotations.length + 1}`);
    }
    setDrawing(null);
    startRef.current = null;
  }, [drawing, annotations]);

  // Attach global mouse listeners for smooth drawing even when cursor leaves image
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ── LABEL EDIT ─────────────────────────────────────────────────
  const confirmLabel = (id) => {
    const trimmed = labelInput.trim();
    if (!trimmed) return;
    setAnnotations(prev =>
      prev.map(a => a.id === id ? { ...a, label: trimmed } : a)
    );
    setEditingLabel(null);
  };

  const deleteAnnotation = (id) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (editingLabel === id) setEditingLabel(null);
  };

  const changeColor = (id, color) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, color } : a));
  };

  // ── SAVE ───────────────────────────────────────────────────────
  const handleSave = () => {
    onSaveAnnotations(projectId, imageId, annotations);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── NAVIGATION ─────────────────────────────────────────────────
  const imageIndex = project?.images.findIndex(img => img.id === imageId) ?? -1;
  const prevImage = imageIndex > 0 ? project.images[imageIndex - 1] : null;
  const nextImage = imageIndex < (project?.images.length - 1) ? project.images[imageIndex + 1] : null;

  const goToImage = (img) => {
    // Auto-save before navigating
    onSaveAnnotations(projectId, imageId, annotations);
    navigate(`/project/${projectId}/annotate/${img.id}`);
  };

  if (!project || !image) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
        Image not found.{" "}
        <button className="link-btn" onClick={() => navigate(`/project/${projectId}`)}>← Back to Project</button>
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="annotate-shell">

        {/* ── LEFT: Canvas ── */}
        <div className="annotate-canvas-col">
          <div className="annotate-topbar">
            <button className="back-btn" onClick={() => { handleSave(); navigate(`/project/${projectId}`); }}>
              ← Back to Project
            </button>
            <div className="annotate-img-name">{image.name}</div>
            <div className="annotate-nav-btns">
              <button
                className="annot-nav-btn"
                disabled={!prevImage}
                onClick={() => prevImage && goToImage(prevImage)}
              >‹ Prev</button>
              <span className="annot-nav-count">
                {imageIndex + 1} / {project.images.length}
              </span>
              <button
                className="annot-nav-btn"
                disabled={!nextImage}
                onClick={() => nextImage && goToImage(nextImage)}
              >Next ›</button>
            </div>
            <button
              className={`save-btn${saved ? " save-btn--done" : ""}`}
              onClick={handleSave}
            >
              {saved ? "✓ Saved!" : "Save"}
            </button>
          </div>

          <div className="annotate-hint">
            🖱 Click and drag to draw bounding boxes around objects
          </div>

          <div
            className="annotate-canvas-wrap"
            ref={canvasRef}
            onMouseDown={onMouseDown}
            style={{ cursor: "crosshair", userSelect: "none" }}
          >
            <img
              src={image.src}
              alt={image.name}
              className="annotate-img"
              draggable={false}
              onLoad={() => setImgLoaded(true)}
            />

            {/* Existing annotations */}
            {imgLoaded && annotations.map(a => (
              <div
                key={a.id}
                className={`annot-box${selectedId === a.id ? " annot-box--selected" : ""}`}
                style={{
                  left: `${a.x}%`,
                  top: `${a.y}%`,
                  width: `${a.w}%`,
                  height: `${a.h}%`,
                  borderColor: a.color,
                  boxShadow: selectedId === a.id ? `0 0 0 2px ${a.color}44` : "none",
                }}
                onMouseDown={e => {
                  e.stopPropagation();
                  setSelectedId(a.id);
                  setEditingLabel(null);
                }}
              >
                <div
                  className="annot-label"
                  style={{ background: a.color }}
                  onDoubleClick={e => {
                    e.stopPropagation();
                    setEditingLabel(a.id);
                    setLabelInput(a.label);
                  }}
                >
                  {a.label}
                </div>
              </div>
            ))}

            {/* Active drawing box */}
            {drawing && drawing.w > 0.5 && drawing.h > 0.5 && (
              <div
                className="annot-box annot-box--drawing"
                style={{
                  left: `${drawing.x}%`,
                  top: `${drawing.y}%`,
                  width: `${drawing.w}%`,
                  height: `${drawing.h}%`,
                }}
              />
            )}
          </div>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="annotate-sidebar">
          <div className="annot-sidebar-title">
            Annotations
            <span className="annot-count-badge">{annotations.length}</span>
          </div>

          {annotations.length === 0 && (
            <div className="annot-empty">
              <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🔲</div>
              Draw boxes on the image to start annotating objects
            </div>
          )}

          <div className="annot-list">
            {annotations.map((a, i) => (
              <div
                key={a.id}
                className={`annot-item${selectedId === a.id ? " annot-item--active" : ""}`}
                onClick={() => { setSelectedId(a.id); setEditingLabel(null); }}
              >
                <div className="annot-item-left">
                  <div className="annot-item-dot" style={{ background: a.color }} />
                  {editingLabel === a.id ? (
                    <input
                      className="annot-label-input"
                      value={labelInput}
                      autoFocus
                      onChange={e => setLabelInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") confirmLabel(a.id);
                        if (e.key === "Escape") setEditingLabel(null);
                      }}
                      onBlur={() => confirmLabel(a.id)}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className="annot-item-label"
                      onDoubleClick={e => {
                        e.stopPropagation();
                        setEditingLabel(a.id);
                        setLabelInput(a.label);
                      }}
                    >{a.label}</span>
                  )}
                </div>
                <div className="annot-item-actions">
                  <div className="annot-color-swatches">
                    {LABEL_COLORS.slice(0, 5).map(c => (
                      <div
                        key={c}
                        className={`color-swatch${a.color === c ? " color-swatch--active" : ""}`}
                        style={{ background: c }}
                        onClick={e => { e.stopPropagation(); changeColor(a.id, c); }}
                      />
                    ))}
                  </div>
                  <button
                    className="annot-delete-btn"
                    onClick={e => { e.stopPropagation(); deleteAnnotation(a.id); }}
                    title="Delete annotation"
                  >🗑</button>
                </div>
              </div>
            ))}
          </div>

          <div className="annot-sidebar-footer">
            <button className="save-btn save-btn--full" onClick={handleSave}>
              {saved ? "✓ Saved!" : "Save Annotations"}
            </button>
            <div className="annot-footer-hint">
              Double-click a label to rename it
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

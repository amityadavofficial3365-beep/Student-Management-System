// A reusable "Are you sure?" popup (used before deleting a student).
export default function ConfirmModal({ show, title, message, onConfirm, onCancel, busy }) {
  if (!show) return null;

  return (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onCancel} aria-label="Close"></button>
            </div>
            <div className="modal-body">{message}</div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
                {busy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
}

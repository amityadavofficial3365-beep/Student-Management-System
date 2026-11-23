// A small reusable card showing one number on the dashboard.
export default function StatCard({ title, value, icon, color }) {
  return (
    <div className="card stat-card h-100">
      <div className="card-body d-flex align-items-center">
        <div
          className="stat-icon me-3"
          style={{ backgroundColor: `${color}22`, color }}
        >
          <i className={`bi ${icon}`}></i>
        </div>
        <div>
          <div className="text-muted small">{title}</div>
          <div className="fs-3 fw-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function Widget({ title, subtitle, actions, children }) {
  return (
    <section className="widget">
      <div className="widget-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <span className="widget-subtitle">{subtitle}</span>}
        </div>
        {actions && <div className="widget-actions">{actions}</div>}
      </div>
      <div className="widget-body">{children}</div>
    </section>
  );
}

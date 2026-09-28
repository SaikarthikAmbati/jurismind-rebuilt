export default function GlassCard({ as: Tag = "div", strong = false, className = "", children, ...props }) {
  return (
    <Tag className={`${strong ? "glass-panel-strong" : "glass-panel"} rounded-2xl ${className}`} {...props}>
      {children}
    </Tag>
  );
}

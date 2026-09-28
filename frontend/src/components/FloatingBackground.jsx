export default function FloatingBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="animate-drift absolute -top-32 -left-24 h-[36rem] w-[36rem] rounded-full opacity-70 blur-[95px]"
        style={{ background: "radial-gradient(circle, rgba(201,166,103,0.65) 0%, rgba(201,166,103,0) 70%)" }}
      />
      <div
        className="animate-drift-reverse absolute top-1/4 -right-32 h-[32rem] w-[32rem] rounded-full opacity-60 blur-[95px]"
        style={{ background: "radial-gradient(circle, rgba(93,127,232,0.7) 0%, rgba(93,127,232,0) 70%)" }}
      />
      <div
        className="animate-drift absolute bottom-[-8rem] left-1/3 h-[28rem] w-[28rem] rounded-full opacity-45 blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(79,174,126,0.55) 0%, rgba(79,174,126,0) 70%)" }}
      />
      {/* faint document-grid texture for the "material" of the subject */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(244,242,236,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(244,242,236,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}

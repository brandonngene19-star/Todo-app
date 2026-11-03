// PROPS: the inputs a component receives, like HTML attributes.
// `children` is special: whatever you put BETWEEN <Card> and </Card>.
export default function Card({ title, subtitle, className = "", children }) {
  return (
    <section className={`card ${className}`}>
      <header className="card-head">
        <h2>{title}</h2>
        {subtitle && <span className="card-sub">{subtitle}</span>}
      </header>
      {children}
    </section>
  );
}

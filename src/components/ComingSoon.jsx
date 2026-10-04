import Card from './ui/Card'

export default function ComingSoon({
  eyebrow = 'Coming soon',
  title,
  description,
  todos = [],
  accentClass = 'bg-bloom-pink-soft',
  children,
}) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold tracking-[0.18em] text-bloom-lavender uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-bloom-navy">{title}</h1>
        <p className="mt-2 max-w-2xl text-bloom-navy/80">{description}</p>
      </header>

      <Card className={`${accentClass} px-5 py-6 sm:px-6`}>
        <p className="text-sm font-semibold text-bloom-navy">
          This page is a themed placeholder for a future group member to implement.
        </p>
        {todos.length > 0 ? (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-bloom-navy/80">
            {todos.map((item) => (
              <li key={item}>
                <span className="font-semibold text-bloom-navy">TODO:</span> {item}
              </li>
            ))}
          </ul>
        ) : null}
        {children}
      </Card>
    </div>
  )
}

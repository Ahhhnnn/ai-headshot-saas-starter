const logos = [
  { name: "Google", width: 80 },
  { name: "Microsoft", width: 100 },
  { name: "Meta", width: 70 },
  { name: "Amazon", width: 90 },
  { name: "Apple", width: 75 },
  { name: "Netflix", width: 80 },
  { name: "Spotify", width: 85 },
  { name: "Slack", width: 70 },
];

export function SocialProofUnified() {
  return (
    <section className="py-12 border-y border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Trusted by professionals at leading companies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="text-muted-foreground/40 font-semibold text-xl tracking-tight"
              style={{ width: logo.width }}
            >
              {logo.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

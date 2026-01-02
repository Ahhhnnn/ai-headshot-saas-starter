const samples = [
  { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face", name: "Michael" },
  { src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face", name: "Sarah" },
  { src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", name: "James" },
  { src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face", name: "Emily" },
  { src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face", name: "David" },
  { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face", name: "Lisa" },
];

export function SamplesSection() {
  return (
    <section id="samples" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            See what our AI can create
          </h2>
          <p className="text-lg text-muted-foreground">
            Real results from real customers. Professional headshots generated in minutes.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {samples.map((sample, index) => (
            <div
              key={index}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-muted"
            >
              <img
                src={sample.src}
                alt={`AI-generated headshot of ${sample.name}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-medium text-foreground">{sample.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

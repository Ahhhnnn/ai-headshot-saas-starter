import { Sparkles, Sun, Zap } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Precision",
    description:
      "Our advanced AI analyzes your features and creates headshots that look naturally professional, not artificial.",
  },
  {
    icon: Sun,
    title: "Studio Lighting",
    description:
      "Every headshot is rendered with professional studio lighting that flatters your features and creates depth.",
  },
  {
    icon: Zap,
    title: "Quick Turnaround",
    description:
      "Upload your photos and receive 50+ professional headshots in under an hour. No scheduling, no waiting.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why choose HeadshotPro AI?
          </h2>
          <p className="text-lg text-muted-foreground">
            Professional results without the professional price tag or time commitment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

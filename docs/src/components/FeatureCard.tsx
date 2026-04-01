import { Zap, Rocket, Film, Link2, Target, Puzzle, Eye, Ruler, ArrowLeftRight, Palette, Scaling, Infinity } from "lucide-react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const iconMap: Record<string, React.ElementType> = {
  "⚡": Zap,
  "🚀": Rocket,
  "🎬": Film,
  "🔗": Link2,
  "🎯": Target,
  "🧩": Puzzle,
  "👁": Eye,
  "📐": Ruler,
  "↔": ArrowLeftRight,
  "🎨": Palette,
  "📏": Scaling,
  "♾": Infinity,
};

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  const IconComponent = iconMap[icon] || Zap;

  return (
    <div className="rounded-lg border border-border bg-card p-5 hover:border-primary/40 transition-colors">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-accent">
        <IconComponent className="h-4.5 w-4.5 text-accent-foreground" />
      </div>
      <h4 className="mb-1 text-sm font-semibold text-foreground">{title}</h4>
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
};

export default FeatureCard;

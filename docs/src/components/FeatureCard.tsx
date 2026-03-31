interface FeatureCardProps {
	icon: string;
	title: string;
	description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
	return (
		<div className="feature-card">
			<div className="feature-icon">{icon}</div>
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	);
}

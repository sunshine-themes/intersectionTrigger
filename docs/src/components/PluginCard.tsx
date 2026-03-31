interface PluginCardProps {
	name: string;
	description: string;
	href: string;
	icon: string;
}

export default function PluginCard({ name, description, href, icon }: PluginCardProps) {
	return (
		<a href={href} className="plugin-card" style={{ textDecoration: 'none' }}>
			<div className="feature-icon" style={{ margin: '0 auto 1rem' }}>{icon}</div>
			<h3 style={{ margin: '0 0 0.5rem' }}>{name}</h3>
			<p style={{ margin: 0, fontSize: '0.9rem' }}>{description}</p>
		</a>
	);
}

import logo from '@/assets/logo.png';
import ThemeToggle from './ThemeToggle';
import SearchDialog from './SearchDialog';
import { docSections } from '@/data/docSections';
import { ExternalLink } from 'lucide-react';
import { VERSION } from '@/lib/version';

interface NavbarProps {
	onNavigate: (id: string) => void;
}

const Navbar = ({ onNavigate }: NavbarProps) => {
	return (
		<header className="h-[var(--nav-height)] sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex items-center justify-between h-full px-4 lg:px-6">
				<div className="flex items-center gap-2.5">
					<img src={logo} alt="IntersectionTrigger" className="h-10 w-7" />
					<span className="font-bold text-foreground text-sm tracking-tight">IntersectionTrigger</span>
					<span className="hidden sm:inline-flex text-xs px-1.5 py-0.5 rounded bg-accent text-accent-foreground font-mono">v{VERSION}</span>
				</div>

				<div className="flex items-center gap-2">
					<SearchDialog sections={docSections} onNavigate={onNavigate} />
					<a
						href="https://github.com/sunshine-themes/intersectionTrigger"
						target="_blank"
						rel="noopener noreferrer"
						className="p-2 rounded-md hover:bg-secondary transition-colors hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground"
					>
						<span className="hidden md:inline">GitHub</span>
						<ExternalLink className="h-3.5 w-3.5" />
					</a>
					<a
						href="https://www.npmjs.com/package/intersectiontrigger"
						target="_blank"
						rel="noopener noreferrer"
						className="p-2 rounded-md hover:bg-secondary transition-colors hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground"
					>
						<span className="hidden md:inline">npm</span>
						<ExternalLink className="h-3.5 w-3.5" />
					</a>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
};

export default Navbar;

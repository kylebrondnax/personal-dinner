import { Navigation } from '@/components/Navigation';
import { HomePage } from '@/components/HomePage';

export default function Home() {
	return (
		<div className="min-h-screen bg-theme-secondary">
			<Navigation />
			<HomePage />
		</div>
	);
}
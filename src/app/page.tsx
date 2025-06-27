import { Navigation } from '@/components/Navigation';
import { HomePage } from '@/components/HomePage';
import { ThemeTestComponent } from '@/components/ThemeTestComponent';
import { TailwindDarkTest } from '@/components/TailwindDarkTest';

export default function Home() {
	return (
		<div>
			<Navigation />
			<HomePage />
			<ThemeTestComponent />
			<TailwindDarkTest />
		</div>
	);
}
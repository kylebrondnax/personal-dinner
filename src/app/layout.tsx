import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ClerkAuthProvider } from '@/contexts/ClerkAuthContext';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeWrapper } from '@/components/ThemeWrapper';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
});

export const metadata: Metadata = {
	title: 'Family Dinner',
	description:
		'Connect passionate home chefs with food lovers in your community',
	keywords: [
		'family dinner',
		'home chef',
		'community meals',
		'food sharing',
		'dinner parties'
	],
	authors: [{ name: 'Family Dinner' }],
	openGraph: {
		title: 'Family Dinner',
		description:
			'Connect passionate home chefs with food lovers in your community',
		url: 'https://familydinner.me',
		siteName: 'Family Dinner',
		images: [
			{
				url: '/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'Delicious grilled beef ribs from Family Dinner community chefs'
			}
		],
		locale: 'en_US',
		type: 'website'
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Family Dinner',
		description:
			'Connect passionate home chefs with food lovers in your community',
		images: ['/og-image.jpg']
	},
	robots: {
		index: true,
		follow: true
	},
	icons: {
		icon: '/favicon.ico',
		apple: '/apple-touch-icon.png'
	}
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang='en'>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				>
					<ThemeProvider>
						<ClerkAuthProvider>
							<ThemeWrapper>{children}</ThemeWrapper>
						</ClerkAuthProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}

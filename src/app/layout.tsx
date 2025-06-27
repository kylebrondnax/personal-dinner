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
	title: 'Family Dinner Planning',
	description:
		'Connect passionate home chefs with food lovers in your community'
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
							<ThemeWrapper>
								{children}
							</ThemeWrapper>
						</ClerkAuthProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}

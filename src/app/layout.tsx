import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ClerkAuthProvider } from '@/contexts/ClerkAuthContext';
import {
	ClerkProvider,
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton
} from '@clerk/nextjs';

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
							<header className='border-b'>
								<div className='container mx-auto px-4 py-4 flex justify-between items-center'>
									<h1 className='text-xl font-bold'>
										Family Dinner Planning
									</h1>
									<div className='flex items-center gap-4'>
										<SignedOut>
											<SignInButton mode='modal'>
												<button className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
													Sign In
												</button>
											</SignInButton>
											<SignUpButton mode='modal'>
												<button className='px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50'>
													Sign Up
												</button>
											</SignUpButton>
										</SignedOut>
										<SignedIn>
											<UserButton afterSignOutUrl='/' />
										</SignedIn>
									</div>
								</div>
							</header>
							{children}
						</ClerkAuthProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}

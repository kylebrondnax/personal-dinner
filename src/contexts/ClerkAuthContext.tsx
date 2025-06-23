'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';

export interface User {
	id: string;
	email: string;
	name: string;
	role: 'CHEF' | 'ATTENDEE';
	profile?: {
		avatarUrl?: string;
		bio?: string;
		phone?: string;
		venmoUsername?: string;
	};
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
	const { user: clerkUser, isLoaded } = useUser();
	const { signOut } = useClerkAuth();

	// Transform Clerk user to your app's user format
	const user: User | null = clerkUser
		? {
				id: clerkUser.id,
				email: clerkUser.emailAddresses[0]?.emailAddress || '',
				name: clerkUser.fullName || clerkUser.firstName || 'User',
				role:
					(clerkUser.publicMetadata?.role as 'CHEF' | 'ATTENDEE') ||
					'ATTENDEE',
				profile: {
					avatarUrl: clerkUser.imageUrl,
					bio: clerkUser.publicMetadata?.bio as string,
					phone: clerkUser.phoneNumbers[0]?.phoneNumber,
					venmoUsername: clerkUser.publicMetadata
						?.venmoUsername as string
				}
		  }
		: null;

	const logout = async () => {
		await signOut();
	};

	const value: AuthContextType = {
		user,
		isLoading: !isLoaded,
		isAuthenticated: !!clerkUser,
		logout
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within a ClerkAuthProvider');
	}
	return context;
}

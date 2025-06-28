import { Navigation } from '@/components/Navigation';

export default function ChangelogPage() {
	return (
		<div className='min-h-screen bg-theme-primary'>
			<Navigation />
			<div className='container mx-auto px-4 py-8 max-w-4xl mt-16'>
				<header className='mb-8'>
					<h1 className='text-4xl font-bold text-theme-primary mb-4'>
						Changelog
					</h1>
					<p className='text-lg text-theme-muted'>
						Track the latest updates, new features, and improvements
						to Family Dinner.
					</p>
				</header>

				<div className='space-y-8'>
					{/* Latest Updates */}
					<section className='bg-theme-secondary rounded-lg p-6'>
						<h2 className='text-2xl font-semibold text-theme-primary mb-4'>
							🚀 Latest Updates
						</h2>

						<div className='space-y-6'>
							<div className='border-l-4 border-blue-500 pl-4'>
								<div className='flex items-center gap-2 mb-2'>
									<span className='text-sm font-medium text-blue-600 dark:text-blue-400'>
										June 28, 2025
									</span>
									<span className='px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full'>
										Fix
									</span>
								</div>
								<h3 className='text-lg font-medium text-theme-primary mb-1'>
									Enhanced Route Handling & Event Forms
								</h3>
								<p className='text-theme-muted'>
									Updated Next.js route parameters to async
									for better performance and fixed event form
									initialization issues.
								</p>
							</div>

							<div className='border-l-4 border-green-500 pl-4'>
								<div className='flex items-center gap-2 mb-2'>
									<span className='text-sm font-medium text-green-600 dark:text-green-400'>
										June 27, 2025
									</span>
									<span className='px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full'>
										Feature
									</span>
								</div>
								<h3 className='text-lg font-medium text-theme-primary mb-1'>
									Comprehensive Dashboard Event Management
								</h3>
								<p className='text-theme-muted'>
									Added powerful event management actions to
									the dashboard, making it easier for chefs to
									organize and track their dinner events.
								</p>
							</div>

							<div className='border-l-4 border-purple-500 pl-4'>
								<div className='flex items-center gap-2 mb-2'>
									<span className='text-sm font-medium text-purple-600 dark:text-purple-400'>
										June 26, 2025
									</span>
									<span className='px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full'>
										Enhancement
									</span>
								</div>
								<h3 className='text-lg font-medium text-theme-primary mb-1'>
									Improved Theme System
								</h3>
								<p className='text-theme-muted'>
									Implemented a centralized theme system with
									consistent styling across all components for
									a better user experience.
								</p>
							</div>
						</div>
					</section>

					{/* Community Contributions */}
					<section className='bg-theme-secondary rounded-lg p-6'>
						<h2 className='text-2xl font-semibold text-theme-primary mb-4'>
							💡 Community Contributions
						</h2>
						<p className='text-theme-muted mb-4'>
							We love hearing from our users! Here are some great
							suggestions from the community that are helping
							shape the future of Family Dinner.
						</p>

						<div className='bg-theme-card rounded-lg p-4 border border-theme-primary'>
							<div className='flex items-start gap-3'>
								<div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm'>
									A
								</div>
								<div className='flex-1'>
									<div className='flex items-center gap-2 mb-1'>
										<span className='font-medium text-theme-primary'>
											Adam
										</span>
										<span className='text-sm text-theme-subtle'>
											• Suggested
										</span>
									</div>
									<h4 className='font-medium text-theme-primary mb-1'>
										Pre-populate User Data in RSVP Forms
									</h4>
									<p className='text-sm text-theme-muted mb-2'>
										&quot;It would be great if the RSVP form
										could automatically fill in my name and
										email since I&apos;m already signed in,
										instead of asking me to provide this
										information again.&quot;
									</p>
									<div className='flex items-center gap-2'>
										<span className='px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full'>
											✓ Implemented
										</span>
										<span className='text-xs text-theme-subtle'>
											Thanks for the great suggestion,
											Adam! 🎉
										</span>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Upcoming Features */}
					<section className='bg-theme-secondary rounded-lg p-6'>
						<h2 className='text-2xl font-semibold text-theme-primary mb-4'>
							🔮 What&apos;s Coming Next
						</h2>
						<div className='grid gap-4 md:grid-cols-2'>
							<div className='bg-theme-card rounded-lg p-4 border border-theme-primary'>
								<h4 className='font-medium text-theme-primary mb-2'>
									Smart RSVP Forms
								</h4>
								<p className='text-sm text-theme-muted'>
									Pre-populated user information for faster
									RSVPs
								</p>
							</div>
							<div className='bg-theme-card rounded-lg p-4 border border-theme-primary'>
								<h4 className='font-medium text-theme-primary mb-2'>
									Enhanced Notifications
								</h4>
								<p className='text-sm text-theme-muted'>
									Better event reminders and updates
								</p>
							</div>
							<div className='bg-theme-card rounded-lg p-4 border border-theme-primary'>
								<h4 className='font-medium text-theme-primary mb-2'>
									Pot Luck Feature
								</h4>
								<p className='text-sm text-theme-muted'>
									Sign-up system for pot luck dinners to
									coordinate dishes and avoid duplicate items
								</p>
							</div>
							<div className='bg-theme-card rounded-lg p-4 border border-theme-primary'>
								<h4 className='font-medium text-theme-primary mb-2'>
									Recipe Sharing
								</h4>
								<p className='text-sm text-theme-muted'>
									Share your favorite recipes with the
									community
								</p>
							</div>
						</div>
					</section>

					{/* Feedback Section */}
					<section className='bg-theme-secondary rounded-lg p-6'>
						<h2 className='text-2xl font-semibold text-theme-primary mb-4'>
							📝 Share Your Ideas
						</h2>
						<p className='text-theme-muted mb-4'>
							Have a suggestion or found a bug? We&apos;d love to
							hear from you! Your feedback helps make Family
							Dinner Planning better for everyone.
						</p>
						<div className='flex flex-col sm:flex-row gap-3'>
							<a
								href='mailto:buford@familydinner.me'
								className='inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors'
							>
								Send Feedback
							</a>
							<a
								href='https://github.com/bufordeeds/family-dinner/issues'
								className='inline-flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors'
							>
								Report a Bug
							</a>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

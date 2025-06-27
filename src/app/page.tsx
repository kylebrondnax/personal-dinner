import { Navigation } from '@/components/Navigation';

export default function Home() {
	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors'>
			<Navigation />
			{/* Hero Section */}
			<div className='max-w-7xl mx-auto px-4 pt-24 pb-20 relative'>
				<div className='text-center'>
					<h1 className='text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6'>
						Let's Cook & Eat
						<span className='text-blue-600 block'>
							Together
						</span>
					</h1>
					<p className='text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed'>
						Connect with family and friends over home-cooked meals.
						Share the joy of cooking, split the costs, and create
						memories around the dinner table.
					</p>

					<div className='flex flex-col sm:flex-row gap-4 justify-center mb-16'>
						<a
							href='/browse'
							className='px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg'
						>
							Find a Dinner
						</a>
						<a
							href='/create-event'
							className='px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-colors border-2 border-blue-600'
						>
							Host a Dinner
						</a>
					</div>

				</div>
			</div>

			{/* How It Works */}
			<div className='bg-white dark:bg-gray-800 py-20'>
				<div className='max-w-7xl mx-auto px-4'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
							How It Works
						</h2>
						<p className='text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
							Whether you want to join a dinner or host one,
							it's easy to get started.
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
						{/* For Attendees */}
						<div>
							<h3 className='text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center'>
								Want to Join a Dinner?
							</h3>
							<div className='space-y-6'>
								<div className='flex gap-4'>
									<div className='w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold'>
										1
									</div>
									<div>
										<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
											Browse Upcoming Dinners
										</h4>
										<p className='text-gray-600 dark:text-gray-300'>
											See what friends and family are
											cooking and when they're hosting.
										</p>
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold'>
										2
									</div>
									<div>
										<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
											Reserve Your Spot
										</h4>
										<p className='text-gray-600 dark:text-gray-300'>
											Let them know you're coming!
											You'll see the estimated cost upfront.
										</p>
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold'>
										3
									</div>
									<div>
										<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
											Enjoy & Connect
										</h4>
										<p className='text-gray-600 dark:text-gray-300'>
											Show up and enjoy great food with
											people you care about.
										</p>
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold'>
										4
									</div>
									<div>
										<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
											Split the Cost
										</h4>
										<p className='text-gray-600 dark:text-gray-300'>
											Pay your share of the ingredients.
											No more awkward money conversations!
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* For Chefs */}
						<div>
							<h3 className='text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center'>
								Want to Host?
							</h3>
							<div className='space-y-6'>
								<div className='flex gap-4'>
									<div className='w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold'>
										1
									</div>
									<div>
										<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
											Plan Your Menu
										</h4>
										<p className='text-gray-600 dark:text-gray-300'>
											Decide what you want to cook and
											how many people you can feed.
										</p>
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold'>
										2
									</div>
									<div>
										<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
											Cook & Enjoy
										</h4>
										<p className='text-gray-600 dark:text-gray-300'>
											Make your delicious meal and enjoy
											it with friends and family.
										</p>
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold'>
										3
									</div>
									<div>
										<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
											Upload Your Receipt
										</h4>
										<p className='text-gray-600 dark:text-gray-300'>
											Just snap a photo of your grocery
											receipt when you're done shopping.
										</p>
									</div>
								</div>
								<div className='flex gap-4'>
									<div className='w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold'>
										4
									</div>
									<div>
										<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
											Get Reimbursed
										</h4>
										<p className='text-gray-600 dark:text-gray-300'>
											We'll send payment requests to
											everyone for their share.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Simple Benefits */}
			<div className='bg-gray-50 dark:bg-gray-900 py-20'>
				<div className='max-w-7xl mx-auto px-4'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
							Why We Love This
						</h2>
						<p className='text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
							Dinner is better when we're together, and nobody
							should have to cook alone or break the bank.
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
						<div className='bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center'>
							<div className='text-4xl mb-4'>🏠</div>
							<h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-3'>
								Home Cooking
							</h3>
							<p className='text-gray-600 dark:text-gray-300'>
								Taste the love that goes into every
								home-cooked meal made with care.
							</p>
						</div>

						<div className='bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center'>
							<div className='text-4xl mb-4'>💙</div>
							<h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-3'>
								Family & Friends
							</h3>
							<p className='text-gray-600 dark:text-gray-300'>
								Spend quality time with the people you
								care about most.
							</p>
						</div>

						<div className='bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center'>
							<div className='text-4xl mb-4'>💸</div>
							<h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-3'>
								Split the Cost
							</h3>
							<p className='text-gray-600 dark:text-gray-300'>
								Enjoy great meals together without
								breaking the bank.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className='bg-blue-600 py-20'>
				<div className='max-w-4xl mx-auto px-4 text-center'>
					<h2 className='text-4xl font-bold text-white mb-4'>
						Ready to Get Started?
					</h2>
					<p className='text-xl text-blue-100 mb-8'>
						Whether you love to cook or love to eat,
						let's make dinner better together.
					</p>

					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<a
							href='/browse'
							className='px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-colors'
						>
							See What's Cooking
						</a>
						<a
							href='/create-event'
							className='px-8 py-4 bg-blue-700 text-white text-lg font-semibold rounded-xl hover:bg-blue-800 transition-colors border-2 border-blue-400'
						>
							Host a Dinner
						</a>
					</div>
				</div>
			</div>

			{/* Chef Tools Section */}
			<div
				id='chef-section'
				className='bg-gray-100 dark:bg-gray-800 py-20'
			>
				<div className='max-w-4xl mx-auto px-4'>
					<div className='text-center mb-12'>
						<h2 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
							For Hosts
						</h2>
						<p className='text-xl text-gray-600 dark:text-gray-300'>
							We're working on tools to make hosting
							even easier for you.
						</p>
					</div>

					<div className='bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-8'>
						<p className='text-center text-gray-600 dark:text-gray-300 mb-6'>
							🚧 More hosting tools coming soon! In the meantime,
							you can start creating dinners right away.
						</p>
						<div className='flex justify-center'>
							<a
								href='/create-event'
								className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
							>
								Create Your First Dinner
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className='bg-gray-800 py-12'>
				<div className='max-w-4xl mx-auto px-4 text-center'>
					<p className='text-gray-300 mb-2'>
						Questions, feedback, or need help?
					</p>
					<p className='text-gray-400'>
						Reach out to{' '}
						<a
							href='mailto:buford@familydinner.me'
							className='text-blue-400 hover:text-blue-300 transition-colors'
						>
							buford@familydinner.me
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { Navigation } from '@/components/Navigation';
import { AvailabilityPollSection } from '@/components/AvailabilityPollSection';
import { EventFormDataWithPolling, ProposedDateTime } from '@/types';

const cuisineOptions = [
	'American',
	'Italian',
	'French',
	'Mexican',
	'Chinese',
	'Japanese',
	'Korean',
	'Thai',
	'Indian',
	'Mediterranean',
	'Greek',
	'Spanish',
	'BBQ',
	'Comfort Food',
	'Vegetarian',
	'Vegan',
	'Seafood',
	'Farm-to-Table'
];

const dietaryOptions = [
	'Vegetarian',
	'Vegan',
	'Gluten-free options',
	'Dairy-free options',
	'Nut-free options',
	'Pescatarian options',
	'Halal',
	'Kosher'
];

export default function CreateEventPage() {
	const { user, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const [formData, setFormData] = useState<EventFormDataWithPolling>({
		title: '',
		description: '',
		date: '',
		time: '',
		duration: 180, // 3 hours default
		maxCapacity: 6,
		estimatedCostPerPerson: 50,
		cuisineTypes: [],
		dietaryAccommodations: [],
		location: {
			address: '',
			neighborhood: '',
			city: 'San Antonio',
			showFullAddress: false
		},
		reservationDeadline: '',
		// Polling fields
		useAvailabilityPoll: false,
		pollDeadline: '',
		pollDateRange: {
			startDate: '',
			endDate: ''
		},
		chefAvailability: []
	});

	// Redirect if not authenticated
	useEffect(() => {
		if (!authLoading && !user) {
			router.push('/auth/login');
		}
	}, [user, authLoading, router]);

	// Set default reservation deadline to 1 day before event
	useEffect(() => {
		if (formData.date) {
			const eventDate = new Date(formData.date);
			const deadline = new Date(eventDate);
			deadline.setDate(deadline.getDate() - 1);
			setFormData((prev) => ({
				...prev,
				reservationDeadline: deadline.toISOString().split('T')[0]
			}));
		}
	}, [formData.date]);

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value, type } = e.target;

		if (name.startsWith('location.')) {
			const locationField = name.split('.')[1];
			setFormData((prev) => ({
				...prev,
				location: {
					...prev.location,
					[locationField]:
						type === 'checkbox'
							? (e.target as HTMLInputElement).checked
							: value
				}
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: type === 'number' ? Number(value) : value
			}));
		}
		setError('');
	};

	// Handlers for availability polling
	const handlePollToggle = (enabled: boolean) => {
		setFormData((prev) => ({ ...prev, useAvailabilityPoll: enabled }));
	};

	const handlePollDeadlineChange = (deadline: string) => {
		setFormData((prev) => ({ ...prev, pollDeadline: deadline }));
	};

	const handlePollDateRangeChange = (range: {
		startDate: string;
		endDate: string;
	}) => {
		setFormData((prev) => ({ ...prev, pollDateRange: range }));
	};

	const handleChefAvailabilityChange = (availability: ProposedDateTime[]) => {
		setFormData((prev) => ({ ...prev, chefAvailability: availability }));
	};

	const handleCheckboxChange = (
		field: 'cuisineTypes' | 'dietaryAccommodations',
		value: string
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: prev[field].includes(value)
				? prev[field].filter((item) => item !== value)
				: [...prev[field], value]
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			// Validation - different requirements for polling vs regular events
			if (!formData.title) {
				throw new Error('Please enter a dinner title');
			}

			if (!formData.useAvailabilityPoll) {
				// Regular event validation
				if (!formData.date || !formData.time) {
					throw new Error(
						'Please set a date and time for your dinner'
					);
				}
			}

			if (formData.cuisineTypes.length === 0) {
				throw new Error('Please select at least one cuisine type');
			}

			const now = new Date();

			if (!formData.useAvailabilityPoll) {
				// Regular event date validation
				const eventDateTime = new Date(
					`${formData.date}T${formData.time}`
				);

				if (eventDateTime <= now) {
					throw new Error('Event date must be in the future');
				}

				const deadlineDate = new Date(formData.reservationDeadline);
				if (deadlineDate >= eventDateTime) {
					throw new Error(
						'Reservation deadline must be before the event date'
					);
				}
			}

			// Additional validation for availability polling
			if (formData.useAvailabilityPoll) {
				if (!formData.pollDeadline) {
					throw new Error('Please set a poll deadline');
				}
				if (
					!formData.pollDateRange.startDate ||
					!formData.pollDateRange.endDate
				) {
					throw new Error(
						'Please set both start and end dates for the poll range'
					);
				}

				const pollDeadlineDate = new Date(formData.pollDeadline);
				if (pollDeadlineDate <= now) {
					throw new Error('Poll deadline must be in the future');
				}

				const startDate = new Date(formData.pollDateRange.startDate);
				const endDate = new Date(formData.pollDateRange.endDate);
				if (startDate >= endDate) {
					throw new Error('Poll end date must be after start date');
				}

				if (formData.chefAvailability.length === 0) {
					throw new Error(
						'Please mark your availability on the calendar before creating the poll'
					);
				}
			}

			// Prepare API request data
			const eventData = {
				title: formData.title,
				description: formData.description,
				date: `${formData.date}T${formData.time}`,
				duration: formData.duration,
				maxCapacity: formData.maxCapacity,
				estimatedCostPerPerson: formData.estimatedCostPerPerson,
				chefId: user!.id, // From auth context
				chefName: user!.name,
				chefEmail: user!.email,
				cuisineTypes: formData.cuisineTypes,
				dietaryAccommodations: formData.dietaryAccommodations,
				reservationDeadline: formData.reservationDeadline,
				location: formData.location,
				// Include polling data
				useAvailabilityPoll: formData.useAvailabilityPoll,
				pollDeadline: formData.pollDeadline,
				pollDateRange: formData.pollDateRange,
				chefAvailability: formData.chefAvailability
			};

			// Create event via API
			const response = await fetch('/api/events', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(eventData)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || 'Failed to create event');
			}

			if (result.success) {
				// Redirect to dashboard with success
				router.push('/dashboard?created=true');
			} else {
				throw new Error(result.message || 'Failed to create event');
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to create event'
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (authLoading) {
		return (
			<>
				<Navigation />
				<div className='min-h-screen flex items-center justify-center'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4'></div>
						<p className='text-theme-muted'>Loading...</p>
					</div>
				</div>
			</>
		);
	}

	if (!user) {
		return null; // Will redirect
	}

	return (
		<>
			<Navigation />
			<div className='max-w-3xl mx-auto p-4 pt-24'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-theme-primary mb-2'>
						Create New Dinner
					</h1>
					<p className='text-theme-muted'>
						Set up your dinner event and start connecting with food
						lovers
					</p>
				</div>

				{/* Form */}
				<div className='form-section'>
					{error && (
						<div className='mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
							<p className='text-red-600 dark:text-red-400 text-sm'>
								{error}
							</p>
						</div>
					)}
					<form onSubmit={handleSubmit} className='space-y-8'>
						{/* Basic Info */}
						<div>
							<h2 className='text-xl font-semibold text-theme-primary mb-4'>
								Basic Information
							</h2>
							<div className='space-y-4'>
								<div>
									<label
										htmlFor='title'
										className='block form-label mb-2'
									>
										Dinner Title *
									</label>
									<input
										type='text'
										id='title'
										name='title'
										value={formData.title}
										onChange={handleInputChange}
										required
										className='w-full px-3 py-3 border rounded-lg input-theme'
										placeholder='e.g., Homemade Italian Pasta Night'
									/>
								</div>

								<div>
									<label
										htmlFor='description'
										className='block form-label mb-2'
									>
										Description
									</label>
									<textarea
										id='description'
										name='description'
										value={formData.description}
										onChange={handleInputChange}
										rows={4}
										className='w-full px-3 py-3 border rounded-lg input-theme'
										placeholder='Describe your dinner, menu highlights, and what guests can expect...'
									/>
								</div>
							</div>
						</div>

						{/* Date & Time - Only show if polling is disabled */}
						{!formData.useAvailabilityPoll && (
							<div>
								<h2 className='text-xl font-semibold text-theme-primary mb-4'>
									Date & Time
								</h2>
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									<div>
										<label
											htmlFor='date'
											className='block form-label mb-2'
										>
											Date *
										</label>
										<input
											type='date'
											id='date'
											name='date'
											value={formData.date}
											onChange={handleInputChange}
											required
											min={
												new Date()
													.toISOString()
													.split('T')[0]
											}
											className='w-full px-3 py-3 border rounded-lg input-theme'
										/>
									</div>

									<div>
										<label
											htmlFor='time'
											className='block form-label mb-2'
										>
											Start Time *
										</label>
										<input
											type='time'
											id='time'
											name='time'
											value={formData.time}
											onChange={handleInputChange}
											required
											className='w-full px-3 py-3 border rounded-lg input-theme'
										/>
									</div>

									<div>
										<label
											htmlFor='duration'
											className='block form-label mb-2'
										>
											Duration (minutes)
										</label>
										<input
											type='number'
											id='duration'
											name='duration'
											value={formData.duration}
											onChange={handleInputChange}
											min='60'
											max='480'
											step='30'
											className='w-full px-3 py-3 border rounded-lg input-theme'
										/>
									</div>
								</div>
							</div>
						)}

						{/* Capacity & Pricing */}
						<div>
							<h2 className='text-xl font-semibold text-theme-primary mb-4'>
								Capacity & Pricing
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label
										htmlFor='maxCapacity'
										className='block form-label mb-2'
									>
										Max Guests
									</label>
									<input
										type='number'
										id='maxCapacity'
										name='maxCapacity'
										value={formData.maxCapacity}
										onChange={handleInputChange}
										min='2'
										max='20'
										className='w-full px-3 py-3 border rounded-lg input-theme'
									/>
								</div>

								<div>
									<label
										htmlFor='estimatedCostPerPerson'
										className='block form-label mb-2'
									>
										Estimated Cost per Person ($)
									</label>
									<input
										type='number'
										id='estimatedCostPerPerson'
										name='estimatedCostPerPerson'
										value={formData.estimatedCostPerPerson}
										onChange={handleInputChange}
										min='10'
										max='200'
										step='5'
										className='w-full px-3 py-3 border rounded-lg input-theme'
									/>
								</div>
							</div>
						</div>

						{/* Cuisine Types */}
						<div>
							<h2 className='text-xl font-semibold text-theme-primary mb-4'>
								Cuisine & Dietary Info
							</h2>
							<div className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-gray-900 dark:text-white mb-3'>
										Cuisine Types * (select all that apply)
									</label>
									<div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
										{cuisineOptions.map((cuisine) => (
											<label
												key={cuisine}
												className='flex items-center'
											>
												<input
													type='checkbox'
													checked={formData.cuisineTypes.includes(
														cuisine
													)}
													onChange={() =>
														handleCheckboxChange(
															'cuisineTypes',
															cuisine
														)
													}
													className='checkbox-theme'
												/>
												<span className='ml-2 text-sm text-theme-primary'>
													{cuisine}
												</span>
											</label>
										))}
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-900 dark:text-white mb-3'>
										Dietary Accommodations (optional)
									</label>
									<div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
										{dietaryOptions.map((option) => (
											<label
												key={option}
												className='flex items-center'
											>
												<input
													type='checkbox'
													checked={formData.dietaryAccommodations.includes(
														option
													)}
													onChange={() =>
														handleCheckboxChange(
															'dietaryAccommodations',
															option
														)
													}
													className='checkbox-theme'
												/>
												<span className='ml-2 text-sm text-theme-primary'>
													{option}
												</span>
											</label>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Location */}
						<div>
							<h2 className='text-xl font-semibold text-theme-primary mb-4'>
								Location
							</h2>
							<div className='space-y-4'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<label
											htmlFor='location.neighborhood'
											className='block form-label mb-2'
										>
											Neighborhood
										</label>
										<input
											type='text'
											id='location.neighborhood'
											name='location.neighborhood'
											value={
												formData.location.neighborhood
											}
											onChange={handleInputChange}
											className='w-full px-3 py-3 border rounded-lg input-theme'
											placeholder='e.g., Green Glen Acres'
										/>
									</div>

									<div>
										<label
											htmlFor='location.city'
											className='block form-label mb-2'
										>
											City
										</label>
										<input
											type='text'
											id='location.city'
											name='location.city'
											value={formData.location.city}
											onChange={handleInputChange}
											className='w-full px-3 py-3 border rounded-lg input-theme'
											placeholder='San Antonio'
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor='location.address'
										className='block form-label mb-2'
									>
										Full Address (private until booking
										confirmed)
									</label>
									<input
										type='text'
										id='location.address'
										name='location.address'
										value={formData.location.address}
										onChange={handleInputChange}
										className='w-full px-3 py-3 border rounded-lg input-theme'
										placeholder='123 Main St, San Antonio, TX 78253'
									/>
								</div>
							</div>
						</div>

						{/* Reservation Deadline - Only show if polling is disabled */}
						{!formData.useAvailabilityPoll && (
							<div>
								<h2 className='text-xl font-semibold text-theme-primary mb-4'>
									Reservation Settings
								</h2>
								<div>
									<label
										htmlFor='reservationDeadline'
										className='block form-label mb-2'
									>
										Reservation Deadline
									</label>
									<input
										type='date'
										id='reservationDeadline'
										name='reservationDeadline'
										value={formData.reservationDeadline}
										onChange={handleInputChange}
										max={formData.date}
										className='w-full px-3 py-3 border rounded-lg input-theme'
									/>
									<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
										Guests must RSVP by this date
									</p>
								</div>
							</div>
						)}

						{/* Availability Polling Section */}
						<div>
							<h2 className='text-xl font-semibold text-theme-primary mb-4'>
								Availability Polling (Optional)
							</h2>
							<AvailabilityPollSection
								enabled={formData.useAvailabilityPoll}
								onToggle={handlePollToggle}
								pollDeadline={formData.pollDeadline}
								onDeadlineChange={handlePollDeadlineChange}
								pollDateRange={formData.pollDateRange}
								onDateRangeChange={handlePollDateRangeChange}
								chefAvailability={formData.chefAvailability}
								onChefAvailabilityChange={
									handleChefAvailabilityChange
								}
							/>
						</div>

						{/* Error Message */}
						{error && (
							<div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
								<p className='text-sm text-red-600 dark:text-red-400'>
									{error}
								</p>
							</div>
						)}

						{/* Actions */}
						<div className='flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700'>
							<button
								type='submit'
								disabled={isLoading}
								className='flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
							>
								{isLoading ? (
									<div className='flex items-center justify-center'>
										<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
										Creating Dinner...
									</div>
								) : (
									'Create Dinner'
								)}
							</button>

							<button
								type='button'
								onClick={() => router.push('/dashboard')}
								className='py-3 px-6 btn-cancel rounded-lg font-medium transition-colors'
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}

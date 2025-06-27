'use client'

import { useTheme } from '@/contexts/ThemeContext'

export function HomePage() {
  const { resolvedTheme } = useTheme()

  // Theme-aware classes with better contrast
  const headingClasses = resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
  const subheadingClasses = resolvedTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
  const textClasses = resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  const sectionBgClasses = resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const cardBgClasses = resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-white'
  const borderClasses = resolvedTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'

  return (
    <>
      {/* Hero Section */}
      <div className='max-w-7xl mx-auto px-4 pt-24 pb-20 relative'>
        <div className='text-center'>
          <h1 className={`text-5xl md:text-6xl font-bold ${headingClasses} mb-6`}>
            Let&apos;s Cook & Eat
            <span className='text-blue-600 block'>
              Together
            </span>
          </h1>
          <p className={`text-xl md:text-2xl ${subheadingClasses} max-w-3xl mx-auto mb-12 leading-relaxed`}>
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
              className={`px-8 py-4 ${resolvedTheme === 'dark' ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' : 'bg-white text-blue-600 hover:bg-gray-50'} text-lg font-semibold rounded-xl transition-colors border-2 border-blue-600`}
            >
              Host a Dinner
            </a>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className={`${sectionBgClasses} py-20`}>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className={`text-4xl font-bold ${headingClasses} mb-4`}>
              How It Works
            </h2>
            <p className={`text-xl ${textClasses} max-w-2xl mx-auto`}>
              Whether you want to join a dinner or host one,
              getting started is simple and fun.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {/* For Guests */}
            <div className={`${cardBgClasses} p-8 rounded-2xl shadow-lg border ${borderClasses}`}>
              <div className='text-4xl mb-6'>👤</div>
              <h3 className={`text-2xl font-bold ${headingClasses} mb-4`}>For Guests</h3>
              <ul className={`${textClasses} space-y-3`}>
                <li className='flex items-start'>
                  <span className='text-green-500 mr-2'>✓</span>
                  Browse dinner events in your area
                </li>
                <li className='flex items-start'>
                  <span className='text-green-500 mr-2'>✓</span>
                  RSVP and split costs automatically
                </li>
                <li className='flex items-start'>
                  <span className='text-green-500 mr-2'>✓</span>
                  Enjoy great food and company
                </li>
                <li className='flex items-start'>
                  <span className='text-green-500 mr-2'>✓</span>
                  Meet new people in your community
                </li>
              </ul>
            </div>

            {/* For Hosts */}
            <div className={`${cardBgClasses} p-8 rounded-2xl shadow-lg border ${borderClasses}`}>
              <div className='text-4xl mb-6'>👨‍🍳</div>
              <h3 className={`text-2xl font-bold ${headingClasses} mb-4`}>For Hosts</h3>
              <ul className={`${textClasses} space-y-3`}>
                <li className='flex items-start'>
                  <span className='text-green-500 mr-2'>✓</span>
                  Create dinner events with your menu
                </li>
                <li className='flex items-start'>
                  <span className='text-green-500 mr-2'>✓</span>
                  Set participant limits and pricing
                </li>
                <li className='flex items-start'>
                  <span className='text-green-500 mr-2'>✓</span>
                  Share cooking costs with guests
                </li>
                <li className='flex items-start'>
                  <span className='text-green-500 mr-2'>✓</span>
                  Build your cooking community
                </li>
              </ul>
            </div>

            {/* For Everyone */}
            <div className={`${cardBgClasses} p-8 rounded-2xl shadow-lg border ${borderClasses}`}>
              <div className='text-4xl mb-6'>🍽️</div>
              <h3 className={`text-2xl font-bold ${headingClasses} mb-4`}>For Everyone</h3>
              <ul className={`${textClasses} space-y-3`}>
                <li className='flex items-start'>
                  <span className='text-green-500 mr-2'>✓</span>
                  Safe, verified community members
                </li>
                <li className='flex items-start'>
                  <span className='text-green-500 mr-2'>✓</span>
                  Transparent pricing and reviews
                </li>
                <li className='flex items-start'>
                  <span className='text-green-500 mr-2'>✓</span>
                  Easy messaging and coordination
                </li>
                <li className='flex items-start'>
                  <span className='text-green-500 mr-2'>✓</span>
                  Create lasting friendships
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
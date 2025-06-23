import { ThemeToggle } from '@/components/ThemeToggle'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-20 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Share Amazing
            <span className="text-blue-600 block">Family Dinners</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
            Connect passionate home chefs with food lovers in your community. 
            Split costs fairly, discover incredible meals, and build lasting friendships around the dinner table.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="/browse"
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Find a Dinner
            </a>
            <a
              href="#chef-section"
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-colors border-2 border-blue-600"
            >
              Host a Dinner
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Amazing Dinners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Talented Chefs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">$75</div>
              <div className="text-gray-600">Average Cost</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How Family Dinner Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple, transparent, and delicious. Here's how we bring people together over incredible food.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* For Attendees */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">For Food Lovers</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Browse Amazing Dinners</h4>
                    <p className="text-gray-600 dark:text-gray-300">Discover unique dining experiences from talented home chefs in your area.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Reserve Your Spot</h4>
                    <p className="text-gray-600 dark:text-gray-300">See exactly what you'll pay upfront. No hidden fees, no surprises.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Enjoy & Connect</h4>
                    <p className="text-gray-600 dark:text-gray-300">Share an incredible meal and make new friends around the dinner table.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pay Your Fair Share</h4>
                    <p className="text-gray-600 dark:text-gray-300">Split costs automatically based on actual ingredients. Fair and transparent.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Chefs */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">For Home Chefs</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Create Your Dinner</h4>
                    <p className="text-gray-600 dark:text-gray-300">Plan your menu, set capacity, and estimate costs for your guests.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Welcome Your Guests</h4>
                    <p className="text-gray-600 dark:text-gray-300">Host amazing people who appreciate good food and great company.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Upload Your Receipt</h4>
                    <p className="text-gray-600 dark:text-gray-300">Simply take a photo of your grocery receipt. We'll handle the rest.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Get Paid Instantly</h4>
                    <p className="text-gray-600 dark:text-gray-300">Automatic Venmo requests sent to guests. No awkward money conversations.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Family Dinner */}
      <div className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Family Dinner?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              More than just a meal-sharing app. We're building a community of food lovers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Transparent Pricing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                See exact costs upfront. Pay only for ingredients, never inflated restaurant prices.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Trusted Community</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Vetted chefs and verified guests. Build lasting friendships over shared meals.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Unique Experiences</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Discover cuisines and cooking styles you'll never find in restaurants.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Join the Table?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Whether you're a passionate cook or a food lover, there's a place for you at Family Dinner.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/browse"
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Find Your Next Dinner
            </a>
            <a
              href="#chef-section"
              className="px-8 py-4 bg-blue-700 text-white text-lg font-semibold rounded-xl hover:bg-blue-800 transition-colors border-2 border-blue-400"
            >
              Start Hosting
            </a>
          </div>
        </div>
      </div>

      {/* Chef Tools Section */}
      <div id="chef-section" className="bg-gray-100 dark:bg-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Chef Tools</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to host amazing dinners and manage payments seamlessly.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-8">
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              🚧 Chef tools coming soon! Sign up to be notified when they're ready.
            </p>
            <div className="flex justify-center">
              <a
                href="/browse"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Dinners Instead
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

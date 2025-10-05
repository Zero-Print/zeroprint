import { ZPButton } from '@/components/ui/ZPButton';
import { ZPNav } from '@/components/ui/ZPNav';
import Link from 'next/link';
import { installNetworkInterceptor } from '@/lib/networkInterceptor';

export default function Home() {
  if (typeof window !== 'undefined') {
    installNetworkInterceptor();
  }
  const navItems = [
    { label: 'Games', href: '/games' },
    { label: 'Wallet', href: '/wallet' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ];

  const sustainabilityCategories = [
    {
      icon: '☀️',
      title: 'Solar',
      description: 'Adopt rooftop solar, save energy',
      color: 'text-yellow-600'
    },
    {
      icon: '♻️',
      title: 'Waste',
      description: 'Segregate waste, earn HealCoins',
      color: 'text-green-600'
    },
    {
      icon: '🚌',
      title: 'Transport',
      description: 'Shift to EV/public transport',
      color: 'text-blue-600'
    },
    {
      icon: '🍃',
      title: 'Energy',
      description: 'Reduce energy consumption',
      color: 'text-green-500'
    },
    {
      icon: '🏗️',
      title: 'Oil & Gas',
      description: 'Use alternative fuels',
      color: 'text-red-500'
    },
    {
      icon: '🏠',
      title: 'Housing',
      description: 'Build sustainable homes',
      color: 'text-blue-500'
    },
  ];

  return (
    <div className="min-h-screen bg-white ">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ZeroPrint</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <ZPButton variant="outline" size="sm">
                  Login
                </ZPButton>
              </Link>
              <Link href="/auth/signup">
                <ZPButton variant="primary" size="sm">
                  Sign Up
                </ZPButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Play. Save. Earn.
                <br />
                <span className="text-green-600">Heal the Planet.</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Gamified sustainability for citizens, schools, and MSMEs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <ZPButton variant="primary" size="lg" className="w-full sm:w-auto">
                    Get Started
                  </ZPButton>
                </Link>
                <Link href="/leaderboard">
                  <ZPButton variant="secondary" size="lg" className="w-full sm:w-auto">
                    View Leaderboard
                  </ZPButton>
                </Link>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-200 to-green-200 rounded-full w-96 h-96 mx-auto relative overflow-hidden">
                {/* City Illustration */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                  {/* Buildings */}
                  <div className="flex items-end space-x-2">
                    <div className="w-12 h-20 bg-yellow-400 rounded-t-lg"></div>
                    <div className="w-16 h-32 bg-green-500 rounded-t-lg"></div>
                    <div className="w-10 h-16 bg-blue-400 rounded-t-lg"></div>
                    <div className="w-14 h-24 bg-teal-400 rounded-t-lg"></div>
                  </div>
                  
                  {/* Trees */}
                  <div className="absolute -bottom-2 left-0 right-0 flex justify-around">
                    <div className="w-8 h-8 bg-green-600 rounded-full"></div>
                    <div className="w-6 h-6 bg-green-700 rounded-full"></div>
                    <div className="w-8 h-8 bg-green-600 rounded-full"></div>
                  </div>
                  
                  {/* Car */}
                  <div className="absolute -bottom-1 right-4 w-8 h-4 bg-green-600 rounded"></div>
                </div>
                
                {/* Sun */}
                <div className="absolute top-8 right-8 w-12 h-12 bg-yellow-400 rounded-full"></div>
                
                {/* Clouds */}
                <div className="absolute top-12 left-8 w-16 h-8 bg-white rounded-full opacity-80"></div>
                <div className="absolute top-20 right-12 w-12 h-6 bg-white rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Transform Your Impact
            </h2>
            <p className="text-xl text-gray-600">
              Discover sustainable actions that make a difference
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sustainabilityCategories.map((category, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className={`text-6xl mb-4 ${category.color} group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {category.title}
                </h3>
                <p className="text-gray-600">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Sustainability Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of users making a positive impact
          </p>
          <Link href="/auth/signup">
            <ZPButton variant="secondary" size="lg">
              Join ZeroPrint Today
            </ZPButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">Z</span>
                </div>
                <span className="font-bold">ZeroPrint</span>
              </div>
              <p className="text-gray-400">
                India&apos;s first AI-powered sustainability engagement platform
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/games" className="hover:text-white transition-colors">Games</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
                <li><Link href="/wallet" className="hover:text-white transition-colors">Wallet</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Get in Touch</h4>
              <p className="text-gray-400 mb-2">hello@zeroprint.in</p>
              <p className="text-gray-400">+91 98765 43210</p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              Powered by ZeroPrint • Built for a sustainable India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

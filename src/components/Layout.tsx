import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Code, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import NotificationsDropdown from './NotificationsDropdown'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const { unreadCount } = useChat()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      setSidebarOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    ...(user
      ? [
          { name: 'Dashboard', path: '/dashboard' },
        //  { name: 'Friends', path: '/friends' },
        //  { name: 'Chat', path: '/chat' },
          { name: 'Explore', path: '/explore' },
          { name: 'My Profile', path: '/my-profile' },
        ]
      : []),
  ]

  return (
    <div
      className="min-h-screen font-mono transition-colors duration-500 ease-in-out 
      bg-gradient-to-r from-gray-950 via-blue-950 to-blue-900"
    >
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 
        bg-black/40 backdrop-blur-xl 
        border-r border-blue-800/40 shadow-[0_0_15px_rgba(59,130,246,0.3)] 
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-300 ease-in-out z-30 rounded-r-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo + Close */}
          <div className="flex items-center justify-between p-4 border-b border-blue-800/40">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
              <Code className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white tracking-wide">
                CodeShare
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-blue-900/30 md:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                ${
                  isActive(link.path)
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.7)]'
                    : 'bg-blue-950/30 border-blue-800 text-gray-300 hover:bg-blue-900/50 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Notifications */}
            {user && (
              <div className="mt-auto pt-4 border-t border-blue-800/40">
                <NotificationsDropdown />
              </div>
            )}

            {/* Logout */}
            {user && (
              <button
                onClick={handleSignOut}
                className="mt-4 px-4 py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/40 transition"
              >
                <LogOut className="inline h-4 w-4 mr-1" /> Logout
              </button>
            )}

            {/* Auth Links (Visible in Sidebar for Mobile) */}
            {!user && (
              <div className="mt-6 flex flex-col space-y-2 md:hidden">
                <Link
                  to="/login"
                  onClick={() => setSidebarOpen(false)}
                  className="text-sm font-medium text-gray-300 hover:text-white transition px-4 py-2 rounded-lg bg-blue-950/40 hover:bg-blue-900/60"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setSidebarOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Top Navigation */}
      <nav
        className="backdrop-blur-lg bg-black/40 border-b border-blue-800/40
        shadow-[0_0_15px_rgba(59,130,246,0.25)] sticky top-0 z-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo + Sidebar Toggle */}
            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-blue-900/30 transition md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <Code className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                <span className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  CodeShare
                </span>
              </Link>
            </div>

            {/* Center Nav Links */}
            <div className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all 
                  ${
                    isActive(link.path)
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.7)]'
                      : 'bg-blue-950/30 border-blue-800 text-gray-300 hover:bg-blue-900/50 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Side (Auth + Notifications) */}
            <div className="hidden md:flex items-center space-x-4">
              {user && <NotificationsDropdown />}
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-gray-300 hover:text-white transition"
                >
                  <LogOut className="inline h-4 w-4 mr-1" /> Logout
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-300 hover:text-white transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        {children}
      </main>
    </div>
  )
}

export default Layout

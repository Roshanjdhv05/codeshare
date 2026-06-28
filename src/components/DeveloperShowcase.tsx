import React from 'react'
import { Code, Terminal, Zap, Database } from 'lucide-react'

const DeveloperShowcase: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-neon-blue dark:neon-text animate-glow">
          CodeShare
        </h1>
        <p className="text-lg text-gray-600 dark:text-blue-300 font-mono">
          Share code like a pro developer
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:terminal-card p-6 rounded-lg shadow-lg glow-on-hover transition-all duration-500">
          <div className="flex items-center space-x-3 mb-4">
            <Code className="h-8 w-8 text-blue-600 dark:text-neon-blue" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-neon-blue">
              Code Snippets
            </h3>
          </div>
          <p className="text-gray-600 dark:text-blue-300 font-mono text-sm">
            Share and discover code snippets with syntax highlighting and real-time collaboration.
          </p>
          <div className="mt-4 code-block">
            <code className="text-green-400">
              {`const share = () => {
  console.log('Hello, World!');
};`}
            </code>
          </div>
        </div>

        <div className="bg-white dark:terminal-card p-6 rounded-lg shadow-lg glow-on-hover transition-all duration-500">
          <div className="flex items-center space-x-3 mb-4">
            <Terminal className="h-8 w-8 text-blue-600 dark:text-neon-blue" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-neon-blue">
              Terminal Vibes
            </h3>
          </div>
          <p className="text-gray-600 dark:text-blue-300 font-mono text-sm">
            Experience a developer-first interface with monospace fonts and terminal aesthetics.
          </p>
          <div className="mt-4 code-block">
            <code className="text-neon-blue">
              {`$ npm install awesome
✓ Ready to code!`}
            </code>
          </div>
        </div>

        <div className="bg-white dark:terminal-card p-6 rounded-lg shadow-lg glow-on-hover transition-all duration-500">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-8 w-8 text-blue-600 dark:text-neon-blue" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-neon-blue">
              Lightning Fast
            </h3>
          </div>
          <p className="text-gray-600 dark:text-blue-300 font-mono text-sm">
            Built with React and optimized for performance. Share code at the speed of thought.
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-mono text-sm">System Online</span>
          </div>
        </div>

        <div className="bg-white dark:terminal-card p-6 rounded-lg shadow-lg glow-on-hover transition-all duration-500">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="h-8 w-8 text-blue-600 dark:text-neon-blue" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-neon-blue">
              Secure Storage
            </h3>
          </div>
          <p className="text-gray-600 dark:text-blue-300 font-mono text-sm">
            Your code is safely stored with Supabase. Access your snippets from anywhere.
          </p>
          <div className="mt-4 neon-border rounded p-2">
            <span className="text-neon-blue font-mono text-xs">
              🔒 End-to-end encrypted
            </span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-900 dark:bg-coder-dark border dark:neon-border rounded-lg p-4 font-mono text-sm">
        <div className="flex items-center justify-between text-green-400">
          <div className="flex items-center space-x-4">
            <span>● ONLINE</span>
            <span>CPU: 12%</span>
            <span>MEM: 256MB</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>⚡ Ready</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeveloperShowcase
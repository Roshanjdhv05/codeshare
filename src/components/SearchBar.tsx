import React from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
      <input
        type="text"
        placeholder="Search by username or name..."
        className="w-full pl-10 pr-4 py-2 rounded-md 
        border border-blue-800/50 
        bg-blue-950/40 text-blue-100 placeholder-blue-300/60 
        backdrop-blur-md
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
        shadow-[0_0_12px_rgba(59,130,246,0.25)] hover:shadow-[0_0_18px_rgba(59,130,246,0.35)] 
        transition-all duration-300"
        value={value}
        onChange={onChange}
        autoFocus
      />
    </div>
  )
}

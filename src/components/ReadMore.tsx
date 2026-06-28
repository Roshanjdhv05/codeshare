import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ReadMoreProps {
  text: string
  maxChars?: number
  className?: string
}

const ReadMore: React.FC<ReadMoreProps> = ({ 
  text, 
  maxChars = 150, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text || text.length <= maxChars) {
    return <p className={`text-white-700 dark:text-gray-300 ${className}`}>{text}</p>
  }

  const truncatedText = text.slice(0, maxChars).trim()
  const remainingText = text.slice(maxChars)

  return (
    <div className={className}>
      <p className="text-white-700 dark:text-gray-300">
        {isExpanded ? text : `${truncatedText}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors text-sm font-medium"
      >
        {isExpanded ? (
          <>
            <span>Read Less</span>
            <ChevronUp className="h-3 w-3" />
          </>
        ) : (
          <>
            <span>Read More</span>
            <ChevronDown className="h-3 w-3" />
          </>
        )}
      </button>
    </div>
  )
}

export default ReadMore
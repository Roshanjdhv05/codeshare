import React, { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface CodeBlockProps {
  code: string
  language: string
  title?: string
  showLineNumbers?: boolean
  showCopyButton?: boolean
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  title,
  showLineNumbers = false,
  showCopyButton = true,
}) => {
  const codeRef = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [code, language])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const getLanguageClass = (lang: string) => {
    const langMap: { [key: string]: string } = {
      'javascript': 'language-javascript',
      'typescript': 'language-typescript',
      'python': 'language-python',
      'css': 'language-css',
      'html': 'language-html',
      'sql': 'language-sql',
      'bash': 'language-bash',
      'json': 'language-json',
      'jsx': 'language-jsx',
      'tsx': 'language-tsx',
    }
    return langMap[lang.toLowerCase()] || 'language-text'
  }

  return (
    <div className="relative group">
      {title && (
        <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium rounded-t-lg border-b border-gray-700">
          {title}
        </div>
      )}
      
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md transition-colors opacity-0 group-hover:opacity-100 z-10"
            title="Copy code"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
        
        <pre className={`p-4 overflow-x-auto text-sm ${showLineNumbers ? 'line-numbers' : ''}`}>
          <code ref={codeRef} className={getLanguageClass(language)}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock 
import React, { useState } from 'react'
import { X, Copy, Check, FileText, ChevronDown, ChevronRight, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CodeBlock from './CodeBlock'

interface ParsedFile {
  name: string
  content: string
}

interface CodeModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  code: string
  language: string
  files?: ParsedFile[]
  isMultiFile?: boolean
}

const CodeModal: React.FC<CodeModalProps> = ({
  isOpen,
  onClose,
  title,
  code,
  language,
  files = [],
  isMultiFile = false,
}) => {
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set([0]))
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  if (!isOpen) return null

  const toggleFileExpansion = (index: number) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) newSet.delete(index)
      else newSet.add(index)
      return newSet
    })
  }

  const getFileLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const extensionMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'css': 'css',
      'html': 'html',
      'htm': 'html',
      'sql': 'sql',
      'sh': 'bash',
      'json': 'json',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'java': 'java',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'dart': 'dart',
    }
    return extensionMap[extension || ''] || language
  }

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handlePreview = () => {
    onClose()
    
    // If it's a multi-file snippet, try to extract HTML, CSS, and JS
    if (isMultiFile && files.length > 0) {
      const htmlFile = files.find(f => getFileLanguage(f.name) === 'html');
      const cssFile = files.find(f => getFileLanguage(f.name) === 'css');
      const jsFile = files.find(f => getFileLanguage(f.name) === 'javascript' || getFileLanguage(f.name) === 'typescript');
      
      if (htmlFile || cssFile || jsFile) {
        navigate('/compiler', { 
          state: { 
            language: 'web-project',
            htmlCode: htmlFile ? htmlFile.content : '',
            cssCode: cssFile ? cssFile.content : '',
            jsCode: jsFile ? jsFile.content : ''
          } 
        })
        return;
      }
    }

    navigate('/compiler', { 
      state: { 
        code: isMultiFile && files.length > 0 ? files[0].content : code, 
        language: isMultiFile && files.length > 0 ? getFileLanguage(files[0].name) : language 
      } 
    })
  }

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-transparent rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700/20">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/20">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-white truncate">{title}</h2>
            <p className="text-sm text-gray-300 mt-1">
              {isMultiFile ? `${files.length} files` : `${code.split('\n').length} lines`} • {code.length} characters
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600/80 text-white text-sm rounded-md hover:bg-blue-700/90 transition-colors"
              title="Preview or Run Code"
            >
              <Play className="h-4 w-4 mr-1" />
              Preview / Run
            </button>
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center px-3 py-1.5 bg-purple-600/80 text-white text-sm rounded-md hover:bg-purple-700/90 transition-colors"
              title="Copy all code"
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-md transition-colors"
              title="Close"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-5rem)] p-6 space-y-4">
          {isMultiFile && files.length > 0 ? (
            <div className="space-y-4">
              {files.map((file, index) => (
                <div key={index} className="border border-gray-700/20 rounded-lg overflow-hidden">
                  {/* File Header */}
                  <button
                    onClick={() => toggleFileExpansion(index)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/30 hover:bg-gray-900/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-300" />
                      <div>
                        <span className="font-medium text-white">{file.name}</span>
                        <div className="text-sm text-gray-400">
                          {file.content.split('\n').length} lines • {file.content.length} characters
                        </div>
                      </div>
                    </div>
                    {expandedFiles.has(index) ? (
                      <ChevronDown className="h-5 w-5 text-gray-300" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-300" />
                    )}
                  </button>
                  
                  {/* File Content */}
                  {expandedFiles.has(index) && (
                    <div className="border-t border-gray-700/20">
                      <CodeBlock
                        code={file.content}
                        language={getFileLanguage(file.name)}
                        showCopyButton={true}
                        title={file.name}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <CodeBlock
              code={code}
              language={language}
              showCopyButton={true}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CodeModal

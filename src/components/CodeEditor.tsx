import React, { useState, useEffect } from 'react'
import { Save, Play, Download, Copy, Check, FileText, Code2, Eye } from 'lucide-react'
import { useSnippets } from '../contexts/SnippetContext'
import CodeBlock from './CodeBlock'

interface CodeEditorProps {
  selectedFile: { folderId: string; fileId: string } | null
}

const CodeEditor: React.FC<CodeEditorProps> = ({ selectedFile }) => {
  const { folders, updateFile } = useSnippets()
  const [code, setCode] = useState('')
  const [fileName, setFileName] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const languages = [
    'javascript', 'typescript', 'python', 'css', 'html', 'sql', 'bash', 'json',
    'jsx', 'tsx', 'java', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'dart'
  ]

  // Load file content when selection changes
  useEffect(() => {
    if (selectedFile) {
      const folder = folders.find(f => f.id === selectedFile.folderId)
      const file = folder?.files.find(f => f.id === selectedFile.fileId)
      
      if (file) {
        setCode(file.content)
        setFileName(file.name)
        setLanguage(file.language)
        setHasUnsavedChanges(false)
      }
    } else {
      setCode('')
      setFileName('')
      setLanguage('javascript')
      setHasUnsavedChanges(false)
    }
  }, [selectedFile, folders])

  // Track unsaved changes
  useEffect(() => {
    if (selectedFile) {
      const folder = folders.find(f => f.id === selectedFile.folderId)
      const file = folder?.files.find(f => f.id === selectedFile.fileId)
      
      if (file) {
        setHasUnsavedChanges(
          code !== file.content || 
          fileName !== file.name || 
          language !== file.language
        )
      }
    }
  }, [code, fileName, language, selectedFile, folders])

  const handleSave = () => {
    if (!selectedFile) return

    updateFile(selectedFile.folderId, selectedFile.fileId, {
      name: fileName,
      language,
      content: code
    })
    setHasUnsavedChanges(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const handleDownload = () => {
    if (!fileName || !code) return

    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePreviewHtml = () => {
    if (language !== 'html') return

    const blob = new Blob([code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const extensionMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'java': 'java',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'dart': 'dart',
    }
    return extensionMap[extension || ''] || 'text'
  }

  // Auto-detect language when filename changes
  useEffect(() => {
    if (fileName) {
      const detectedLanguage = getLanguageFromFileName(fileName)
      if (detectedLanguage !== language) {
        setLanguage(detectedLanguage)
      }
    }
  }, [fileName])

  if (!selectedFile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Code2 className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No file selected</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Select a file from the folder tree to start editing
        </p>
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 text-left max-w-md mx-auto">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Getting Started:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Create a new folder to organize your code</li>
            <li>• Add files to your folder with different extensions</li>
            <li>• Edit files with syntax highlighting</li>
            <li>• Search through files quickly</li>
            <li>• Preview HTML files in browser</li>
          </ul>
        </div>
      </div>
    )
  }

  const currentFolder = folders.find(f => f.id === selectedFile.folderId)
  const currentFile = currentFolder?.files.find(f => f.id === selectedFile.fileId)

  if (!currentFile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <FileText className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">File not found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          The selected file could not be loaded
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="font-medium text-gray-900 dark:text-white bg-transparent border-none outline-none text-lg truncate w-full"
              placeholder="filename.ext"
            />
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-none outline-none text-xs uppercase font-medium"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <span>•</span>
              <span>{code.split('\n').length} lines</span>
              <span>•</span>
              <span>{code.length} chars</span>
              {hasUnsavedChanges && (
                <>
                  <span>•</span>
                  <span className="text-orange-500 dark:text-orange-400 font-medium">Unsaved</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
            title="Toggle preview"
          >
            <Eye className="h-4 w-4 mr-1" />
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          
          {language === 'html' && (
            <button
              onClick={handlePreviewHtml}
              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              title="Preview in browser"
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </button>
          )}
          
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
            title="Download file"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </button>
          
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
              hasUnsavedChanges
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            title="Save changes"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="h-96">
        {showPreview ? (
          <div className="h-full p-4 overflow-auto">
            <CodeBlock
              code={code || '// No content yet'}
              language={language}
              showCopyButton={false}
              title={fileName}
            />
          </div>
        ) : (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full p-4 border-none outline-none resize-none font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder={`Enter your ${language} code here...`}
            spellCheck={false}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span>Folder: {currentFolder?.name}</span>
          <span>Language: {language.toUpperCase()}</span>
          <span>Encoding: UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Lines: {code.split('\n').length}</span>
          <span>Characters: {code.length}</span>
          {hasUnsavedChanges && (
            <span className="text-orange-500 dark:text-orange-400 font-medium">● Unsaved</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default CodeEditor
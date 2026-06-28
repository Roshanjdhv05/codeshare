import React, { useState } from 'react'
import { X, Save, AlertCircle, FileText, Code2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'
import CodeBlock from './CodeBlock'

type UserFolder = Database['public']['Tables']['user_folders']['Row']

interface CreateFileModalProps {
  folder: UserFolder
  onClose: () => void
  onSuccess: () => void
}

const CreateFileModal: React.FC<CreateFileModalProps> = ({
  folder,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    filename: '',
    extension: 'js',
    code_content: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const extensions = [
    { value: 'js', label: 'JavaScript (.js)' },
    { value: 'ts', label: 'TypeScript (.ts)' },
    { value: 'py', label: 'Python (.py)' },
    { value: 'html', label: 'HTML (.html)' },
    { value: 'css', label: 'CSS (.css)' },
    { value: 'json', label: 'JSON (.json)' },
    { value: 'java', label: 'Java (.java)' },
    { value: 'php', label: 'PHP (.php)' },
    { value: 'rb', label: 'Ruby (.rb)' },
    { value: 'go', label: 'Go (.go)' },
    { value: 'rs', label: 'Rust (.rs)' },
    { value: 'swift', label: 'Swift (.swift)' },
    { value: 'kt', label: 'Kotlin (.kt)' },
    { value: 'dart', label: 'Dart (.dart)' },
    { value: 'txt', label: 'Text (.txt)' },
  ]

  const getLanguageFromExtension = (extension: string): string => {
    const langMap: { [key: string]: string } = {
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
    return langMap[extension] || 'text'
  }

  const getDefaultContent = (extension: string): string => {
    const templates: { [key: string]: string } = {
      'js': '// JavaScript file\nconsole.log("Hello, World!");',
      'ts': '// TypeScript file\nconst message: string = "Hello, World!";\nconsole.log(message);',
      'py': '# Python file\nprint("Hello, World!")',
      'html': '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
      'css': '/* CSS file */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}',
      'json': '{\n  "name": "example",\n  "version": "1.0.0",\n  "description": "Example JSON file"\n}',
      'java': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      'php': '<?php\necho "Hello, World!";\n?>',
      'rb': '# Ruby file\nputs "Hello, World!"',
      'go': 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
      'rs': 'fn main() {\n    println!("Hello, World!");\n}',
      'swift': 'import Foundation\n\nprint("Hello, World!")',
      'kt': 'fun main() {\n    println("Hello, World!")\n}',
      'dart': 'void main() {\n  print("Hello, World!");\n}',
    }
    return templates[extension] || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create a file')
      return
    }

    if (!formData.filename.trim()) {
      setError('Filename is required')
      return
    }

    const filename = formData.filename.trim()
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      setError('Filename can only contain letters, numbers, dots, hyphens, and underscores')
      return
    }

    setLoading(true)
    setError('')

    try {
      const fullFilename = `${filename}.${formData.extension}`

      const { data, error } = await supabase
        .from('user_files')
        .insert([
          {
            folder_id: folder.id,
            user_id: user.id,
            filename: fullFilename,
            extension: formData.extension,
            code_content: formData.code_content,
          },
        ])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        if (error.code === '23505') {
          setError('A file with this name already exists in the folder')
        } else {
          setError(error.message)
        }
      } else {
        console.log('File created successfully:', data)
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error creating file:', error)
      setError(error.message || 'An error occurred while creating the file')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleExtensionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newExtension = e.target.value
    setFormData(prev => ({
      ...prev,
      extension: newExtension,
      code_content: prev.code_content || getDefaultContent(newExtension),
    }))
  }

  const loadTemplate = () => {
    setFormData(prev => ({
      ...prev,
      code_content: getDefaultContent(prev.extension),
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create New File</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">in {folder.folder_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - File Info */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="filename" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Filename *
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="filename"
                      name="filename"
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={formData.filename}
                      onChange={handleChange}
                      placeholder="index"
                    />
                    <select
                      name="extension"
                      value={formData.extension}
                      onChange={handleExtensionChange}
                      className="px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {extensions.map(ext => (
                        <option key={ext.value} value={ext.value}>
                          .{ext.value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Preview: {formData.filename || 'filename'}.{formData.extension}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Code2 className="h-5 w-5 text-blue-400 dark:text-blue-300" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        File Features
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Syntax highlighting for code</li>
                          <li>Auto-save when editing</li>
                          <li>Download individual files</li>
                          <li>Preview HTML files in browser</li>
                          <li>Search through file contents</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadTemplate}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Load {formData.extension.toUpperCase()} Template
                </button>
              </div>

              {/* Right Column - Code Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Code Content
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {showPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>

                {showPreview ? (
                  <div className="min-h-96">
                    <CodeBlock
                      code={formData.code_content || '// No content yet'}
                      language={getLanguageFromExtension(formData.extension)}
                      showCopyButton={false}
                    />
                  </div>
                ) : (
                  <textarea
                    name="code_content"
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={formData.code_content}
                    onChange={handleChange}
                    placeholder={`Enter your ${formData.extension} code here...`}
                  />
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.filename.trim()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 rounded-md hover:bg-blue-700 dark:hover:bg-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create File'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateFileModal
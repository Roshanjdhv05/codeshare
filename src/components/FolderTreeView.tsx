import React, { useState } from 'react'
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Save,
  X,
  Code2,
  GripVertical
} from 'lucide-react'
import { useSnippets } from '../contexts/SnippetContext'

interface FolderTreeViewProps {
  onFileSelect: (folderId: string, fileId: string) => void
  selectedFile?: { folderId: string; fileId: string } | null
}

const FolderTreeView: React.FC<FolderTreeViewProps> = ({ onFileSelect, selectedFile }) => {
  const { 
    folders, 
    createFolder, 
    deleteFolder, 
    renameFolder, 
    updateFolderDescription,
    toggleFolder, 
    addFileToFolder, 
    deleteFile,
    searchFiles
  } = useSnippets()
  
  const [searchTerms, setSearchTerms] = useState<{ [folderId: string]: string }>({})
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = useState('')
  const [editingFolderDesc, setEditingFolderDesc] = useState('')
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDesc, setNewFolderDesc] = useState('')
  const [draggedFile, setDraggedFile] = useState<{ folderId: string; fileIndex: number } | null>(null)

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

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const iconMap: { [key: string]: string } = {
      'js': '🟨',
      'ts': '🔷',
      'py': '🐍',
      'html': '🌐',
      'css': '🎨',
      'json': '📋',
      'java': '☕',
      'php': '🐘',
      'rb': '💎',
      'go': '🐹',
      'rs': '🦀',
      'swift': '🍎',
      'kt': '🟣',
      'dart': '🎯',
    }
    return iconMap[extension || ''] || '📄'
  }

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    
    createFolder(newFolderName.trim(), newFolderDesc.trim())
    setNewFolderName('')
    setNewFolderDesc('')
    setShowCreateFolder(false)
  }

  const handleEditFolder = (folder: any) => {
    setEditingFolder(folder.id)
    setEditingFolderName(folder.name)
    setEditingFolderDesc(folder.description)
  }

  const handleSaveFolder = () => {
    if (!editingFolder || !editingFolderName.trim()) return
    
    renameFolder(editingFolder, editingFolderName.trim())
    updateFolderDescription(editingFolder, editingFolderDesc.trim())
    setEditingFolder(null)
    setEditingFolderName('')
    setEditingFolderDesc('')
  }

  const handleCancelEdit = () => {
    setEditingFolder(null)
    setEditingFolderName('')
    setEditingFolderDesc('')
  }

  const handleAddFile = (folderId: string) => {
    const fileName = prompt('Enter file name (e.g., index.html, app.js):')
    if (!fileName) return

    const language = getLanguageFromFileName(fileName)
    addFileToFolder(folderId, {
      name: fileName,
      language,
      content: `// ${fileName}\n// Add your code here...`
    })
  }

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    if (window.confirm(`Are you sure you want to delete "${folderName}" and all its files?`)) {
      deleteFolder(folderId)
    }
  }

  const handleDeleteFile = (folderId: string, fileId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      deleteFile(folderId, fileId)
    }
  }

  const handleSearchChange = (folderId: string, searchTerm: string) => {
    setSearchTerms(prev => ({
      ...prev,
      [folderId]: searchTerm
    }))
  }

  const getFilteredFiles = (folderId: string) => {
    const searchTerm = searchTerms[folderId] || ''
    return searchFiles(folderId, searchTerm)
  }

  const handleDragStart = (e: React.DragEvent, folderId: string, fileIndex: number) => {
    setDraggedFile({ folderId, fileIndex })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, folderId: string, dropIndex: number) => {
    e.preventDefault()
    
    if (!draggedFile || draggedFile.folderId !== folderId) {
      setDraggedFile(null)
      return
    }

    if (draggedFile.fileIndex !== dropIndex) {
      // Implement reordering logic here if needed
      console.log(`Reorder file from ${draggedFile.fileIndex} to ${dropIndex}`)
    }
    
    setDraggedFile(null)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Project Folders
        </h3>
        <button
          onClick={() => setShowCreateFolder(true)}
          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Folder
        </button>
      </div>

      {/* Create Folder Form */}
      {showCreateFolder && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Folder Name *
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., React Components, Utils"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4 mr-1" />
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateFolder(false)
                  setNewFolderName('')
                  setNewFolderDesc('')
                }}
                className="inline-flex items-center px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folders List */}
      <div className="space-y-3">
        {folders.length > 0 ? (
          folders.map(folder => {
            const filteredFiles = getFilteredFiles(folder.id)
            const searchTerm = searchTerms[folder.id] || ''
            
            return (
              <div key={folder.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                {/* Folder Header */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3">
                  {editingFolder === folder.id ? (
                    /* Edit Mode */
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={editingFolderDesc}
                        onChange={(e) => setEditingFolderDesc(e.target.value)}
                        placeholder="Description"
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveFolder}
                          className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleFolder(folder.id)}
                        className="flex items-center gap-2 flex-1 text-left hover:bg-gray-100 dark:hover:bg-gray-600 rounded p-1 transition-colors"
                      >
                        {folder.isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        )}
                        {folder.isExpanded ? (
                          <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900 dark:text-white">{folder.name}</span>
                          {folder.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{folder.description}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          {folder.files.length} files
                        </span>
                      </button>
                      
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleAddFile(folder.id)}
                          className="p-1 text-gray-400 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Add file"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditFolder(folder)}
                          className="p-1 text-gray-400 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Edit folder"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFolder(folder.id, folder.name)}
                          className="p-1 text-gray-400 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                          title="Delete folder"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Folder Content */}
                {folder.isExpanded && (
                  <div className="p-3 bg-white dark:bg-gray-800">
                    {/* Search Bar */}
                    <div className="mb-3">
                      <div className="relative">
                        <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search files..."
                          value={searchTerms[folder.id] || ''}
                          onChange={(e) => handleSearchChange(folder.id, e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* Files List */}
                    <div className="space-y-1">
                      {filteredFiles.length > 0 ? (
                        filteredFiles.map((file, index) => {
                          const isSelected = selectedFile?.folderId === folder.id && selectedFile?.fileId === file.id
                          const isHighlighted = searchTerm && (
                            file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            file.content.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          
                          return (
                            <div
                              key={file.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, folder.id, index)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, folder.id, index)}
                              className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600' 
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              } ${
                                isHighlighted ? 'ring-2 ring-yellow-300 dark:ring-yellow-600' : ''
                              }`}
                              onClick={() => onFileSelect(folder.id, file.id)}
                            >
                              <GripVertical className="h-3 w-3 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="text-sm">{getFileIcon(file.name)}</span>
                              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm font-medium truncate block ${
                                  isSelected 
                                    ? 'text-blue-700 dark:text-blue-300' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {file.name}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="uppercase">{file.language}</span>
                                  <span>•</span>
                                  <span>{file.content.split('\n').length} lines</span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteFile(folder.id, file.id, file.name)
                                }}
                                className="p-1 text-gray-400 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete file"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )
                        })
                      ) : searchTerm ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <Search className="h-6 w-6 mx-auto mb-2" />
                          <p className="text-sm">No files found matching "{searchTerm}"</p>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <FileText className="h-6 w-6 mx-auto mb-2" />
                          <p className="text-sm">No files in this folder</p>
                          <button
                            onClick={() => handleAddFile(folder.id)}
                            className="mt-2 inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add First File
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Folder className="h-12 w-12 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No folders yet</h4>
            <p className="text-sm mb-4">Create your first folder to organize your code snippets</p>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Folder
            </button>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Folder</h3>
              <button
                onClick={() => setShowCreateFolder(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Folder Name *
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., React Components, Utils"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="Optional description for this folder"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={() => {
                  setShowCreateFolder(false)
                  setNewFolderName('')
                  setNewFolderDesc('')
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FolderTreeView
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface CodeFile {
  id: string
  name: string
  language: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface SnippetFolder {
  id: string
  name: string
  description: string
  files: CodeFile[]
  isExpanded: boolean
  createdAt: Date
  updatedAt: Date
}

interface SnippetContextType {
  folders: SnippetFolder[]
  createFolder: (name: string, description?: string) => string
  deleteFolder: (folderId: string) => void
  renameFolder: (folderId: string, newName: string) => void
  updateFolderDescription: (folderId: string, description: string) => void
  toggleFolder: (folderId: string) => void
  addFileToFolder: (folderId: string, file: Omit<CodeFile, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateFile: (folderId: string, fileId: string, updates: Partial<CodeFile>) => void
  deleteFile: (folderId: string, fileId: string) => void
  searchFiles: (folderId: string, searchTerm: string) => CodeFile[]
  reorderFiles: (folderId: string, fromIndex: number, toIndex: number) => void
}

const SnippetContext = createContext<SnippetContextType | undefined>(undefined)

export const useSnippets = () => {
  const context = useContext(SnippetContext)
  if (context === undefined) {
    throw new Error('useSnippets must be used within a SnippetProvider')
  }
  return context
}

export const SnippetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<SnippetFolder[]>([])

  const createFolder = (name: string, description: string = ''): string => {
    const newFolder: SnippetFolder = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      description,
      files: [],
      isExpanded: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setFolders(prev => [...prev, newFolder])
    return newFolder.id
  }

  const deleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== folderId))
  }

  const renameFolder = (folderId: string, newName: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, name: newName, updatedAt: new Date() }
        : folder
    ))
  }

  const updateFolderDescription = (folderId: string, description: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, description, updatedAt: new Date() }
        : folder
    ))
  }

  const toggleFolder = (folderId: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, isExpanded: !folder.isExpanded }
        : folder
    ))
  }

  const addFileToFolder = (folderId: string, file: Omit<CodeFile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFile: CodeFile = {
      ...file,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { 
            ...folder, 
            files: [...folder.files, newFile],
            updatedAt: new Date()
          }
        : folder
    ))
  }

  const updateFile = (folderId: string, fileId: string, updates: Partial<CodeFile>) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? {
            ...folder,
            files: folder.files.map(file => 
              file.id === fileId 
                ? { ...file, ...updates, updatedAt: new Date() }
                : file
            ),
            updatedAt: new Date()
          }
        : folder
    ))
  }

  const deleteFile = (folderId: string, fileId: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? {
            ...folder,
            files: folder.files.filter(file => file.id !== fileId),
            updatedAt: new Date()
          }
        : folder
    ))
  }

  const searchFiles = (folderId: string, searchTerm: string): CodeFile[] => {
    const folder = folders.find(f => f.id === folderId)
    if (!folder || !searchTerm.trim()) return folder?.files || []

    const term = searchTerm.toLowerCase()
    return folder.files.filter(file => 
      file.name.toLowerCase().includes(term) ||
      file.content.toLowerCase().includes(term)
    )
  }

  const reorderFiles = (folderId: string, fromIndex: number, toIndex: number) => {
    setFolders(prev => prev.map(folder => {
      if (folder.id !== folderId) return folder

      const newFiles = [...folder.files]
      const [movedFile] = newFiles.splice(fromIndex, 1)
      newFiles.splice(toIndex, 0, movedFile)

      return {
        ...folder,
        files: newFiles,
        updatedAt: new Date()
      }
    }))
  }

  const value: SnippetContextType = {
    folders,
    createFolder,
    deleteFolder,
    renameFolder,
    updateFolderDescription,
    toggleFolder,
    addFileToFolder,
    updateFile,
    deleteFile,
    searchFiles,
    reorderFiles
  }

  return (
    <SnippetContext.Provider value={value}>
      {children}
    </SnippetContext.Provider>
  )
}
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type Theme = 'light' | 'dark'

export const useTheme = () => {
  const { user, profile } = useAuth()
  const [theme, setTheme] = useState<Theme>('dark')
  const [loading, setLoading] = useState(true)

  // Initialize theme on mount (only in browser)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeTheme()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile])

  const initializeTheme = async () => {
    try {
      let savedTheme: Theme = 'dark'

      if (user && profile?.theme) {
        savedTheme = profile.theme as Theme
      } else {
        // Force dark mode because light mode CSS is not implemented for the background
        savedTheme = 'dark'
      }

      applyTheme(savedTheme)
      setTheme(savedTheme)
    } catch (error) {
      console.error('Error initializing theme:', error)
      applyTheme('light')
      setTheme('light')
    } finally {
      setLoading(false)
    }
  }

  const applyTheme = (newTheme: Theme) => {
    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
  }

  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light'

    try {
      applyTheme(newTheme)
      setTheme(newTheme)

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ theme: newTheme })
          .eq('id', user.id)

        if (error) {
          console.error('Error saving theme preference:', error)
        }
      }
    } catch (error) {
      console.error('Error toggling theme:', error)
      applyTheme(theme)
      setTheme(theme)
    }
  }

  const setThemePreference = async (newTheme: Theme) => {
    try {
      applyTheme(newTheme)
      setTheme(newTheme)

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ theme: newTheme })
          .eq('id', user.id)

        if (error) {
          console.error('Error saving theme preference:', error)
        }
      }
    } catch (error) {
      console.error('Error setting theme preference:', error)
      applyTheme(theme)
      setTheme(theme)
    }
  }

  return {
    theme,
    toggleTheme,
    setThemePreference,
    loading
  }
}

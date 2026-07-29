'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { defaultTheme, darkTheme, toCSSVariables, type Theme } from './design-system'

interface ThemeContextType {
  theme: Theme
  isDarkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (dark: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultDarkMode?: boolean
  storageKey?: string
}

export function ThemeProvider({ 
  children, 
  defaultDarkMode = false,
  storageKey = 'eduportal-theme-mode'
}: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Verificar preferência salva no localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved !== null) {
        return saved === 'dark'
      }
      
      // Verificar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark
    }
    
    return defaultDarkMode
  })

  const theme = isDarkMode ? darkTheme : defaultTheme

  // Aplicar variáveis CSS no root
  useEffect(() => {
    const root = document.documentElement
    const cssVariables = toCSSVariables(theme, 'edu')
    
    // Aplicar todas as variáveis CSS
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Adicionar classe para tema escuro
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme, isDarkMode])

  // Atualizar localStorage quando o tema mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, isDarkMode ? 'dark' : 'light')
    }
  }, [isDarkMode, storageKey])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  const setDarkMode = (dark: boolean) => {
    setIsDarkMode(dark)
  }

  // Ouvir mudanças na preferência do sistema
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Só mudar se o usuário não tiver feito uma escolha manual
      const hasManualChoice = localStorage.getItem(storageKey) !== null
      if (!hasManualChoice) {
        setIsDarkMode(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [storageKey])

  const value: ThemeContextType = {
    theme,
    isDarkMode,
    toggleDarkMode,
    setDarkMode
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook para acessar cores do design system com fallback seguro
 */
export function useDesignSystem() {
  const { theme } = useTheme()
  
  return {
    colors: theme.colors,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    animations: theme.animations,
    
    // Utilitários rápidos
    getColor: (colorPath: string, fallback = '#000000') => {
      const path = colorPath.split('.')
      let current: any = theme.colors
      
      for (const key of path) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key]
        } else {
          return fallback
        }
      }
      
      return typeof current === 'string' ? current : fallback
    },
    
    // Classes utilitárias
    cn: (...classes: (string | boolean | undefined | null)[]) => {
      return classes.filter(Boolean).join(' ')
    },
  }
}

/**
 * Componente para alternar entre temas claro/escuro
 */
export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  
  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
          isDarkMode ? 'translate-x-7' : 'translate-x-1'
        }`}
      >
        {isDarkMode ? (
          <span className="flex h-full w-full items-center justify-center text-gray-700">
            🌙
          </span>
        ) : (
          <span className="flex h-full w-full items-center justify-center text-yellow-500">
            ☀️
          </span>
        )}
      </span>
    </button>
  )
}
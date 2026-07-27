"use client"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

interface ThemeContextValue {
  theme: string | undefined
  setTheme: (theme: string) => void
  resolvedTheme: string | undefined
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: undefined,
  setTheme: () => {},
  resolvedTheme: undefined,
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "theme",
}: {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}) {
  const [theme, setThemeState] = useState<string>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      setThemeState(stored)
      applyTheme(stored)
    } else {
      applyTheme(defaultTheme)
    }
    setMounted(true)
  }, [defaultTheme, storageKey])

  const applyTheme = useCallback((t: string) => {
    const root = document.documentElement
    if (t === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [])

  const setTheme = useCallback(
    (t: string) => {
      setThemeState(t)
      localStorage.setItem(storageKey, t)
      applyTheme(t)
    },
    [applyTheme, storageKey],
  )

  return (
    <ThemeContext.Provider
      value={{
        theme: mounted ? theme : defaultTheme,
        setTheme,
        resolvedTheme: theme === "system" ? undefined : theme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

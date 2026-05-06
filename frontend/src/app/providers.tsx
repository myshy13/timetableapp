"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { usePathname } from "next/navigation"

type User = {
  id: number
  uname: string
  name: string
}

interface SignupResult {
  error?: string
  message?: string
}
type AccountContextType = {
  user: User | null
  accessToken: string | null
  loading: boolean
  server: string
  login: (uname: string, pword: string) => Promise<boolean>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  signup: (uname: string, pword: string, name: string) => Promise<SignupResult>
  getAssignments: () => Promise<object[]>
}

const sidebarContext = createContext<string | null>(null)
const AccountContext = createContext<AccountContextType | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return <sidebarContext.Provider value={pathname}>{children}</sidebarContext.Provider>
}

export function useCurrentPage() {
  return useContext(sidebarContext)
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const server = "http://localhost:3001"

  const refresh = async () => {
    try {
      const res = await fetch(`${server}/api/v1/refresh`, {
        method: "POST",
        credentials: "include",
      })

      // Parse JSON response once
      const result = await res.json()

      // If the backend returned an error field, treat as failure
      if (result?.error) {
        setAccessToken(null)
        setUser(null)
        console.log(result)
        return
      }

      if (!res.ok) {
        setAccessToken(null)
        setUser(null)
        return
      }

      // Successful refresh – store new access token
      setAccessToken(result.accessToken)

      // Fetch user profile using the new token
      const me = await fetch(`${server}/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${result.accessToken}`,
        },
      })

      if (me.ok) {
        setUser(await me.json())
      }
    } catch {
      setAccessToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const getAssignments = async () => {
    const res = await fetch(`${server}/api/v1/assignments`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      method: "GET",
    })
    if (!res.ok) {
      return
    }
    const data = await res.json()
    console.log(data)
    return data
  }

  const login = async (uname: string, pword: string): Promise<boolean> => {
    const res = await fetch(`${server}/api/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ uname, pword }),
    })

    if (!res.ok) {
      return false
    } else {
      try {
        const data = await res.json()

        setAccessToken(data.accessToken)

        const me = await fetch(`${server}/api/v1/me`, {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        })

        if (me.ok) {
          setUser(await me.json())
        }
      } catch {}
      return true
    }
  }

  const signup = async (uname: string, pword: string, name: string): Promise<SignupResult> => {
    const res = await fetch(`${server}/api/v1/createUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uname: uname,
        pword: pword,
        name: name,
      }),
    })
    const data = await res.json()
    return data
  }

  const logout = async () => {
    await fetch(`${server}/api/v1/logout`, {
      method: "POST",
      credentials: "include",
    })

    setAccessToken(null)
    setUser(null)
  }

  // auto session restore
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AccountContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        logout,
        refresh,
        signup,
        getAssignments,
        server,
      }}>
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error("useAccount must be used within AccountProvider")
  return ctx
}

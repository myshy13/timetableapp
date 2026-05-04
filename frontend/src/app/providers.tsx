"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { usePathname } from "next/navigation"

type User = {
  id: number
  uname: string
  name: string
}

type AccountContextType = {
  user: User | null
  accessToken: string | null
  loading: boolean
  login: (uname: string, pword: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
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

  const server = "http://192.168.10.111:3001"

  const refresh = async () => {
    try {
      const res = await fetch(`${server}/api/v1/refresh`, {
        method: "POST",
        credentials: "include",
      })

      if ((await res.json()).error) {
        setAccessToken(null)
        setUser(null)
        console.log(await res.json())
        return
      }
      if (!res.ok) {
        setAccessToken(null)
        setUser(null)
        return
      }

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
    } catch {
      setAccessToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (uname: string, pword: string) => {
    const res = await fetch(`${server}/api/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ uname, pword }),
    })

    if (!res.ok) throw new Error("Login failed")

    const data = await res.json()

    setAccessToken(data.accessToken)

    // optional: fetch user info immediately
    const me = await fetch(`${server}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
      },
    })

    if (me.ok) {
      setUser(await me.json())
    }
  }

  const signup = async (uname: string, pword: string, fullname: string): Promise<boolean> => {
    const res = await fetch(`${server}/api/v1/createUser`, {
      method: "POST",
      body: JSON.stringify({
        "uname": uname,
        "pword": pword,
        "name": fullname
      })
    })
    const data = await res.json()
    if (!data.error) {
      return true
    } else {
      return false
    }
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

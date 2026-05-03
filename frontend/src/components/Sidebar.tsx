"use client"

import { GraduationCap, LayoutDashboard, Calendar, ClipboardList } from "lucide-react"
import "../styles/sidebar.css"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAccount } from "../app/providers"
import { useEffect } from "react"
import { Quicksand } from "next/font/google"

const googleFlex = Quicksand({
  subsets: ["latin"],
})

export function Sidebar() {
  const pathname = usePathname()
  const account = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!account.accessToken && pathname != "/login") {
      router.push("/login")
    }
  })

  if (pathname != "/login") {
    return (
      <div className="sidebar">
        <div className="sidebarLogo">
          <GraduationCap
            color="var(--primary)"
            size={32}
          />
          <b style={{ fontSize: "1.1em" }}>Hamac Timetable</b>
        </div>
        <div className="sidebarItems">
          <Link
            className={pathname == "/" ? "sidebarPage active" : "sidebarPage"}
            href="/">
            <LayoutDashboard
              size={24}
              color="var(--primary)"
            />
            Dashboard
          </Link>
          <Link
            className={pathname == "/assignments" ? "sidebarPage active" : "sidebarPage"}
            href="/assignments">
            <ClipboardList
              size={24}
              color="var(--primary)"
            />
            Assignments
          </Link>
          <Link
            className={pathname == "/timetable" ? "sidebarPage active" : "sidebarPage"}
            href="/timetable">
            <Calendar
              size={24}
              color="var(--primary)"
            />
            Timetable
          </Link>
        </div>
        <div className="sidebarAccount">
          <div className={`sidebarAccountLogo ${googleFlex.className}`}>
            {account.user?.name[0]}
          </div>
          {account.user?.name}
        </div>
      </div>
    )
  } else {
    return
  }
}

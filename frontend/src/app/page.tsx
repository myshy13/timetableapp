"use client"

import { Roboto } from "next/font/google"
import { useAccount } from "./providers"
import "../styles/dashboard.module.css"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const roboto = Roboto()

export default function Dashboard() {
  const account = useAccount()
  const router = useRouter()
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    ;(async () => {
      if (!account.user) {
        await account.refresh()
        if (account.user) {
          return
        } else {
          router.push("/login")
        }
      }
    })()
  })

  useEffect(() => {
    ;(async () => {
      setAssignments(await account.getAssignments())
    })()
  }, [account])

  return (
    <>
      <main className="dash">
        <h2 className={`title ${roboto.className}`}>Dashboard</h2>
        <div className="widget">
          <h3>Assignment due</h3>
          {/* <ul className="assignmentsList">{assignments}</ul> TODO: make this display the assignements */}
        </div>
      </main>
    </>
  )
}

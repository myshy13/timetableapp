"use client"
import { useAccount } from "../providers"
import "../../styles/login.css"
import { Nunito } from "next/font/google"
import { Calendar, ClipboardCheck, GraduationCap, LayoutDashboard } from "lucide-react"
import { FormEvent, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

const regular = Nunito({
  weight: "400",
})

const bold = Nunito({
  weight: "600",
})

export default function Login() {
  const account = useAccount()
  const router = useRouter()

  const unameRef = useRef(null)
  const pwordRef = useRef(null)

  useEffect(() => {
    if (account.accessToken) {
      router.push("/")
    }
  }, [account, router])

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      if (unameRef.current && pwordRef.current) {
        const uname: HTMLInputElement = unameRef.current as HTMLInputElement
        const pword: HTMLInputElement = pwordRef.current as HTMLInputElement
        await account.login(uname.value, pword.value)
      }
    } catch {}
  }

  return (
    <>
      <div className={`${bold.className} logo`}>
        <GraduationCap size={32} />
        <h3>Hamac timetable</h3>
      </div>
      <div className={`${regular.className} splitDiv`}>
        <div className="banner">
          <h1
            style={{ fontSize: "2.5rem" }}
            className={bold.className}>
            Stay on top of <span style={{ fontStyle: "revert-layer" }}>every</span> class
          </h1>
          <p>
            Manage your timetable, track assignments, and stay on top of your studies. Everything
            you need in one place.
          </p>
          <div className="benefits">
            <div className="benefit">
              <div className="benefitIcon">
                <Calendar />
              </div>
              <div className="benefitText">
                <h4 className={bold.className}>Organise easily</h4>
                <p>View your day at a glance</p>
              </div>
            </div>
            <div className="benefit">
              <div className="benefitIcon">
                <ClipboardCheck />
              </div>
              <div className="benefitText">
                <h4 className={bold.className}>Assignment tracking</h4>
                <p>Never miss the deadline</p>
              </div>
            </div>
            <div className="benefit">
              <div className="benefitIcon">
                <LayoutDashboard />
              </div>
              <div className="benefitText">
                <h4 className={bold.className}>Smart dashboard</h4>
                <p>Easy access to your progress</p>
              </div>
            </div>
          </div>
        </div>
        <div className={"formContainer " + regular.className}>
          <h2>Welcome back</h2>
          <p style={{ color: "lightgray" }}>Sign in to continue</p>
          <form
            className="form"
            onSubmit={handleLogin}>
            <input
              type="text"
              name="uname"
              id="uname"
              className="uname input"
              placeholder="username"
              ref={unameRef}
            />
            <input
              type="password"
              name="pword"
              id="pword"
              ref={pwordRef}
              className="pword input"
              placeholder="password"
              minLength={8}
              maxLength={30}
            />
            <div
              className="inline"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.6em" }}>
              <button type="submit">
                Login
                <div className="arrow"></div>
              </button>
              Or{" "}
              <a
                className="secondary"
                href="/signup">
                Sign up
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

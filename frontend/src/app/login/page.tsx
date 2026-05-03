"use client"
import { useRouter } from "next/navigation"
import { useAccount } from "../providers"
import { useEffect, useRef } from "react"
import "../../styles/login.css"
import { Nunito } from "next/font/google"
import { Calendar, ClipboardCheck, GraduationCap, LayoutDashboard } from "lucide-react"

const regular = Nunito({
  weight: "400",
})

const bold = Nunito({
  weight: "600",
})

export default function Login() {
  const account = useAccount()
  const router = useRouter()

  const formRef = useRef(null)

  useEffect(() => {
    ;(formRef.current as HTMLFormElement | null)?.addEventListener("submit", (e) => {
      e.preventDefault()
    })
  }, [account, router, formRef])

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
            ref={formRef}
            className="form">
            <input
              type="text"
              name="uname"
              id="uname"
              className="uname input"
              placeholder="username"
            />
            <input
              type="password"
              name="pword"
              id="pword"
              className="pword input"
              placeholder="password"
              minLength={8}
              maxLength={30}
            />
            <button>
              Login
              <div className="arrow"></div>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

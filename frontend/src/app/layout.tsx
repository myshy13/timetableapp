import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "../components/Sidebar"
import { AccountProvider, SidebarProvider } from "./providers"

export const metadata: Metadata = {
  title: "Hamac timetable",
  description: "A timetable manager created with Next.js and React",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html>
    <body>
        <SidebarProvider>
          <AccountProvider>
            <Sidebar />
            <main>{children}</main>
          </AccountProvider>
        </SidebarProvider>
      </body>
    </html>
  )
}

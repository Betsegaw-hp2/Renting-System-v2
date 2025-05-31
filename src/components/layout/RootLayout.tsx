import { TagManagerWrapper } from "@/components/TagManagerWrapper"
import { Outlet } from "react-router-dom"

export function RootLayout() {
  return (
    <>
      <Outlet />
      <TagManagerWrapper />
    </>
  )
}

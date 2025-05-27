"use client"

import { AdminReport } from "@/features/report/components/AdminReport"
import { AdminLayout } from "../components/layout/AdminLayout"

export default function ReportsPage() {
  return (
    <AdminLayout>
      <AdminReport />
    </AdminLayout>
)
}
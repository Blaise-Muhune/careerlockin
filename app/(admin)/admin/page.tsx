import { PageHeader } from "@/components/layout/PageHeader";
import { AdminDashboard } from "./AdminDashboard";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Internal"
        title="Admin dashboard"
        subtitle="Aggregate product health, usage, and revenue. No user-level data."
      />
      <AdminDashboard />
    </div>
  );
}

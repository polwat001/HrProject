import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Reports from "@/routes/Reports";

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Reports />
      </AppLayout>
    </ProtectedRoute>
  );
}

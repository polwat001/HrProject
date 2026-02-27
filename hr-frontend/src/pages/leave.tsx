import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LeaveManagement from "@/routes/LeaveManagement";

export default function LeavePage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <LeaveManagement />
      </AppLayout>
    </ProtectedRoute>
  );
}

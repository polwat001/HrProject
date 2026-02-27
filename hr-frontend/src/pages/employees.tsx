import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import EmployeeList from "@/routes/EmployeeList";

export default function EmployeesPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <EmployeeList />
      </AppLayout>
    </ProtectedRoute>
  );
}

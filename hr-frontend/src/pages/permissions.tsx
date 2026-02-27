import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import UserPermission from "@/routes/UserPermission";

export default function PermissionsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <UserPermission />
      </AppLayout>
    </ProtectedRoute>
  );
}

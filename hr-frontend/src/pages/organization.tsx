import { ProtectedRoute } from "@/components/ProtectedRoute";
import OrganizationStructure from "@/routes/OrganizationStructure";
import AppLayout from "@/components/AppLayout";

export default function OrganizationPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <OrganizationStructure />
      </AppLayout>
    </ProtectedRoute>
  );
}

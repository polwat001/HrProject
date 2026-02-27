import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import ContractManagement from "@/routes/ContractManagement";

export default function ContractsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <ContractManagement />
      </AppLayout>
    </ProtectedRoute>
  );
}

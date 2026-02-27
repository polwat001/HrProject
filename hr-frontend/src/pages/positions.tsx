import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import PositionMaster from "@/routes/PositionMaster";

export default function PositionsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <PositionMaster />
      </AppLayout>
    </ProtectedRoute>
  );
}

import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import TimeAttendance from "@/routes/TimeAttendance";

export default function AttendancePage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <TimeAttendance />
      </AppLayout>
    </ProtectedRoute>
  );
}

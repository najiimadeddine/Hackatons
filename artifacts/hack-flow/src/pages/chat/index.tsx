import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ChatInterface } from "@/components/shared/ChatInterface";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout title="Team Chat">
        <ChatInterface />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

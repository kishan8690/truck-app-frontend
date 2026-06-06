import { DriverLocationProvider } from "@/context/DriverLocationContext";
import ProtectedRoute from "@/cmp/ProtectedRoute";
import { Role } from "@/types/enums";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    // <ProtectedRoute allowedRoles={[Role.Driver]}>
    <DriverLocationProvider>
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 20px;
          border: 3px solid transparent;
          background-clip: content-box;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        .dark ::-webkit-scrollbar-thumb {
          background-color: #4b5563;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background-color: #6b7280;
        }
      `}} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
    </DriverLocationProvider>
    // </ProtectedRoute>
  );
}
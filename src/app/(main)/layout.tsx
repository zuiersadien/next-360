"use client";
import Sidebar from "../components/Sidebar";
import { SessionProvider } from "next-auth/react";
const queryClient = new QueryClient();

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <SessionProvider>
        <Sidebar />

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </main>
      </SessionProvider>
    </div>
  );
}

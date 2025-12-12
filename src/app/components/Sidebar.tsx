"use client";

import { useRouter, usePathname } from "next/navigation";
import { Avatar } from "primereact/avatar";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { isAdmin } from "../lib/auth";

const menu = [
  { label: "Inicio", icon: "pi pi-home", path: "/home" },
  { label: "Usuarios", icon: "pi pi-user", path: "/user", admin: true },
  { label: "Galería", icon: "pi pi-images", path: "/gallery" },
  { label: "Marcadores", icon: "pi pi-map-marker", path: "/marker" },
  { label: "Proyectos", icon: "pi pi-folder", path: "/project" },
  { label: "Tags", icon: "pi pi-tags", path: "/tag" },
  { label: "Empresas", icon: "pi pi-building", path: "/company", admin: true },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const user = session?.user;

  const router = useRouter();
  const pathname = usePathname();
  const op = useRef<OverlayPanel>(null);

  const color = user ? "#6366F1" : "#9CA3AF";

  return (
    <div className="w-20 h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col items-center py-5 gap-6">
      {/* Avatar */}
      <div
        className="cursor-pointer relative"
        onClick={(e) => op.current?.toggle(e)}
      >
        <Avatar
          label={user?.email?.[0]?.toUpperCase() ?? "?"}
          shape="circle"
          style={{ backgroundColor: color, color: "white" }}
        />
      </div>

      {/* Panel Usuario */}
      <OverlayPanel ref={op} dismissable className="w-64 p-3">
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-sm font-semibold text-gray-700">
              {user?.name}
            </span>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-gray-500 mb-1">
              Empresas
            </p>

            <div className="flex flex-col gap-1">
              {user?.companies?.length || 0 > 0 ? (
                user?.companies.map((c: any) => (
                  <div
                    key={c.id}
                    className="text-sm px-2 py-1 bg-gray-100 rounded-md border border-gray-200"
                  >
                    {c.name}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Sin empresas asignadas
                </p>
              )}
            </div>
          </div>
        </div>
      </OverlayPanel>

      {/* Menu */}
      <nav className="flex flex-col items-center gap-4 mt-5">
        {menu.map((item, i) => {
          if (item.admin && !isAdmin(user)) return null;

          const active = pathname.startsWith(item.path);

          return (
            <button
              key={i}
              onClick={() => router.push(item.path)}
              className={`
                flex flex-col items-center w-full p-3 rounded-xl
                transition text-gray-600
                ${active ? "bg-blue-100 text-blue-600 shadow-sm" : "hover:bg-blue-50 hover:text-blue-600"} 
              `}
            >
              <i
                className={`${item.icon} text-2xl ${active && "text-blue-600"}`}
              />
              <div
                className={`w-1.5 h-1.5 bg-blue-600 rounded-full mt-1 ${active ? "" : "opacity-0"}`}
              ></div>
            </button>
          );
        })}
      </nav>

      <Button
        text
        raised
        rounded
        icon="pi pi-sign-out"
        severity="danger"
        onClick={() => signOut({ redirect: true })}
      />
    </div>
  );
}

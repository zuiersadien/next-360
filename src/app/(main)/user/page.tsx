"use client";

import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export type User = {
  id: number;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  hashedPassword: string | null;
  createdAt: string;
  updatedAt: string;

  companies?: { companyId: number; company: Company }[];
};

export type Company = {
  id: number;
  name: string;
};

type UserForm = {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  hashedPassword: string;
  companyIds: number[];
};

export default function UserCrudPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    role: "USER",
    hashedPassword: "",
    companyIds: [],
  });

  const roles = [
    { label: "User", value: "USER" },
    { label: "Admin", value: "ADMIN" },
  ];

  async function fetchUsers() {
    const res = await fetch("/api/user");
    const data: User[] = await res.json();
    setUsers(data);
    setLoading(false);
  }

  async function fetchCompanies() {
    const res = await fetch("/api/company");
    const data: Company[] = await res.json();
    setCompanies(data);
  }

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  function openCreate() {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      role: "USER",
      hashedPassword: "",
      companyIds: [],
    });
    setShowForm(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);

    setForm({
      name: user.name || "",
      email: user.email,
      role: user.role,
      hashedPassword: user.hashedPassword || "",
      companyIds: user.companies?.map((c) => c.companyId) || [],
    });

    setShowForm(true);
  }

  async function deleteUser(id: User["id"]) {
    await fetch(`/api/user/${id}`, { method: "DELETE" });
    await fetchUsers();
  }

  async function saveUser() {
    if (editingUser) {
      await fetch(`/api/user/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setShowForm(false);
    fetchUsers();
  }

  const formFooter = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancelar"
        severity="secondary"
        onClick={() => setShowForm(false)}
      />
      <Button label="Guardar" icon="pi pi-check" onClick={saveUser} />
    </div>
  );

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Button
          size="small"
          label="Nuevo Usuario"
          icon="pi pi-plus"
          onClick={openCreate}
        />
      </div>

      <DataTable value={users} size="small" loading={loading}>
        <Column field="id" header="ID" />
        <Column field="name" header="Nombre" />
        <Column field="email" header="Email" />
        <Column field="role" header="Rol" />

        <Column
          header="Empresas"
          body={(row: User) =>
            row.companies?.map((c) => c.company.name).join(", ") || "-"
          }
        />

        <Column
          header="Acciones"
          body={(row: User) => (
            <div className="flex gap-2">
              <Button
                size="small"
                icon="pi pi-pencil"
                text
                rounded
                onClick={() => openEdit(row)}
              />
              <Button
                text
                rounded
                size="small"
                severity="danger"
                icon="pi pi-trash"
                onClick={() => deleteUser(row.id)}
              />
            </div>
          )}
        />
      </DataTable>

      <Dialog
        header={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
        visible={showForm}
        onHide={() => setShowForm(false)}
        footer={formFooter}
        className="w-[450px]"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="font-medium">Nombre</label>
            <InputText
              className="w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="font-medium">Email</label>
            <InputText
              className="w-full"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="font-medium">Rol</label>
            <Dropdown
              className="w-full"
              options={roles}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.value })}
            />
          </div>

          <div>
            <label className="font-medium">Password (hash)</label>
            <InputText
              className="w-full"
              value={form.hashedPassword}
              onChange={(e) =>
                setForm({ ...form, hashedPassword: e.target.value })
              }
            />
          </div>

          {/* 🔥 MULTISELECT DE COMPAÑÍAS */}
          <div>
            <label className="font-medium">Empresas</label>
            <MultiSelect
              className="w-full"
              value={form.companyIds}
              options={companies.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
              onChange={(e) => setForm({ ...form, companyIds: e.value })}
              placeholder="empresas"
              display="chip"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

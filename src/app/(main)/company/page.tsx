"use client";

import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

type Company = {
  id: number;
  name: string;
  description?: string | null;
};

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [form, setForm] = useState<any>({ name: "", description: "" });

  // -----------------------------
  // Fetch inicial
  // -----------------------------
  const loadCompanies = async () => {
    setLoading(true);
    const res = await fetch("/api/company");
    const data = await res.json();
    setCompanies(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // -----------------------------
  // Abrir modal Crear
  // -----------------------------
  const openNew = () => {
    setForm({ name: "", description: "" });
    setEditingCompany(null);
    setDialogOpen(true);
  };

  // -----------------------------
  // Abrir modal Editar
  // -----------------------------
  const openEdit = (company: Company) => {
    setForm({
      name: company.name,
      description: company.description ?? "",
    });
    setEditingCompany(company);
    setDialogOpen(true);
  };

  // -----------------------------
  // Guardar: create o update
  // -----------------------------
  const saveCompany = async () => {
    if (!form.name.trim()) return alert("El nombre es obligatorio");

    if (editingCompany) {
      await fetch(`/api/company/${editingCompany.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/company", {
        method: "POST",
        body: JSON.stringify(form),
      });
    }

    setDialogOpen(false);
    await loadCompanies();
  };

  // -----------------------------
  // Confirmación eliminar
  // -----------------------------
  const removeCompany = (company: Company) => {
    confirmDialog({
      message: `¿Eliminar la empresa "${company.name}"?`,
      header: "Confirmar",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sí",
      rejectLabel: "No",
      accept: async () => {
        await fetch(`/api/company/${company.id}`, { method: "DELETE" });
        await loadCompanies();
      },
    });
  };

  // -----------------------------
  // Template acciones
  // -----------------------------
  const actionsTemplate = (row: Company) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" size="small" onClick={() => openEdit(row)} />
      <Button
        icon="pi pi-trash"
        severity="danger"
        size="small"
        onClick={() => removeCompany(row)}
      />
    </div>
  );

  return (
    <div className="p-6">
      <ConfirmDialog />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Empresas</h1>
        <Button
          size="small"
          label="Nueva Empresa"
          icon="pi pi-plus"
          onClick={openNew}
        />
      </div>

      {/* Tabla */}
      <DataTable
        value={companies}
        loading={loading}
        paginator
        rows={10}
        className="shadow rounded-lg"
      >
        <Column field="id" header="ID" style={{ width: "80px" }} />
        <Column field="name" header="Nombre" />
        <Column field="description" header="Descripción" />
        <Column
          body={actionsTemplate}
          header="Acciones"
          style={{ width: "150px" }}
        />
      </DataTable>

      {/* Dialog Crear/Editar */}
      <Dialog
        header={editingCompany ? "Editar Empresa" : "Nueva Empresa"}
        visible={dialogOpen}
        style={{ width: "30rem" }}
        onHide={() => setDialogOpen(false)}
      >
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <label className="font-medium">Nombre</label>
            <InputText
              className="w-full mt-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="font-medium">Descripción (opcional)</label>
            <InputText
              className="w-full mt-2"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              label="Cancelar"
              severity="secondary"
              onClick={() => setDialogOpen(false)}
            />
            <Button label="Guardar" onClick={saveCompany} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

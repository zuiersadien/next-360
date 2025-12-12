import { NextResponse } from "next/server";
import prisma from "@/lib/db";
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }, // params es Promise
) {
  const params = await context.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { id: Number(params.id) },
  });

  return NextResponse.json(company);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }, // params es Promise
) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await prisma.company.update({
      where: { id },
      data: {
        name: body.name,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error updating company" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }, // params es Promise
) {
  const params = await context.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await prisma.company.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "Company deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error deleting company" },
      { status: 500 },
    );
  }
}

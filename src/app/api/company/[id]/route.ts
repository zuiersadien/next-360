import { NextResponse } from "next/server";
import prisma from "@/lib/db";
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const company = await prisma.company.findUnique({
    where: { id: Number(params.id) },
  });

  return NextResponse.json(company);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
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
  { params }: { params: { id: string } },
) {
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

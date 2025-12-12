import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        UserCompany: {
          include: { company: true },
        },
      },
    });

    return NextResponse.json(
      users.map((u) => ({
        ...u,
        hashedPassword: null,
        companies: u.UserCompany.map((uc) => ({
          companyId: uc.companyId,
          company: uc.company,
        })),
        UserCompany: undefined, // opcional: ocultarlo
      })),
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      hashedPassword,
      role,
      companyIds = [],
    } = await req.json();

    const password = hashedPassword
      ? await bcrypt.hash(hashedPassword, 10)
      : null;

    // Crear usuario + relaciones
    const newUser = await db.user.create({
      data: {
        name,
        email,
        role: role || "USER",
        hashedPassword: password,

        // 📌 Crear relaciones en UserCompany
        UserCompany: {
          create: companyIds.map((companyId: number) => ({
            companyId,
          })),
        },
      },
      include: {
        UserCompany: {
          include: { company: true },
        },
      },
    });

    // No devolver el hash nunca
    const { hashedPassword: _, ...safeUser } = newUser;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 },
    );
  }
}

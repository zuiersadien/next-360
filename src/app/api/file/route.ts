import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    // Obtener las compañías asociadas al usuario desde UserCompany
    const userWithCompanies = await db.user.findUnique({
      where: { id: userId },
      include: { UserCompany: { include: { company: true } } },
    });

    if (!userWithCompanies) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extraer los companyId de las compañías a las que pertenece el usuario
    const companyIds = userWithCompanies.UserCompany.map((uc) => uc.companyId);

    // Buscar los archivos asociados a proyectos de esas compañías
    const files = await db.file.findMany({
      where: {
        project: {
          companyId: { in: companyIds },
        },
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Error fetching files" },
      { status: 500 },
    );
  }
}

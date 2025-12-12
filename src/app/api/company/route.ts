import db from "@/lib/db";
import { NextResponse } from "next/server";

// GET all companies
export async function GET() {
  const companies = await db.company.findMany({
    orderBy: { id: "asc" },
  });

  return NextResponse.json(companies);
}

// CREATE company
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const company = await db.company.create({
      data: {
        name: body.name,
      },
    });

    return NextResponse.json(company);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error creating company" },
      { status: 500 },
    );
  }
}

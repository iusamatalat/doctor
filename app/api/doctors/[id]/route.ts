import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Doctor from "@/lib/models/Doctor";
import { getFallbackDoctorById, upsertFallbackDoctor } from "@/lib/fallbackStore";

function toResponseDoctor(d: any) {
  return { ...d, id: String(d._id) };
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const doc = await Doctor.findById(params.id).lean() as any;
    if (!doc) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    return NextResponse.json(toResponseDoctor(doc));
  } catch (err) {
    console.warn("[GET /api/doctors/[id]] Mongo unavailable, using fallback store:", err);
    const doc = await getFallbackDoctorById(params.id);
    if (!doc) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    return NextResponse.json(toResponseDoctor(doc));
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  // Never allow overwriting _id
  delete body._id;
  delete body.id;

  try {
    await connectDB();
    const updated = await Doctor.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean() as any;

    if (!updated) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    return NextResponse.json(toResponseDoctor(updated));
  } catch (err) {
    console.warn("[PUT /api/doctors/[id]] Mongo unavailable, using fallback store:", err);
    const existing = await getFallbackDoctorById(params.id);
    if (!existing) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    const updated = await upsertFallbackDoctor(params.id, { ...existing, ...body });
    return NextResponse.json(toResponseDoctor(updated));
  }
}

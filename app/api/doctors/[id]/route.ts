import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Doctor from "@/lib/models/Doctor";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const doc = await Doctor.findById(params.id).lean() as any;
    if (!doc) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    return NextResponse.json({ ...doc, id: String(doc._id) });
  } catch (err) {
    console.error("[GET /api/doctors/[id]]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();

    // Never allow overwriting _id
    delete body._id;
    delete body.id;

    const updated = await Doctor.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean() as any;

    if (!updated) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    return NextResponse.json({ ...updated, id: String(updated._id) });
  } catch (err) {
    console.error("[PUT /api/doctors/[id]]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

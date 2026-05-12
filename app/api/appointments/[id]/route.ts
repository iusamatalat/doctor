import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Appointment from "@/lib/models/Appointment";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { status } = await req.json();

    if (!["confirmed", "pending", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await Appointment.findByIdAndUpdate(
      params.id,
      { $set: { status } },
      { new: true }
    ).lean() as any;

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ...updated, id: String(updated._id) });
  } catch (err) {
    console.error("[PUT /api/appointments/[id]]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Appointment from "@/lib/models/Appointment";
import { updateFallbackAppointmentStatus } from "@/lib/fallbackStore";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { status } = await req.json();

  if (!["confirmed", "pending", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    await connectDB();

    const updated = await Appointment.findByIdAndUpdate(
      params.id,
      { $set: { status } },
      { new: true }
    ).lean() as any;

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ...updated, id: String(updated._id) });
  } catch (err) {
    console.warn("[PUT /api/appointments/[id]] Mongo unavailable, using fallback store:", err);
    const updated = await updateFallbackAppointmentStatus(
      params.id,
      status as "confirmed" | "pending" | "cancelled"
    );
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...updated, id: String(updated._id) });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Appointment from "@/lib/models/Appointment";
import Doctor from "@/lib/models/Doctor";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    const filter = doctorId ? { doctorId } : {};
    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      appointments.map((a: any) => ({ ...a, id: String(a._id) }))
    );
  } catch (err) {
    console.error("[GET /api/appointments]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { patientName, patientPhone, patientProblem, doctorId, doctorName, date, time, type } =
      await req.json();

    if (!patientName || !patientPhone || !patientProblem || !doctorId || !date || !time || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the appointment
    const appt = await Appointment.create({
      patientName,
      patientPhone,
      patientProblem,
      doctorId,
      doctorName,
      date,
      time,
      type,
      status: "confirmed",
    });

    // Mark the slot as unavailable on the doctor document
    await Doctor.updateOne(
      { _id: doctorId, "availableSlots.date": date, "availableSlots.time": time },
      { $set: { "availableSlots.$.available": false } }
    );

    return NextResponse.json({ ...appt.toJSON(), id: appt._id.toString() }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/appointments]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

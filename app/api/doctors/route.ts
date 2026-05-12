import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Doctor from "@/lib/models/Doctor";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const specialization = searchParams.get("specialization") || "";
    const city = searchParams.get("city") || "";
    const type = searchParams.get("type") || "";
    const sort = searchParams.get("sort") || "rating";

    // Build filter
    const filter: Record<string, unknown> = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { specialization: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
      ];
    }
    if (specialization && specialization !== "All Specializations") {
      filter.specialization = { $regex: specialization, $options: "i" };
    }
    if (city && city !== "All Cities") {
      filter.city = city;
    }
    if (type === "Online") {
      filter.consultationType = { $in: ["online", "both"] };
    } else if (type === "Physical") {
      filter.consultationType = { $in: ["physical", "both"] };
    }

    // Sort
    const sortMap: Record<string, Record<string, number>> = {
      rating: { rating: -1 },
      experience: { experience: -1 },
      fee: { feeOnline: 1 },
    };
    const sortObj = sortMap[sort] || { rating: -1 };

    const docs = await Doctor.find(filter).sort(sortObj).lean();

    // Normalize: add id field
    const doctors = docs.map((d: any) => ({ ...d, id: String(d._id) }));

    return NextResponse.json(doctors);
  } catch (err) {
    console.error("[GET /api/doctors]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Generate a simple numeric string ID if not provided
    const newId = body._id || String(Date.now());
    const doctor = await Doctor.create({ ...body, _id: newId });

    return NextResponse.json(doctor.toJSON(), { status: 201 });
  } catch (err) {
    console.error("[POST /api/doctors]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

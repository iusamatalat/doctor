import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Doctor from "@/lib/models/Doctor";
import { listFallbackDoctors, upsertFallbackDoctor } from "@/lib/fallbackStore";

function toResponseDoctor(d: any) {
  return { ...d, id: String(d._id) };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";
  const specialization = searchParams.get("specialization") || "";
  const city = searchParams.get("city") || "";
  const type = searchParams.get("type") || "";
  const sort = searchParams.get("sort") || "rating";

  const sortKey =
    sort === "experience" ? "experience" : sort === "fee" ? "feeOnline" : "rating";
  const sortDirection = sort === "fee" ? 1 : -1;

  // Prefer MongoDB, fallback to local file store if DB is unavailable.
  try {
    await connectDB();

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

    const docs = await Doctor.find(filter)
      .sort({ [sortKey]: sortDirection })
      .lean();

    return NextResponse.json(docs.map(toResponseDoctor));
  } catch (err) {
    console.warn("[GET /api/doctors] Mongo unavailable, using fallback store:", err);

    const q = query.trim().toLowerCase();
    let docs = await listFallbackDoctors();

    if (q) {
      docs = docs.filter((d) =>
        [d.name, d.specialization, d.city, d.location].some((field) =>
          field.toLowerCase().includes(q)
        )
      );
    }
    if (specialization && specialization !== "All Specializations") {
      const needle = specialization.toLowerCase();
      docs = docs.filter((d) => d.specialization.toLowerCase().includes(needle));
    }
    if (city && city !== "All Cities") {
      docs = docs.filter((d) => d.city === city);
    }
    if (type === "Online") {
      docs = docs.filter(
        (d) => d.consultationType === "online" || d.consultationType === "both"
      );
    } else if (type === "Physical") {
      docs = docs.filter(
        (d) => d.consultationType === "physical" || d.consultationType === "both"
      );
    }

    docs.sort((a: any, b: any) => {
      const av = Number(a[sortKey] ?? 0);
      const bv = Number(b[sortKey] ?? 0);
      return sortDirection === 1 ? av - bv : bv - av;
    });

    return NextResponse.json(docs.map(toResponseDoctor));
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newId = body._id || body.id || String(Date.now());

  try {
    await connectDB();
    const doctor = await Doctor.create({ ...body, _id: newId });

    return NextResponse.json(doctor.toJSON(), { status: 201 });
  } catch (err) {
    console.warn("[POST /api/doctors] Mongo unavailable, using fallback store:", err);
    const created = await upsertFallbackDoctor(String(newId), {
      ...body,
      _id: String(newId),
    });
    return NextResponse.json(toResponseDoctor(created), { status: 201 });
  }
}

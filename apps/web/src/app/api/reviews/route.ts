import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { resolveTenant, tenantDb } from "../../../lib/tenant";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { astrologerId, consultationId, rating, comment } = await req.json();

  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);

  const review = await db.review.create({
    data: { userId: user.uid, astrologerId, consultationId, rating, comment },
  });

  // Update astrologer aggregate
  const agg = await db.review.aggregate({
    where: { astrologerId }, _avg: { rating: true }, _count: true,
  });
  await db.astrologer.update({
    where: { id: astrologerId },
    data: { rating: agg._avg.rating ?? 0, totalOrders: agg._count },
  });

  return NextResponse.json({ ok: true, review });
}

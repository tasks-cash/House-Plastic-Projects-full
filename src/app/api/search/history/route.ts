import type { NextRequest } from "next/server";
import { z } from "zod";
import { parseJsonBody, requireAuth, requireModuleWrite } from "@/lib/api-handler";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import SearchHistory from "@/models/SearchHistory";
import mongoose from "mongoose";

const createSchema = z.object({
  query: z.string().min(1).max(500),
  page: z.string().min(1).max(64),
  source: z.enum(["text", "voice"]).optional().default("text"),
});

function mapSearchEntry(doc: {
  _id: mongoose.Types.ObjectId;
  query: string;
  page: string;
  source?: string;
  createdAt: Date;
}) {
  return {
    id: doc._id.toString(),
    query: doc.query,
    page: doc.page,
    source: doc.source ?? "text",
    createdAt: doc.createdAt.toISOString(),
  };
}

export const GET = requireAuth(async (request: NextRequest, _context, session) => {
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 20), 50);
  const page = request.nextUrl.searchParams.get("page")?.trim();

  const filter: Record<string, unknown> = {
    user: new mongoose.Types.ObjectId(session.userId),
  };
  if (page) filter.page = page;

  const entries = await SearchHistory.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return jsonSuccess(entries.map(mapSearchEntry));
});

export const POST = requireModuleWrite("dashboard", async (request, _context, session) => {
  const body = await parseJsonBody(request);
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.errors[0]?.message ?? "Invalid search history payload", {
      status: 400,
    });
  }

  const entry = await SearchHistory.create({
    user: session.userId,
    ...parsed.data,
  });

  return jsonSuccess(mapSearchEntry(entry), { status: 201 });
});

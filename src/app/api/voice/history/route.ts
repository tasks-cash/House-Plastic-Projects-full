import type { NextRequest } from "next/server";
import { z } from "zod";
import { parseJsonBody, requireAuth, requireModuleWrite } from "@/lib/api-handler";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { VOICE_LANG_VALUES } from "@/lib/voice/constants";
import VoiceHistory from "@/models/VoiceHistory";
import mongoose from "mongoose";

const createSchema = z.object({
  page: z.string().min(1).max(64),
  fieldName: z.string().min(1).max(128),
  recognizedText: z.string().max(10000).optional().default(""),
  audioFile: z.string().max(512).optional().default(""),
  language: z.enum(VOICE_LANG_VALUES),
});

function mapVoiceEntry(doc: {
  _id: mongoose.Types.ObjectId;
  page: string;
  fieldName: string;
  recognizedText: string;
  audioFile: string;
  language: string;
  createdAt: Date;
}) {
  return {
    id: doc._id.toString(),
    page: doc.page,
    fieldName: doc.fieldName,
    recognizedText: doc.recognizedText,
    audioFile: doc.audioFile,
    language: doc.language,
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

  const entries = await VoiceHistory.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return jsonSuccess(entries.map(mapVoiceEntry));
});

export const POST = requireModuleWrite("dashboard", async (request, _context, session) => {
  const body = await parseJsonBody(request);
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.errors[0]?.message ?? "Invalid voice history payload", {
      status: 400,
    });
  }

  const entry = await VoiceHistory.create({
    user: session.userId,
    ...parsed.data,
  });

  return jsonSuccess(mapVoiceEntry(entry), { status: 201 });
});

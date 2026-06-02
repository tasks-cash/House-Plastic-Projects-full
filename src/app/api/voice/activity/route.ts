import { requireAuth } from "@/lib/api-handler";
import { jsonSuccess } from "@/lib/api-response";
import SearchHistory from "@/models/SearchHistory";
import TextHistory from "@/models/TextHistory";
import VoiceHistory from "@/models/VoiceHistory";
import mongoose from "mongoose";

export const GET = requireAuth(async (_request, _context, session) => {
  const userId = new mongoose.Types.ObjectId(session.userId);
  const limit = 8;

  const [recentVoice, recentSearches, recentText] = await Promise.all([
    VoiceHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean(),
    SearchHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean(),
    TextHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean(),
  ]);

  return jsonSuccess({
    recentVoice: recentVoice.map((v) => ({
      id: v._id.toString(),
      page: v.page,
      fieldName: v.fieldName,
      recognizedText: v.recognizedText,
      audioFile: v.audioFile,
      language: v.language,
      createdAt: v.createdAt.toISOString(),
    })),
    recentSearches: recentSearches.map((s) => ({
      id: s._id.toString(),
      query: s.query,
      page: s.page,
      source: s.source ?? "text",
      createdAt: s.createdAt.toISOString(),
    })),
    recentText: recentText.map((t) => ({
      id: t._id.toString(),
      page: t.page,
      fieldName: t.fieldName,
      text: t.text,
      createdAt: t.createdAt.toISOString(),
    })),
  });
});

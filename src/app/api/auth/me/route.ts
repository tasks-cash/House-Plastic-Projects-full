import { getSession } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { withDb } from "@/lib/api-handler";
import User from "@/models/User";
import { mapUser } from "@/lib/mappers";

export const GET = withDb(async () => {
  const session = await getSession();

  if (!session) {
    return jsonError("Unauthorized", { status: 401 });
  }

  const user = await User.findById(session.userId);
  if (!user || !user.isActive) {
    return jsonError("Unauthorized", { status: 401 });
  }

  return jsonSuccess({ user: mapUser(user) });
});

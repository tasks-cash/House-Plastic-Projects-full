import { authenticateUser, setAuthCookie, userToSession } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { withDb } from "@/lib/api-handler";
import { formatZodError, loginSchema } from "@/lib/validations";
import { mapUser } from "@/lib/mappers";

export const POST = withDb(async (request) => {
  const body = await request.json().catch(() => null);

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const { method, identifier, password } = parsed.data;

  const user = await authenticateUser(method, identifier, password);
  if (!user) {
    return jsonError("Invalid credentials", { status: 401 });
  }

  await setAuthCookie(userToSession(user));

  return jsonSuccess({
    user: mapUser(user),
  });
});

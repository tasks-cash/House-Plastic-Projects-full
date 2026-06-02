import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession, type SessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";
import {
  assertCanDelete,
  assertCanRead,
  assertCanWrite,
  assertCanWriteModule,
  type AppModule,
  PermissionError,
} from "@/lib/permissions";
import type { UserRole } from "@/lib/constants";

export type ApiContext = {
  params: Promise<Record<string, string>>;
};

export type AuthenticatedHandler = (
  request: NextRequest,
  context: ApiContext,
  session: SessionUser
) => Promise<Response> | Response;

export type ApiHandler = (
  request: NextRequest,
  context: ApiContext
) => Promise<Response> | Response;

/**
 * Ensures MongoDB is connected before running the route handler.
 */
export function withDb(handler: ApiHandler): ApiHandler {
  return async (request, context) => {
    try {
      await connectDB();
      return await handler(request, context);
    } catch (error) {
      console.error("[api] database error:", error);
      return jsonError("Database connection failed", { status: 503 });
    }
  };
}

export function requireAuth(handler: AuthenticatedHandler): ApiHandler {
  return withDb(async (request, context) => {
    const session = await getSession();

    if (!session) {
      return jsonError("Unauthorized", { status: 401 });
    }

    try {
      assertCanRead(session.role);
    } catch (error) {
      if (error instanceof PermissionError) {
        return jsonError(error.message, { status: 403 });
      }
      throw error;
    }

    return handler(request, context, session);
  });
}

export function requireWrite(handler: AuthenticatedHandler): ApiHandler {
  return requireAuth(async (request, context, session) => {
    try {
      assertCanWrite(session.role);
    } catch (error) {
      if (error instanceof PermissionError) {
        return jsonError(error.message, { status: 403 });
      }
      throw error;
    }

    return handler(request, context, session);
  });
}

export function requireDelete(handler: AuthenticatedHandler): ApiHandler {
  return requireAuth(async (request, context, session) => {
    try {
      assertCanDelete(session.role);
    } catch (error) {
      if (error instanceof PermissionError) {
        return jsonError(error.message, { status: 403 });
      }
      throw error;
    }

    return handler(request, context, session);
  });
}

export function requireModuleWrite(
  module: AppModule,
  handler: AuthenticatedHandler
): ApiHandler {
  return requireAuth(async (request, context, session) => {
    try {
      assertCanWriteModule(session.role, module);
    } catch (error) {
      if (error instanceof PermissionError) {
        return jsonError(error.message, { status: 403 });
      }
      throw error;
    }

    return handler(request, context, session);
  });
}

export function hasRole(session: SessionUser, roles: UserRole[]): boolean {
  return roles.includes(session.role);
}

export async function parseJsonBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function resolveRouteId(context: ApiContext): Promise<string | null> {
  const params = await context.params;
  return params.id ?? null;
}

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export function isValidObjectId(id: string): boolean {
  return OBJECT_ID_REGEX.test(id);
}

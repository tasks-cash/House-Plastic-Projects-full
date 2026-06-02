import { NextResponse } from "next/server";

export interface ApiSuccessPayload<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorPayload {
  success: false;
  error: string;
  details?: unknown;
}

export function jsonSuccess<T>(
  data: T,
  options?: { status?: number; message?: string }
): NextResponse<ApiSuccessPayload<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(options?.message ? { message: options.message } : {}),
    },
    { status: options?.status ?? 200 }
  );
}

export function jsonError(
  error: string,
  options?: { status?: number; details?: unknown }
): NextResponse<ApiErrorPayload> {
  return NextResponse.json(
    {
      success: false as const,
      error,
      ...(options?.details !== undefined ? { details: options.details } : {}),
    },
    { status: options?.status ?? 400 }
  );
}

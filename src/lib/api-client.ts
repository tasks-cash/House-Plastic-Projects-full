"use client";

import type { ApiErrorPayload, ApiSuccessPayload } from "@/lib/api-response";

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  const json = (await response.json()) as ApiSuccessPayload<T> | ApiErrorPayload;

  if (!response.ok || !json.success) {
    const message =
      "error" in json ? json.error : `Request failed (${response.status})`;
    throw new ApiClientError(message, response.status);
  }

  return json.data;
}

export async function apiGet<T>(url: string): Promise<T> {
  return apiFetch<T>(url);
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "POST", body: JSON.stringify(body) });
}

export async function apiPut<T>(url: string, body: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "PUT", body: JSON.stringify(body) });
}

export async function apiDelete<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "DELETE" });
}

export async function apiUploadAudio(file: Blob, filename = "recording.webm"): Promise<{
  audioFile: string;
  filename: string;
}> {
  const formData = new FormData();
  formData.append("file", file, filename);

  const response = await fetch("/api/uploads/audio", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const json = (await response.json()) as ApiSuccessPayload<{
    audioFile: string;
    filename: string;
  }> | ApiErrorPayload;

  if (!response.ok || !json.success) {
    const message =
      "error" in json ? json.error : `Upload failed (${response.status})`;
    throw new ApiClientError(message, response.status);
  }

  return json.data;
}

export interface SalesMediaUploadResult {
  url: string;
  type: "image" | "video";
  filename: string;
  uploadedAt: string;
}

export async function apiUploadSalesMedia(file: File): Promise<SalesMediaUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/sales", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const json = (await response.json()) as ApiSuccessPayload<SalesMediaUploadResult> | ApiErrorPayload;

  if (!response.ok || !json.success) {
    const message =
      "error" in json ? json.error : `Upload failed (${response.status})`;
    throw new ApiClientError(message, response.status);
  }

  return json.data;
}

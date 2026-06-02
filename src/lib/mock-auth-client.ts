"use client";

import type { LoginMethod } from "@/lib/constants";
import type { MappedUser } from "@/lib/mappers";

export const MOCK_AUTH_KEY = "agropulse_auth";
export const MOCK_AUTH_VALUE = "true";
export const MOCK_PASSWORD = "1421998A";
const AUTH_COOKIE_NAME = "agropulse_token";

const MOCK_IDENTIFIERS: Record<LoginMethod, string> = {
  email: "owner@tasks.cash",
  username: "owner",
  phone: "+213000000000",
};

export const MOCK_USER: MappedUser = {
  id: "mock-owner",
  name: "Owner",
  email: "owner@tasks.cash",
  username: "owner",
  phone: "+213000000000",
  role: "owner",
  roleLabel: "Owner",
  isActive: true,
};

function normalizePhone(phone: string): string {
  return phone.trim().replace(/\s/g, "");
}

function normalizeIdentifier(method: LoginMethod, identifier: string): string {
  const trimmed = identifier.trim();
  if (method === "email") return trimmed.toLowerCase();
  if (method === "phone") return normalizePhone(trimmed);
  return trimmed;
}

export function validateMockLogin(
  method: LoginMethod,
  identifier: string,
  password: string
): boolean {
  if (password !== MOCK_PASSWORD) return false;
  return normalizeIdentifier(method, identifier) === MOCK_IDENTIFIERS[method];
}

export function isMockAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MOCK_AUTH_KEY) === MOCK_AUTH_VALUE;
}

function setAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE_NAME}=mock; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function setMockSession(): void {
  localStorage.setItem(MOCK_AUTH_KEY, MOCK_AUTH_VALUE);
  setAuthCookie();
}

export function clearMockSession(): void {
  localStorage.removeItem(MOCK_AUTH_KEY);
  clearAuthCookie();
}

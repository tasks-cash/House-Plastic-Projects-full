import "server-only";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/constants";
import User, { type IUser } from "@/models/User";
import { connectDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET ?? "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";
const COOKIE_NAME = process.env.COOKIE_NAME ?? "agropulse_token";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
  userId: string;
  role: UserRole;
  name: string;
  email?: string;
  username?: string;
  phone?: string;
}

export interface SessionUser extends SessionPayload {
  id: string;
}

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return JWT_SECRET;
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as SessionPayload;
    if (!decoded?.userId || !decoded?.role) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    userId: payload.userId,
    role: payload.role,
    name: payload.name,
    email: payload.email,
    username: payload.username,
    phone: payload.phone,
  };
}

export async function setAuthCookie(payload: SessionPayload): Promise<void> {
  const token = signToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

function normalizePhone(phone: string): string {
  return phone.trim().replace(/\s/g, "");
}

function normalizeIdentifier(method: "phone" | "email" | "username", identifier: string): string {
  const trimmed = identifier.trim();

  switch (method) {
    case "email":
      return trimmed.toLowerCase();
    case "phone":
      return normalizePhone(trimmed);
    default:
      return trimmed;
  }
}

export async function authenticateUser(
  method: "phone" | "email" | "username",
  identifier: string,
  password: string
): Promise<IUser | null> {
  await connectDB();

  const value = normalizeIdentifier(method, identifier);

  const query =
    method === "email"
      ? { email: value }
      : method === "phone"
        ? { phone: value }
        : { username: value };

  const user = await User.findOne({ ...query, isActive: true }).select("+passwordHash");

  if (!user?.passwordHash) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return user;
}

export function userToSession(user: IUser): SessionPayload {
  return {
    userId: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
  };
}

export { COOKIE_NAME };

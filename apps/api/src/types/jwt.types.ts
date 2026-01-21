import { UserRoles } from "@repo/types";

export type TokenType = "access" | "refresh";

export interface BaseTokenPayload {
  sub: string; // User ID
  tokenType: TokenType;
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

export interface AccessTokenPayload extends BaseTokenPayload {
  tokenType: "access";
  role: UserRoles; // User role
}

export interface RefreshTokenPayload extends BaseTokenPayload {
  tokenType: "refresh";
  sessionId: string; // Session ID
}

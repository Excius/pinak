import jwt, { SignOptions } from "jsonwebtoken";
import { AccessTokenPayload, RefreshTokenPayload } from "../types/jwt.types.js";
import loggerInstance from "./logger.js";

/**
 * Service for handling JWT token generation and verification.
 */
class JWTService {
  constructor(
    private accessSecret: string,
    private refreshSecret: string,
    private accessTokenExpiry: number,
    private refreshTokenExpiry: number,
  ) {}

  public generateAccessToken(
    payload: Omit<AccessTokenPayload, "tokenType">,
  ): string {
    try {
      return jwt.sign({ ...payload, tokenType: "access" }, this.accessSecret, {
        expiresIn: this.accessTokenExpiry,
      } as SignOptions);
    } catch (error) {
      loggerInstance.error("Error generating JWT token:", error);
      throw error;
    }
  }

  public generateRefreshToken(payload: Omit<RefreshTokenPayload, "tokenType">) {
    try {
      return jwt.sign(
        { ...payload, tokenType: "refresh" },
        this.refreshSecret,
        {
          expiresIn: this.refreshTokenExpiry,
        } as SignOptions,
      );
    } catch (error) {
      loggerInstance.error("Error generating JWT token:", error);
      throw error;
    }
  }

  public verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      const decoded = jwt.verify(
        token,
        this.accessSecret,
      ) as AccessTokenPayload;
      if (decoded.tokenType !== "access") {
        throw new Error("Invalid token type");
      }
      return decoded;
    } catch (error) {
      loggerInstance.error("Error verifying access token:", error);
      return null;
    }
  }

  public verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const decoded = jwt.verify(
        token,
        this.refreshSecret,
      ) as RefreshTokenPayload;
      if (decoded.tokenType !== "refresh") {
        throw new Error("Invalid token type");
      }
      return decoded;
    } catch (error) {
      loggerInstance.error("Error verifying refresh token:", error);
      return null;
    }
  }

  public rotateRefreshToken(
    payload: RefreshTokenPayload,
    newSessionId: string,
  ): string {
    return this.generateRefreshToken({
      sub: payload.sub,
      sessionId: newSessionId,
    });
  }
}

export default JWTService;

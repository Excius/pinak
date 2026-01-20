import argon2 from "argon2";
import loggerInstance from "./logger.js";

/**
 * Password hasher service using Argon2id algorithm.
 */
export class Passwordhasher {
  /**
   * Hashes a plain text password using Argon2id algorithm.
   * @param password The plain text password to hash.
   * @returns The hashed password.
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      return await argon2.hash(password, { type: argon2.argon2id });
    } catch (e) {
      loggerInstance.error("Error hashing password:", e);
      throw e;
    }
  }

  /**
   * Verifies a plain text password against a hashed password.
   * @param password The plain text password to verify.
   * @param hashedPassword The hashed password to compare against.
   * @returns True if the password matches the hash, false otherwise.
   */

  static async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, password);
    } catch (e) {
      loggerInstance.error("Error verifying password:", e);
      throw e;
    }
  }
}

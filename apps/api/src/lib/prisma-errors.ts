export function isPrismaP2002(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  // `code` is commonly present on Prisma errors
  return ('code' in err) && (err as { code?: unknown }).code === 'P2002';
}

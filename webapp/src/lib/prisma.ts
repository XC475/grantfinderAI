import { PrismaClient } from "@/generated/prisma";

const globalScope = globalThis as unknown as { __prisma?: PrismaClient };

export const prisma: PrismaClient = globalScope.__prisma || new PrismaClient();

globalScope.__prisma = prisma;

export default prisma;

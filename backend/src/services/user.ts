import { prisma } from "../lib/prisma";

// get user from email or username
export const getUserByEmailOrUsername = async (identifier: string) => {
    const isEmail = identifier.includes('@');
    return await prisma.user.findFirst({
        where: { OR: [{ email: identifier }, { username: identifier }] },
    });
};
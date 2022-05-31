import { PrismaClient } from '@prisma/client';
import type { Guild } from '.prisma/client';

const prisma = new PrismaClient();

export const db = {
    prisma,
    guilds: {
        insert: async (guildId: string) => {
            try {
                return await prisma.guild.create({
                    data: {
                        id: guildId,
                    },
                });
            } catch (err: any) {
                if (err?.message?.includes('Unique constraint failed on the fields: (`id`)')) {
                    throw new Error('Guild already exists in the database.');
                }

                throw new Error('Unable to insert guild.');
            }
        },
        delete: async (guildId: string) => {
            try {
                await prisma.guild.delete({
                    where: {
                        id: guildId,
                    },
                });
            } catch (err) {
                throw new Error("Unable to delete a guild that doesn't exist in the database.");
            }
        },
        get: async (guildId: string) => {
            const guild = await prisma.guild.findUnique({
                where: {
                    id: guildId,
                },
            });

            return guild;
        },
        getAll: async () => {
            const guilds = await prisma.guild.findMany();

            return guilds;
        },
        getOrInsert: async (guildId: string) => {
            const guild = await db.guilds.get(guildId);

            if (guild) return guild;

            try {
                return await db.guilds.insert(guildId);
            } catch (err) {
                console.log('db.guilds.getOrInsert was unable to inset guild:', err);
            }

            throw new Error('Unable to get or insert guild configuration.');
        },
        includes: async (guildId: string) => {
            const guildCount = await prisma.guild.count({
                where: {
                    id: guildId,
                },
            });

            return guildCount > 0;
        },
        update: async (guildId: string, data: Omit<Partial<Guild>, 'id'>) => {
            if ('id' in data) delete (data as Partial<Guild>).id;

            try {
                return await prisma.guild.update({
                    where: {
                        id: guildId,
                    },
                    data,
                });
            } catch (err: any) {
                if (err?.message?.includes('Record to update not found')) {
                    throw new Error('Guild to update not found.');
                }
                throw new Error('Unable to update guild configuration.');
            }
        },
        size: async () => {
            return await db.prisma.guild.count();
        },
        permissions: {
            roles: {
                get: async (guildId: string) => {
                    return await prisma.rolePermissionOverride.findMany({
                        where: {
                            guildId,
                        },
                    });
                },
                getByRoleId: async (guildId: string, roleId: string) => {
                    return await prisma.rolePermissionOverride.findMany({
                        where: {
                            guildId,
                            roleId,
                        },
                    });
                },
                update: async (guildId: string, roleId: string, commandName: string, allow: boolean | null) => {
                    if (allow === null) {
                        await prisma.rolePermissionOverride.delete({
                            where: {
                                guildId_roleId_commandName: {
                                    guildId,
                                    roleId,
                                    commandName,
                                },
                            },
                        });
                        return;
                    }

                    await prisma.rolePermissionOverride.upsert({
                        where: {
                            guildId_roleId_commandName: {
                                guildId,
                                roleId,
                                commandName,
                            },
                        },
                        update: { allow },
                        create: { guildId, roleId, commandName, allow },
                    });
                },
            },
            users: {
                get: async (guildId: string) => {
                    return await prisma.userPermissionOverride.findMany({ where: { guildId } });
                },
                getByUserId: async (guildId: string, userId: string) => {
                    return await prisma.userPermissionOverride.findMany({ where: { guildId, userId } });
                },
                update: async (guildId: string, userId: string, commandName: string, allow: boolean | null) => {
                    if (allow === null) {
                        await prisma.userPermissionOverride.delete({
                            where: {
                                guildId_userId_commandName: {
                                    guildId,
                                    userId,
                                    commandName,
                                },
                            },
                        });
                        return;
                    }

                    await prisma.userPermissionOverride.upsert({
                        where: {
                            guildId_userId_commandName: {
                                guildId,
                                userId,
                                commandName,
                            },
                        },
                        update: { allow },
                        create: { guildId, userId, commandName, allow },
                    });
                },
            },
        },
    },
};

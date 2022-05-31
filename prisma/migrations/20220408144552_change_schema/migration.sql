/*
  Warnings:

  - You are about to drop the `migrations_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `migrations_history_lock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "migrations_history";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "migrations_history_lock";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_guilds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prefix" TEXT,
    "sync_channel_id" TEXT,
    "directory_channel_id" TEXT
);
INSERT INTO "new_guilds" ("directory_channel_id", "id", "prefix", "sync_channel_id") SELECT "directory_channel_id", "id", "prefix", "sync_channel_id" FROM "guilds";
DROP TABLE "guilds";
ALTER TABLE "new_guilds" RENAME TO "guilds";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- RedefineIndex
DROP INDEX "permission_overrides_guildid_roleid_commandname_unique";
CREATE UNIQUE INDEX "role_permission_overrides_guildId_roleId_commandName_key" ON "role_permission_overrides"("guildId", "roleId", "commandName");

-- RedefineIndex
DROP INDEX "user_permission_overrides_guildid_userid_commandname_unique";
CREATE UNIQUE INDEX "user_permission_overrides_guildId_userId_commandName_key" ON "user_permission_overrides"("guildId", "userId", "commandName");

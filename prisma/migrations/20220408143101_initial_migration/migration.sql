-- CreateTable
CREATE TABLE "guilds" (
    "id" TEXT NOT NULL,
    "prefix" TEXT,
    "sync_channel_id" TEXT,
    "directory_channel_id" TEXT
);

-- CreateTable
CREATE TABLE "migrations_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "batch" INTEGER,
    "migration_time" DATETIME
);

-- CreateTable
CREATE TABLE "migrations_history_lock" (
    "index" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "is_locked" INTEGER
);

-- CreateTable
CREATE TABLE "role_permission_overrides" (
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "commandName" TEXT NOT NULL,
    "allow" BOOLEAN NOT NULL,
    CONSTRAINT "role_permission_overrides_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "user_permission_overrides" (
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commandName" TEXT NOT NULL,
    "allow" BOOLEAN NOT NULL,
    CONSTRAINT "user_permission_overrides_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
CREATE UNIQUE INDEX "guilds_id_unique" ON "guilds"("id");

-- CreateIndex
CREATE UNIQUE INDEX "permission_overrides_guildid_roleid_commandname_unique" ON "role_permission_overrides"("guildId", "roleId", "commandName");

-- CreateIndex
CREATE UNIQUE INDEX "user_permission_overrides_guildid_userid_commandname_unique" ON "user_permission_overrides"("guildId", "userId", "commandName");

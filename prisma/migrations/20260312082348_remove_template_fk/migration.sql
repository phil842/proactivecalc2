-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActivityInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "resourceUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "skippedReason" TEXT,
    "suggestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActivityInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActivityInstance" ("completedAt", "description", "estimatedTime", "id", "resourceUrl", "skippedReason", "status", "suggestedAt", "templateId", "title", "updatedAt", "userId") SELECT "completedAt", "description", "estimatedTime", "id", "resourceUrl", "skippedReason", "status", "suggestedAt", "templateId", "title", "updatedAt", "userId" FROM "ActivityInstance";
DROP TABLE "ActivityInstance";
ALTER TABLE "new_ActivityInstance" RENAME TO "ActivityInstance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

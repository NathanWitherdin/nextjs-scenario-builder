/*
  Warnings:

  - Added the required column `updatedAt` to the `Scenario` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Scenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timerMinutes" INTEGER NOT NULL,
    "backgroundUrl" TEXT NOT NULL,
    "punishmentText" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Scenario" ("backgroundUrl", "id", "punishmentText", "rules", "timerMinutes") SELECT "backgroundUrl", "id", "punishmentText", "rules", "timerMinutes" FROM "Scenario";
DROP TABLE "Scenario";
ALTER TABLE "new_Scenario" RENAME TO "Scenario";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

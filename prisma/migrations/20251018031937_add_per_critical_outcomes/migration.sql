/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Scenario` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Scenario` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT,
    "text" TEXT NOT NULL,
    "answer" TEXT,
    "order" INTEGER NOT NULL,
    "punishment" TEXT,
    "reason" TEXT,
    "canReturn" BOOLEAN,
    "courtBgUrl" TEXT,
    "courtOutcome" JSONB,
    CONSTRAINT "Message_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("answer", "category", "courtOutcome", "id", "order", "scenarioId", "severity", "text") SELECT "answer", "category", "courtOutcome", "id", "order", "scenarioId", "severity", "text" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE INDEX "Message_scenarioId_idx" ON "Message"("scenarioId");
CREATE TABLE "new_Scenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timerMinutes" INTEGER NOT NULL,
    "backgroundUrl" TEXT NOT NULL,
    "punishmentText" TEXT NOT NULL,
    "rules" JSONB NOT NULL
);
INSERT INTO "new_Scenario" ("backgroundUrl", "id", "punishmentText", "rules", "timerMinutes") SELECT "backgroundUrl", "id", "punishmentText", "rules", "timerMinutes" FROM "Scenario";
DROP TABLE "Scenario";
ALTER TABLE "new_Scenario" RENAME TO "Scenario";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

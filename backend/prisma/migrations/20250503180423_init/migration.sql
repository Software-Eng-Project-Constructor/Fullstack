-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedToId" TEXT,
    "approved" BOOLEAN DEFAULT false,
    "status" TEXT DEFAULT 'Pending',
    "priority" TEXT DEFAULT 'Medium',
    "startDate" DATETIME,
    "dueDate" DATETIME,
    "projectId" INTEGER,
    "milestoneId" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_status_fkey" FOREIGN KEY ("status") REFERENCES "TaskStatus" ("name") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("approved", "assignedToId", "createdAt", "createdById", "description", "dueDate", "id", "milestoneId", "priority", "projectId", "startDate", "status", "title", "updatedAt") SELECT "approved", "assignedToId", "createdAt", "createdById", "description", "dueDate", "id", "milestoneId", "priority", "projectId", "startDate", "status", "title", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

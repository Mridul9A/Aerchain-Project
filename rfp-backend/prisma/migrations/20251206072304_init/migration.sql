-- CreateTable
CREATE TABLE "Rfp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "descriptionRaw" TEXT NOT NULL,
    "budget" INTEGER,
    "deliveryDeadline" DATETIME,
    "paymentTerms" TEXT,
    "warrantyMinMonths" INTEGER,
    "items" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "category" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rfpId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "rawText" TEXT NOT NULL,
    "parsed" JSONB,
    "totalPrice" REAL,
    "currency" TEXT,
    "deliveryDays" INTEGER,
    "warrantyYears" REAL,
    "paymentTerms" TEXT,
    "score" REAL,
    "aiSummary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Proposal_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "Rfp" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Proposal_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "positionTitle" TEXT NOT NULL,
    "seniority" TEXT,
    "experienceMin" INTEGER,
    "experienceMax" INTEGER,
    "locations" TEXT[],
    "remoteOnly" BOOLEAN NOT NULL DEFAULT false,
    "technologies" TEXT[],
    "includedKeywords" TEXT[],
    "excludedKeywords" TEXT[],
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchProfile_userId_key" ON "SearchProfile"("userId");

-- CreateIndex
CREATE INDEX "SearchProfile_userId_idx" ON "SearchProfile"("userId");

-- CreateIndex
CREATE INDEX "SearchProfile_seniority_idx" ON "SearchProfile"("seniority");

-- AddForeignKey
ALTER TABLE "SearchProfile" ADD CONSTRAINT "SearchProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

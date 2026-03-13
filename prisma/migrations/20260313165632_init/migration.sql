-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mintAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "platform" TEXT NOT NULL,
    "socialHandle" TEXT NOT NULL,
    "creatorPublicKey" TEXT NOT NULL,
    "encryptedPrivateKey" TEXT NOT NULL,
    "launcherWallet" TEXT NOT NULL,
    "claimStatus" TEXT NOT NULL DEFAULT 'UNCLAIMED',
    "claimedAt" DATETIME,
    "claimedBy" TEXT,
    "totalFeesEarned" REAL NOT NULL DEFAULT 0,
    "lastFeeCheck" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "socialHandle" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "destinationWallet" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_mintAddress_key" ON "Token"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Token_platform_socialHandle_key" ON "Token"("platform", "socialHandle");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_verificationCode_key" ON "Claim"("verificationCode");

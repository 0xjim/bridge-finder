-- CreateTable
CREATE TABLE "Network" (
    "id" TEXT NOT NULL,
    "networkName" TEXT NOT NULL,
    "commonAliases" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bridge" (
    "id" TEXT NOT NULL,
    "bridgeName" TEXT NOT NULL,
    "supportedChains" TEXT[],
    "baseUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bridge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BridgeRequest" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "rawQuery" TEXT NOT NULL,
    "sourceChain" TEXT,
    "destinationChain" TEXT,
    "bridges" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BridgeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Network_networkName_key" ON "Network"("networkName");

-- CreateIndex
CREATE INDEX "Network_networkName_idx" ON "Network"("networkName");

-- CreateIndex
CREATE UNIQUE INDEX "Bridge_bridgeName_key" ON "Bridge"("bridgeName");

-- CreateIndex
CREATE INDEX "Bridge_bridgeName_idx" ON "Bridge"("bridgeName");

-- CreateIndex
CREATE UNIQUE INDEX "BridgeRequest_requestId_key" ON "BridgeRequest"("requestId");

-- CreateIndex
CREATE INDEX "BridgeRequest_requestId_idx" ON "BridgeRequest"("requestId");

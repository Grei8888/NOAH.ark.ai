-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interests" JSONB NOT NULL,
    "regions" JSONB NOT NULL,
    "entities" JSONB NOT NULL,
    "businessInterests" JSONB NOT NULL,
    "researchInterests" JSONB NOT NULL,
    "careerInterests" JSONB NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "reliability" DOUBLE PRECISION NOT NULL DEFAULT 5,

    CONSTRAINT "NewsSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "ingestionKey" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceDomain" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "author" TEXT,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL,
    "newsLabel" TEXT,
    "description" TEXT NOT NULL,
    "contentSnippet" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "language" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "queryGroup" TEXT NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "duplicateOfId" TEXT,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "representativeTitle" TEXT NOT NULL,
    "primaryCategory" TEXT NOT NULL DEFAULT 'OTHER',
    "secondaryCategories" JSONB NOT NULL,
    "tags" JSONB NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "articleCount" INTEGER NOT NULL DEFAULT 0,
    "sourceCount" INTEGER NOT NULL DEFAULT 0,
    "eventSummary" TEXT NOT NULL DEFAULT '',
    "importanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "breakingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grade" TEXT NOT NULL DEFAULT 'D',
    "isOpportunity" BOOLEAN NOT NULL DEFAULT false,
    "opportunityReason" TEXT,
    "officialSourceAvailable" BOOLEAN NOT NULL DEFAULT false,
    "analysisStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "analysisHash" TEXT,
    "analysis" JSONB,
    "analysisError" TEXT,
    "isMock" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventArticle" (
    "eventId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,

    CONSTRAINT "EventArticle_pkey" PRIMARY KEY ("eventId","articleId")
);

-- CreateTable
CREATE TABLE "DailyArk" (
    "id" TEXT NOT NULL,
    "arkDate" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "eventCount" INTEGER NOT NULL,
    "overview" TEXT NOT NULL,
    "isMock" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyArk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArkItem" (
    "id" TEXT NOT NULL,
    "arkId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArkItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "articlesFetched" INTEGER NOT NULL DEFAULT 0,
    "articlesInserted" INTEGER NOT NULL DEFAULT 0,
    "duplicatesRemoved" INTEGER NOT NULL DEFAULT 0,
    "eventsCreated" INTEGER NOT NULL DEFAULT 0,
    "eventsUpdated" INTEGER NOT NULL DEFAULT 0,
    "aiRequests" INTEGER NOT NULL DEFAULT 0,
    "aiSuccess" INTEGER NOT NULL DEFAULT 0,
    "aiFailed" INTEGER NOT NULL DEFAULT 0,
    "arkGenerated" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "errorMessage" TEXT,

    CONSTRAINT "PipelineLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineLock" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PipelineLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakingCandidate" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "analysisHash" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertedAt" TIMESTAMP(3),

    CONSTRAINT "BreakingCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsSource_domain_key" ON "NewsSource"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "SearchQuery_query_key" ON "SearchQuery"("query");

-- CreateIndex
CREATE UNIQUE INDEX "Article_ingestionKey_key" ON "Article"("ingestionKey");

-- CreateIndex
CREATE INDEX "Article_canonicalUrl_idx" ON "Article"("canonicalUrl");

-- CreateIndex
CREATE INDEX "Article_normalizedTitle_idx" ON "Article"("normalizedTitle");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_fingerprint_key" ON "Event"("fingerprint");

-- CreateIndex
CREATE INDEX "Event_lastSeenAt_analysisStatus_idx" ON "Event"("lastSeenAt", "analysisStatus");

-- CreateIndex
CREATE UNIQUE INDEX "EventArticle_articleId_key" ON "EventArticle"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyArk_arkDate_key" ON "DailyArk"("arkDate");

-- CreateIndex
CREATE UNIQUE INDEX "ArkItem_arkId_eventId_key" ON "ArkItem"("arkId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "ArkItem_arkId_rank_key" ON "ArkItem"("arkId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "BreakingCandidate_eventId_analysisHash_key" ON "BreakingCandidate"("eventId", "analysisHash");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventArticle" ADD CONSTRAINT "EventArticle_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventArticle" ADD CONSTRAINT "EventArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArkItem" ADD CONSTRAINT "ArkItem_arkId_fkey" FOREIGN KEY ("arkId") REFERENCES "DailyArk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArkItem" ADD CONSTRAINT "ArkItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakingCandidate" ADD CONSTRAINT "BreakingCandidate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

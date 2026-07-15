-- CreateTable
CREATE TABLE "UmuxResponse" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "q1" INTEGER NOT NULL,
    "q2" INTEGER NOT NULL,
    "q3" INTEGER NOT NULL,
    "q4" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UmuxResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UmuxResponse_userId_idx" ON "UmuxResponse"("userId");

-- CreateIndex
CREATE INDEX "UmuxResponse_submittedAt_idx" ON "UmuxResponse"("submittedAt" DESC);

-- AddForeignKey
ALTER TABLE "UmuxResponse" ADD CONSTRAINT "UmuxResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

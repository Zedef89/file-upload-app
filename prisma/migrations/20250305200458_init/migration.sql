-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "roles" TEXT[],
    "localPath" TEXT NOT NULL,
    "minioPath" TEXT,
    "filePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

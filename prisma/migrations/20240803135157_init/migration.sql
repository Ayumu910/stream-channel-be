-- CreateTable
CREATE TABLE "Account" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_guest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "playlist_id" SERIAL NOT NULL,
    "playlist_title" VARCHAR(255) NOT NULL,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("playlist_id")
);

-- CreateTable
CREATE TABLE "StreamerCategory" (
    "category_id" SERIAL NOT NULL,
    "category_title" VARCHAR(255) NOT NULL,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "StreamerCategory_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "Streamer" (
    "streamer_id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "platform" VARCHAR(50) NOT NULL,

    CONSTRAINT "Streamer_pkey" PRIMARY KEY ("streamer_id")
);

-- CreateTable
CREATE TABLE "Stream" (
    "stream_id" VARCHAR(255) NOT NULL,
    "stream_title" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "good_rate" INTEGER NOT NULL DEFAULT 0,
    "bad_rate" INTEGER NOT NULL DEFAULT 0,
    "streamer_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("stream_id")
);

-- CreateTable
CREATE TABLE "StreamerCategoryRelation" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "streamer_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "StreamerCategoryRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamPlaylistRelation" (
    "id" SERIAL NOT NULL,
    "playlist_id" INTEGER NOT NULL,
    "stream_id" VARCHAR(255) NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamPlaylistRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamerComment" (
    "comment_id" SERIAL NOT NULL,
    "comment_text" TEXT NOT NULL,
    "streamer_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "StreamerComment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "StreamerAnalysis" (
    "analysis_id" SERIAL NOT NULL,
    "users_age" INTEGER NOT NULL DEFAULT 0,
    "users_gender" VARCHAR(20) NOT NULL DEFAULT '',
    "humor" INTEGER NOT NULL DEFAULT 0,
    "gaming_skill" INTEGER NOT NULL DEFAULT 0,
    "appearance" INTEGER NOT NULL DEFAULT 0,
    "uniqueness" INTEGER NOT NULL DEFAULT 0,
    "collaboration_frequency" INTEGER NOT NULL DEFAULT 0,
    "streaming_frequency" INTEGER NOT NULL DEFAULT 0,
    "game_or_chat" INTEGER NOT NULL DEFAULT 0,
    "wholesomeness" INTEGER NOT NULL DEFAULT 0,
    "streamer_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "StreamerAnalysis_pkey" PRIMARY KEY ("analysis_id")
);

-- CreateTable
CREATE TABLE "StreamComment" (
    "comment_id" SERIAL NOT NULL,
    "comment_text" TEXT NOT NULL,
    "stream_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "StreamComment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_user_id_key" ON "Account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_playlist_id_key" ON "Playlist"("playlist_id");

-- CreateIndex
CREATE UNIQUE INDEX "StreamerCategory_category_id_key" ON "StreamerCategory"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "Streamer_streamer_id_key" ON "Streamer"("streamer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Stream_stream_id_key" ON "Stream"("stream_id");

-- CreateIndex
CREATE UNIQUE INDEX "StreamerCategoryRelation_id_key" ON "StreamerCategoryRelation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StreamPlaylistRelation_id_key" ON "StreamPlaylistRelation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StreamerComment_comment_id_key" ON "StreamerComment"("comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "StreamerAnalysis_analysis_id_key" ON "StreamerAnalysis"("analysis_id");

-- CreateIndex
CREATE UNIQUE INDEX "StreamComment_comment_id_key" ON "StreamComment"("comment_id");

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Account"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamerCategory" ADD CONSTRAINT "StreamerCategory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Account"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "Streamer"("streamer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamerCategoryRelation" ADD CONSTRAINT "StreamerCategoryRelation_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "StreamerCategory"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamerCategoryRelation" ADD CONSTRAINT "StreamerCategoryRelation_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "Streamer"("streamer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamPlaylistRelation" ADD CONSTRAINT "StreamPlaylistRelation_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlist"("playlist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamPlaylistRelation" ADD CONSTRAINT "StreamPlaylistRelation_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "Stream"("stream_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamerComment" ADD CONSTRAINT "StreamerComment_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "Streamer"("streamer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamerAnalysis" ADD CONSTRAINT "StreamerAnalysis_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "Streamer"("streamer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamComment" ADD CONSTRAINT "StreamComment_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "Stream"("stream_id") ON DELETE RESTRICT ON UPDATE CASCADE;

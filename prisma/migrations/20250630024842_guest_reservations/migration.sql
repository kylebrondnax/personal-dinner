-- DropIndex
DROP INDEX "reservations_eventId_userId_key";

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "guestEmail" TEXT,
ADD COLUMN     "guestName" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

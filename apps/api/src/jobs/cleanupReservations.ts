import logger from "../lib/logger.js";
import { prisma } from "../lib/prisma.js";
import { StockReservationService } from "../services/stockReservation.service.js";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const startCleanupReservationsJob = () => {
  const service = new StockReservationService(prisma);

  return setInterval(async () => {
    try {
      const releasedCount = await service.cleanupExpiredReservations();
      if (releasedCount > 0) {
        logger.info(
          `Released expired inventory reservations. Count: ${releasedCount}`
        );
      }
    } catch (error) {
      logger.error(`Failed to cleanup expired reservations: ${error}`);
    }
  }, FIVE_MINUTES_MS);
};

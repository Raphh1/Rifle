import { ACTIVE_TICKET_STATUSES } from "../constants/ticketStatus.js";

export const publicEventInclude = {
  organizer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  _count: {
    select: {
      tickets: {
        where: {
          status: {
            in: ACTIVE_TICKET_STATUSES,
          },
        },
      },
    },
  },
};

export const eventWithRemaining = (event) => ({
  ...event,
  remaining: Math.max(0, event.capacity - (event._count?.tickets ?? 0)),
});

import {
  checkInEvent,
  createEvent,
  listCourseEvents,
  listUpcomingEvents,
  type EventRecord,
} from "@/features/events/infrastructure/supabaseEventRepository.server";

export type EventDoc = EventRecord;

export const eventService = {
  async getUpcomingEvents(limitCount = 3): Promise<EventDoc[]> {
    return listUpcomingEvents(limitCount);
  },

  async getCourseEvents(courseId: string): Promise<EventDoc[]> {
    return listCourseEvents(courseId);
  },

  async checkInEvent(checkInCode: string, userId: string) {
    return checkInEvent(checkInCode, userId);
  },

  async createEvent(input: Parameters<typeof createEvent>[0]) {
    return createEvent(input);
  },
};

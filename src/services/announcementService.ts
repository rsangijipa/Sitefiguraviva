import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { AnnouncementDoc } from "@/types/lms";

const map = (row: any): AnnouncementDoc => ({
  id: row.id,
  courseId: row.course_id || "",
  title: row.title,
  content: row.content,
  authorId: row.author_id || "",
  isPinned: row.is_pinned,
  publishAt: row.publish_at || row.created_at,
  createdAt: row.created_at as any,
});

export const announcementService = {
  async getCourseAnnouncements(courseId: string): Promise<AnnouncementDoc[]> {
    const { data, error } = await (createSupabaseBrowserClient() as any)
      .from("announcements")
      .select("*")
      .eq("course_id", courseId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(map);
  },
  async getPublishedAnnouncements(
    courseId: string,
    _tenantId?: string,
  ): Promise<AnnouncementDoc[]> {
    const { data, error } = await (createSupabaseBrowserClient() as any)
      .from("announcements")
      .select("*")
      .eq("course_id", courseId)
      .lte("publish_at", new Date().toISOString())
      .order("is_pinned", { ascending: false })
      .order("publish_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(map);
  },
  subscribeToPublishedAnnouncements(
    courseId: string,
    callback: (items: AnnouncementDoc[]) => void,
    _tenantId?: string,
  ) {
    const supabase: any = createSupabaseBrowserClient();
    const load = async () =>
      callback(await this.getCourseAnnouncements(courseId));
    void load();
    const channel = supabase
      .channel(`announcements:${courseId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcements",
          filter: `course_id=eq.${courseId}`,
        },
        load,
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  },
  async createAnnouncement(
    courseId: string,
    data: Omit<AnnouncementDoc, "id" | "createdAt" | "authorId" | "courseId">,
  ): Promise<string> {
    const supabase: any = createSupabaseBrowserClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) throw new Error("Usuário não autenticado");
    const publishAt =
      data.publishAt instanceof Date
        ? data.publishAt.toISOString()
        : typeof data.publishAt === "string"
          ? data.publishAt
          : new Date().toISOString();
    const { data: row, error } = await supabase
      .from("announcements")
      .insert({
        course_id: courseId,
        title: data.title,
        content: data.content,
        author_id: authData.user.id,
        is_pinned: data.isPinned,
        publish_at: publishAt,
      })
      .select("id")
      .single();
    if (error) throw error;
    return row.id;
  },
  async updateAnnouncement(
    courseId: string,
    id: string,
    data: Partial<AnnouncementDoc>,
  ) {
    const { error } = await (createSupabaseBrowserClient() as any)
      .from("announcements")
      .update({
        title: data.title,
        content: data.content,
        is_pinned: data.isPinned,
      })
      .eq("id", id)
      .eq("course_id", courseId);
    if (error) throw error;
  },
  async deleteAnnouncement(courseId: string, id: string) {
    const { error } = await (createSupabaseBrowserClient() as any)
      .from("announcements")
      .delete()
      .eq("id", id)
      .eq("course_id", courseId);
    if (error) throw error;
  },
};

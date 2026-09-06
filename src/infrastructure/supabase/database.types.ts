export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "tutor" | "student";
export type CourseStatus = "draft" | "open" | "closed" | "archived";
export type BillingType = "subscription" | "one_time" | "free";
export type LessonType = "video" | "text" | "quiz" | "library" | "live";
export type EnrollmentStatus =
  | "pending_approval"
  | "active"
  | "completed"
  | "canceled"
  | "refunded"
  | "pending"
  | "expired"
  | "locked"
  | "awaiting_payment"
  | "awaiting_approval"
  | "blocked"
  | "past_due"
  | "rejected";
export type PaymentStatus = "paid" | "pending" | "failed";
export type ProgressStatus = "completed" | "in_progress";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          legacy_firebase_uid: string | null;
          email: string;
          display_name: string | null;
          photo_url: string | null;
          role: AppRole;
          is_active: boolean;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          slug: string | null;
          description: string | null;
          cover_image_url: string | null;
          image_url: string | null;
          thumbnail_url: string | null;
          instructor_name: string | null;
          instructor_title: string | null;
          workload_minutes: number | null;
          duration_label: string | null;
          level: string | null;
          category: string | null;
          is_published: boolean;
          status: CourseStatus;
          content_revision: number;
          billing_type: BillingType;
          stripe_price_id: string | null;
          stripe_product_id: string | null;
          tags: string[];
          details: Json;
          team: Json;
          stats: Json;
          community_enabled: boolean;
          certificate_rules: Json;
          legacy_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["courses"]["Row"]> & {
          id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["courses"]["Row"]>;
        Relationships: [];
      };
      course_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          sort_order: number;
          is_published: boolean;
          slug: string | null;
          legacy_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["course_modules"]["Row"]
        > & {
          id: string;
          course_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["course_modules"]["Row"]>;
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          module_id: string;
          title: string;
          description: string | null;
          sort_order: number;
          is_published: boolean;
          slug: string | null;
          type: LessonType;
          duration_minutes: number | null;
          video_url: string | null;
          thumbnail_url: string | null;
          blocks: Json;
          is_free_preview: boolean;
          legacy_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["lessons"]["Row"]> & {
          id: string;
          course_id: string;
          module_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Row"]>;
        Relationships: [];
      };
      lesson_materials: {
        Row: {
          id: string;
          course_id: string;
          lesson_id: string | null;
          title: string;
          type: "pdf" | "link" | "archive";
          url: string;
          description: string | null;
          is_published: boolean;
          download_count: number;
          legacy_payload: Json;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["lesson_materials"]["Row"]
        > & {
          id: string;
          course_id: string;
          title: string;
          type: "pdf" | "link" | "archive";
          url: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["lesson_materials"]["Row"]
        >;
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string | null;
          legacy_firebase_uid: string | null;
          course_id: string;
          user_name: string | null;
          status: EnrollmentStatus;
          payment_status: PaymentStatus | null;
          subscription_id: string | null;
          enrolled_at: string;
          paid_at: string | null;
          payment_method: "pix" | "stripe" | "subscription" | "free" | null;
          source_ref: string | null;
          access_until: string | null;
          approved_by: string | null;
          approved_at: string | null;
          rejection_reason: string | null;
          course_version_at_enrollment: number | null;
          course_snapshot_at_enrollment: Json;
          completed_at: string | null;
          last_accessed_at: string | null;
          progress_summary: Json;
          legacy_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["enrollments"]["Row"]> & {
          course_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["enrollments"]["Row"]>;
        Relationships: [];
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string | null;
          legacy_firebase_uid: string | null;
          course_id: string;
          lesson_id: string;
          status: ProgressStatus;
          percent: number;
          max_watched_second: number;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["lesson_progress"]["Row"]
        > & {
          course_id: string;
          lesson_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_progress"]["Row"]>;
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          user_id: string | null;
          legacy_firebase_uid: string | null;
          course_id: string;
          code: string;
          issued_at: string;
          metadata: Json;
          legacy_payload: Json;
        };
        Insert: Partial<Database["public"]["Tables"]["certificates"]["Row"]> & {
          course_id: string;
          code: string;
        };
        Update: Partial<Database["public"]["Tables"]["certificates"]["Row"]>;
        Relationships: [];
      };
      community_threads: {
        Row: {
          id: string;
          course_id: string;
          author_id: string | null;
          legacy_author_firebase_uid: string | null;
          title: string;
          content: string;
          author_name: string;
          author_avatar_url: string | null;
          reply_count: number;
          like_count: number;
          view_count: number;
          is_pinned: boolean;
          is_locked: boolean;
          is_deleted: boolean;
          last_reply_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["community_threads"]["Row"]
        > & {
          id: string;
          course_id: string;
          title: string;
          content: string;
          author_name: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["community_threads"]["Row"]
        >;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          event_type: string;
          actor_user_id: string | null;
          actor_email: string | null;
          actor_role: string | null;
          target_collection: string;
          target_id: string;
          payload: Json | null;
          diff: Json | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & {
          event_type: string;
          target_collection: string;
          target_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Relationships: [];
      };
      public_pages: {
        Row: {
          key: string;
          content: Json;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["public_pages"]["Row"]> & {
          key: string;
        };
        Update: Partial<Database["public"]["Tables"]["public_pages"]["Row"]>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string | null;
          subtitle: string | null;
          excerpt: string | null;
          content: string;
          type: string;
          image_url: string | null;
          external_url: string | null;
          pdf_url: string | null;
          tags: string[];
          is_published: boolean;
          published_at: string | null;
          legacy_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["posts"]["Row"]> & {
          id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Row"]>;
        Relationships: [];
      };
      gallery_items: {
        Row: {
          id: string;
          image_url: string;
          title: string | null;
          caption: string | null;
          tags: string[];
          width: number | null;
          height: number | null;
          is_published: boolean;
          legacy_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["gallery_items"]["Row"]
        > & {
          id: string;
          image_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_items"]["Row"]>;
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role: string | null;
          bio: string | null;
          image_url: string | null;
          sort_order: number;
          is_published: boolean;
          legacy_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["team_members"]["Row"]> & {
          id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["team_members"]["Row"]>;
        Relationships: [];
      };
      site_content: {
        Row: {
          key: string;
          content: Json;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_content"]["Row"]> & {
          key: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_content"]["Row"]>;
        Relationships: [];
      };
      assessments: {
        Row: {
          id: string;
          course_id: string;
          lesson_id: string | null;
          title: string;
          description: string | null;
          passing_score: number;
          total_points: number;
          questions: Json;
          status: "draft" | "published" | "archived";
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["assessments"]["Row"]> & {
          course_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["assessments"]["Row"]>;
        Relationships: [];
      };
      assessment_submissions: {
        Row: {
          id: string;
          assessment_id: string;
          user_id: string | null;
          legacy_firebase_uid: string | null;
          course_id: string;
          attempt_number: number;
          answers: Json;
          score: number;
          percentage: number;
          passed: boolean;
          status: "pending" | "submitted" | "graded";
          feedback: string | null;
          graded_by: string | null;
          started_at: string;
          submitted_at: string | null;
          graded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["assessment_submissions"]["Row"]
        > & {
          assessment_id: string;
          course_id: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["assessment_submissions"]["Row"]
        >;
        Relationships: [];
      };
      assessment_progress: {
        Row: {
          id: string;
          assessment_id: string;
          user_id: string | null;
          legacy_firebase_uid: string | null;
          course_id: string;
          attempts: number;
          best_score: number;
          best_percentage: number;
          passed: boolean;
          last_attempt_at: string | null;
          submissions: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["assessment_progress"]["Row"]
        > & {
          assessment_id: string;
          course_id: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["assessment_progress"]["Row"]
        >;
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          course_id: string | null;
          author_id: string | null;
          is_pinned: boolean;
          target_audience: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["announcements"]["Row"]
        > & {
          title: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      course_status: CourseStatus;
      billing_type: BillingType;
      lesson_type: LessonType;
      enrollment_status: EnrollmentStatus;
      payment_status: PaymentStatus;
      progress_status: ProgressStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type TableName = keyof Database["public"]["Tables"];
export type TableRow<TTable extends TableName> =
  Database["public"]["Tables"][TTable]["Row"];
export type TableInsert<TTable extends TableName> =
  Database["public"]["Tables"][TTable]["Insert"];
export type TableUpdate<TTable extends TableName> =
  Database["public"]["Tables"][TTable]["Update"];

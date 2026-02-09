# Gamification & Advanced Analytics Plan

**Status:** Completed
**Target:** Live (High Value)

---

## 1. Gamification Engine

### 1.1 Objectives

* Increase student retention and daily engagement.
* Reward positive behaviors (finishing lessons, passing quizzes, consistent study).
* Visual feedback for progress.

### 1.2 Data Model (`src/types/gamification.ts`)

#### **Badge System**

Badges will be static definitions in the code/database, and user assignments in Firestore.

```typescript
export type BadgeCategory = 'learning' | 'social' | 'achievement' | 'special';

export interface BadgeDefinition {
  id: string;
  slug: string; // e.g., 'first-lesson'
  title: string;
  description: string;
  icon: string; // Lucide icon name or URL
  category: BadgeCategory;
  xpValue: number;
  isHidden?: boolean; // Secret badges
}
```

#### **User Progress**

Extended User Profile or a separate `gamification` subcollection.

```typescript
export interface UserGamificationProfile {
  uid: string;
  totalXp: number;
  level: number; // Calculated from XP
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Timestamp; // To calculate streak
  badges: string[]; // List of badge IDs earned
}

export interface EarnedBadge {
  userId: string;
  badgeId: string;
  earnedAt: Timestamp;
}
```

### 1.3 key Mechanics

1. **XP System**:
    * Lesson Complete: 10 XP
    * Quiz Pass (>70%): 20 XP
    * Quiz Perfect (100%): 50 XP
    * Course Complete: 500 XP
    * Daily Login: 5 XP

2. **Streak System**:
    * Check `lastActivityDate` on login/action.
    * If `lastActivityDate` == yesterday, increment streak.
    * If `lastActivityDate` < yesterday, reset to 1.
    * If `lastActivityDate` == today, do nothing.

3. **Badge Triggers**:
    * *First Steps*: Finish 1st lesson.
    * *Scholar*: Finish a course.
    * *On Fire*: 3-day streak.
    * *Perfect Score*: 100% on a quiz.

---

## 2. Advanced Analytics

### 2.1 Objectives

* Provide Admin (Lilian) with actionable insights.
* Track student Drop-off points.
* Measure Content Effectiveness.

### 2.2 Data Model Enhancement

We will leverage the existing `analytics.ts` types but need a way to populate them efficiently.

#### **Event Sourcing (Granular)**

New collection `analytics_events` for raw stream (TTL 90 days).

```typescript
interface AnalyticsEvent {
  id: string;
  uid: string;
  type: 'video_progress' | 'page_view' | 'quiz_attempt' | 'resource_download';
  resourceId: string; // CourseID/LessonID
  metadata: Record<string, any>; // { percent: 50, duration: 120 }
  timestamp: Timestamp;
}
```

#### **Aggregated Stats (Fast Read)**

Scheduled jobs (GitHub Actions or Firebase Functions) to aggregare `analytics_events` into `CourseAnalytics` and `StudentAnalytics` at midnight.

### 2.3 Visualizations (Admin Dashboard)

* **Engagement Chart**: Daily Active Users (DAU) line chart.
* **Retention Curve**: % of users returning after Week 1, 2, 3.
* **Video Heatmap**: Where do students stop watching?

---

## 3. Implementation Phases

### Phase 1: Foundation (Gamification)

1. Create `src/types/gamification.ts`.
2. Create `src/lib/gamification.ts` (Core logic for XP and Streaks).
3. Implement `GamificationService` to handle DB writes.
4. Add "XP Toast" component for frontend feedback.

### Phase 2: Badges & UI

1. Design Badge Icons (Lucide/SVG).
2. Create `UserGamificationProfile` document on user creation (or lazy init).
3. Add "Badges" tab to Student Profile.
4. Implement Badge Triggers in `progressService`.

### Phase 3: Analytics Events

1. Implement `trackEvent` server action.
2. Hook `trackEvent` into `VideoPlayer`, `QuizTaker`, `PDFViewer`.
3. Create Admin Dashboard charts using Recharts.

---

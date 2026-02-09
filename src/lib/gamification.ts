import { Timestamp } from "firebase/firestore";

/**
 * Calculates current level based on total XP.
 * Formula: Level = floor(totalXp / 500) + 1
 */
export const calculateLevel = (totalXp: number): number => {
  return Math.floor(totalXp / 500) + 1;
};

/**
 * Checks if a streak should be incremented, maintained, or reset.
 * @returns 'increment' | 'maintain' | 'reset'
 */
export const verifyStreakStatus = (
  lastActivityDate: Timestamp | null,
): "increment" | "maintain" | "reset" => {
  if (!lastActivityDate) return "increment";

  const lastDate = lastActivityDate.toDate();
  const today = new Date();

  // Set times to midnight for comparison
  const lastMidnight = new Date(
    lastDate.getFullYear(),
    lastDate.getMonth(),
    lastDate.getDate(),
  );
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const diffTime = todayMidnight.getTime() - lastMidnight.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "maintain"; // Already active today
  if (diffDays === 1) return "increment"; // Active yesterday, so streak continues
  return "reset"; // Missed a day or more
};

export const XP_VALUES = {
  LESSON_COMPLETED: 50,
  QUIZ_PASSED: 100,
  COURSE_COMPLETED: 500,
  DAILY_LOGIN: 10,
  BONUS: 25,
};

export const BADGE_DEFINITIONS = [
  {
    id: "first_steps",
    slug: "first-steps",
    title: "Primeiros Passos",
    description: "Completou sua primeira aula",
    icon: "Footprints",
    category: "learning",
    xpValue: 100,
  },
  {
    id: "on_fire",
    slug: "on-fire",
    title: "Em Chamas",
    description: "estudou por 3 dias seguidos",
    icon: "Flame",
    category: "achievement",
    xpValue: 200,
  },
  {
    id: "scholar",
    slug: "scholar",
    title: "Estudioso",
    description: "Concluiu seu primeiro curso",
    icon: "GraduationCap",
    category: "learning",
    xpValue: 500,
  },
];

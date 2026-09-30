import { fsrs, Rating, State, type Card } from "ts-fsrs";

export type StoredSchedule = {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
};

export function emptySchedule(now = new Date()): StoredSchedule {
  return {
    due: now.toISOString(),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 0,
    reps: 0,
    lapses: 0,
    state: State.New,
    last_review: null,
  };
}

export function scheduleAfterRating(
  stored: StoredSchedule,
  rating: 1 | 2 | 3 | 4,
  now = new Date()
): StoredSchedule {
  const scheduler = fsrs({ enable_fuzz: false });
  const card: Card = {
    due: new Date(stored.due),
    stability: stored.stability,
    difficulty: stored.difficulty,
    elapsed_days: stored.elapsed_days,
    scheduled_days: stored.scheduled_days,
    learning_steps: stored.learning_steps,
    reps: stored.reps,
    lapses: stored.lapses,
    state: stored.state as State,
    last_review: stored.last_review ? new Date(stored.last_review) : undefined,
  };
  const ratingMap = {
    1: Rating.Again,
    2: Rating.Hard,
    3: Rating.Good,
    4: Rating.Easy,
  } as const;
  const next = scheduler.next(card, now, ratingMap[rating]).card;
  return {
    due: next.due.toISOString(),
    stability: next.stability,
    difficulty: next.difficulty,
    elapsed_days: next.elapsed_days,
    scheduled_days: next.scheduled_days,
    learning_steps: next.learning_steps,
    reps: next.reps,
    lapses: next.lapses,
    state: next.state,
    last_review: (next.last_review ?? now).toISOString(),
  };
}

/**
 * Hand-rolled minimal types for the arena schema.  Replace by running
 * `pnpm db:types` once the Supabase project is linked locally.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ProfileRow = {
  id: string;
  handle: string;
  display_name: string | null;
  created_at: string;
};

export type ChallengeRow = {
  slug: string;
  title: string;
  vector: "prompt-injection" | "system-extraction" | "defense" | "agent-exploitation";
  difficulty: number;
  type: "forbidden-phrase" | "flag-extract" | "judge-vote";
  base_points: number;
  is_tutorial: boolean;
  is_daily_pool: boolean;
  active: boolean;
  created_at: string;
};

export type AttemptInsert = {
  user_id: string;
  challenge_slug: string;
  daily_run_id?: string | null;
  payload_hash: string;
  input_tokens: number;
  output_excerpt?: string | null;
  judges_votes?: Json | null;
  success: boolean;
  score?: number;
  ip_hash: string;
};

export type AttemptRow = AttemptInsert & {
  id: string;
  created_at: string;
};

export type DailyRunRow = {
  id: string;
  date: string;
  challenge_slug: string;
  rotated_at: string;
};

export type LeaderboardRow = {
  user_id: string;
  handle: string;
  challenges_solved: number;
  total_score: number;
  last_breach: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Pick<ProfileRow, "id" | "handle"> & Partial<ProfileRow>;
        Update: Partial<ProfileRow>;
      };
      challenges: {
        Row: ChallengeRow;
        Insert: Omit<ChallengeRow, "created_at"> & Partial<Pick<ChallengeRow, "created_at">>;
        Update: Partial<ChallengeRow>;
      };
      attempts: {
        Row: AttemptRow;
        Insert: AttemptInsert;
        Update: Partial<AttemptInsert>;
      };
      daily_runs: {
        Row: DailyRunRow;
        Insert: Omit<DailyRunRow, "id" | "rotated_at"> & Partial<DailyRunRow>;
        Update: Partial<DailyRunRow>;
      };
    };
    Views: {
      leaderboard_alltime: { Row: LeaderboardRow };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

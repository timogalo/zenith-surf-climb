// Minimal, hand-written table types matching supabase/migrations/0001_booking_schema.sql.
// This is intentionally not full Supabase-generated codegen (no live
// project to generate against yet) — just enough shape for
// createClient<Database>() to give real type safety on .from(...) calls
// instead of falling back to `never`/`any`.
//
// Every field below (including the empty Relationships/Views/Functions)
// is required to structurally satisfy @supabase/postgrest-js's
// GenericSchema/GenericTable constraints — omitting any of them causes
// TypeScript to silently infer `never` for query results instead of
// erroring, which is worse than obvious, so they're all spelled out here.

export type BookingStatus = "pending" | "confirmed" | "declined" | "cancelled";

export type BookingRow = {
  id: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  guests: number;
  price_per_person: number;
  total_price: number;
  full_name: string;
  email: string;
  phone: string;
  country: string | null;
  message: string | null;
  status: BookingStatus;
};

type BookingInsert = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  start_date: string;
  end_date: string;
  guests: number;
  price_per_person?: number;
  total_price: number;
  full_name: string;
  email: string;
  phone: string;
  country?: string | null;
  message?: string | null;
  status?: BookingStatus;
};

type BlockedWeekRow = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
};

type BlockedWeekInsert = {
  id?: string;
  start_date: string;
  end_date: string;
  reason?: string | null;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: BookingRow;
        Insert: BookingInsert;
        Update: Partial<BookingInsert>;
        Relationships: [];
      };
      blocked_weeks: {
        Row: BlockedWeekRow;
        Insert: BlockedWeekInsert;
        Update: Partial<BlockedWeekInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

export type TransactionType = "income" | "expense";
export type Theme = "light" | "dark" | "system";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          currency: string;
          currency_symbol: string;
          date_format: string;
          theme: Theme;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; email: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: TransactionType;
          icon: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          user_id: string;
          name: string;
          type: TransactionType;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: TransactionType;
          amount: number;
          category_id: string | null;
          description: string;
          payment_method: string;
          transaction_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["transactions"]["Row"]> & {
          user_id: string;
          type: TransactionType;
          amount: number;
          payment_method: string;
          transaction_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Row"]>;
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          month: number;
          year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["budgets"]["Row"]> & {
          user_id: string;
          category_id: string;
          amount: number;
          month: number;
          year: number;
        };
        Update: Partial<Database["public"]["Tables"]["budgets"]["Row"]>;
        Relationships: [];
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          deadline: string | null;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["savings_goals"]["Row"]> & {
          user_id: string;
          name: string;
          target_amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["savings_goals"]["Row"]>;
        Relationships: [];
      };
      savings_contributions: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          amount: number;
          note: string;
          contribution_date: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["savings_contributions"]["Row"]> & {
          user_id: string;
          goal_id: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["savings_contributions"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      delete_category_safe: {
        Args: { p_category_id: string; p_reassign_to: string | null };
        Returns: void;
      };
    };
  };
}

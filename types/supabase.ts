export type Database = {
  public: {
    Tables: {
      cashflow_categories: {
        Row: {
          id: string
          created_at: string | null
          name: string | null
          type: string | null
          is_system: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          name?: string | null
          type?: string | null
          is_system?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string | null
          name?: string | null
          type?: string | null
          is_system?: boolean | null
        }
      }
      cashflow_records: {
        Row: {
          id: string
          user_id: string | null
          entity_id: string | null
          category_id: string | null
          year: number | null
          amount: number | null
          source_file_id: string | null
          is_recurring: boolean | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          entity_id?: string | null
          category_id?: string | null
          year?: number | null
          amount?: number | null
          source_file_id?: string | null
          is_recurring?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string | null
          entity_id?: string | null
          category_id?: string | null
          year?: number | null
          amount?: number | null
          source_file_id?: string | null
          is_recurring?: boolean | null
        }
      }
      uploaded_files: {
        Row: {
          id: string
          user_id: string | null
          filename: string | null
          file_path: string | null
          file_type: string | null
          status: string | null
          created_at: string | null
          processed_at: string | null
          entity_id: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          filename?: string | null
          file_path?: string | null
          file_type?: string | null
          status?: string | null
          created_at?: string | null
          processed_at?: string | null
          entity_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          filename?: string | null
          file_path?: string | null
          file_type?: string | null
          status?: string | null
          created_at?: string | null
          processed_at?: string | null
          entity_id?: string | null
        }
      }
      entities: {
        Row: {
          id: string
          user_id: string | null
          name: string | null
          type: string | null
          metadata: object | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name?: string | null
          type?: string | null
          metadata?: object | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string | null
          type?: string | null
          metadata?: object | null
        }
      }
      parser_errors: {
        Row: {
          id: string
          file_id: string | null
          user_id: string | null
          row_number: number | null
          column_name: string | null
          error_type: string | null
          error_message: string | null
          raw_value: string | null
        }
        Insert: {
          id?: string
          file_id?: string | null
          user_id?: string | null
          row_number?: number | null
          column_name?: string | null
          error_type?: string | null
          error_message?: string | null
          raw_value?: string | null
        }
        Update: {
          id?: string
          file_id?: string | null
          user_id?: string | null
          row_number?: number | null
          column_name?: string | null
          error_type?: string | null
          error_message?: string | null
          raw_value?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

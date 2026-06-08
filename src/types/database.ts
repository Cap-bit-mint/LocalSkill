// LocalSkill Database Types
// Auto-generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string
          auth_user_id: string | null
          name: string
          source_url: string | null
          source_type: 'meituan' | 'dianping' | 'amap' | 'other' | null
          category: 'restaurant' | 'retail' | 'beauty' | 'repair' | 'other' | null
          location_city: string | null
          location_district: string | null
          location_address: string | null
          phone: string | null
          rating: number | null
          avg_price: number | null
          business_hours: Json
          raw_data: Json
          verified_data: Json
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'archived'
          created_at: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          name: string
          source_url?: string | null
          source_type?: 'meituan' | 'dianping' | 'amap' | 'other' | null
          category?: 'restaurant' | 'retail' | 'beauty' | 'repair' | 'other' | null
          location_city?: string | null
          location_district?: string | null
          location_address?: string | null
          phone?: string | null
          rating?: number | null
          avg_price?: number | null
          business_hours?: Json
          raw_data?: Json
          verified_data?: Json
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'archived'
          created_at?: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          name?: string
          source_url?: string | null
          source_type?: 'meituan' | 'dianping' | 'amap' | 'other' | null
          category?: 'restaurant' | 'retail' | 'beauty' | 'repair' | 'other' | null
          location_city?: string | null
          location_district?: string | null
          location_address?: string | null
          phone?: string | null
          rating?: number | null
          avg_price?: number | null
          business_hours?: Json
          raw_data?: Json
          verified_data?: Json
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'archived'
          created_at?: string
          updated_at?: string
          verified_at?: string | null
        }
      }
      skills: {
        Row: {
          id: string
          merchant_id: string
          skill_name: string
          skill_version: string
          mcp_config: Json
          capabilities: Json
          visibility: 'private' | 'public'
          github_repo: string | null
          github_path: string | null
          commit_sha: string | null
          published_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          skill_name: string
          skill_version?: string
          mcp_config?: Json
          capabilities?: Json
          visibility?: 'private' | 'public'
          github_repo?: string | null
          github_path?: string | null
          commit_sha?: string | null
          published_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          skill_name?: string
          skill_version?: string
          mcp_config?: Json
          capabilities?: Json
          visibility?: 'private' | 'public'
          github_repo?: string | null
          github_path?: string | null
          commit_sha?: string | null
          published_at?: string | null
          updated_at?: string
        }
      }
      parse_tasks: {
        Row: {
          id: string
          merchant_id: string | null
          task_type: 'url_parse' | 'image_parse' | 'refresh'
          input_type: 'url' | 'text' | 's3_path'
          input_value: string
          parse_result: Json | null
          error_info: Json | null
          status: 'queued' | 'running' | 'completed' | 'failed'
          retry_count: number
          max_retries: number
          priority: number
          started_at: string | null
          completed_at: string | null
          cost_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          merchant_id?: string | null
          task_type: 'url_parse' | 'image_parse' | 'refresh'
          input_type: 'url' | 'text' | 's3_path'
          input_value: string
          parse_result?: Json | null
          error_info?: Json | null
          status?: 'queued' | 'running' | 'completed' | 'failed'
          retry_count?: number
          max_retries?: number
          priority?: number
          started_at?: string | null
          completed_at?: string | null
          cost_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string | null
          task_type?: 'url_parse' | 'image_parse' | 'refresh'
          input_type?: 'url' | 'text' | 's3_path'
          input_value?: string
          parse_result?: Json | null
          error_info?: Json | null
          status?: 'queued' | 'running' | 'completed' | 'failed'
          retry_count?: number
          max_retries?: number
          priority?: number
          started_at?: string | null
          completed_at?: string | null
          cost_ms?: number | null
          created_at?: string
        }
      }
      github_deployments: {
        Row: {
          id: string
          merchant_id: string | null
          skill_id: string | null
          repo_full_name: string
          branch: string
          commit_sha: string | null
          skill_path: string | null
          status: 'pending' | 'pushing' | 'succeeded' | 'failed'
          gh_response: Json | null
          error_message: string | null
          deployed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          merchant_id?: string | null
          skill_id?: string | null
          repo_full_name: string
          branch?: string
          commit_sha?: string | null
          skill_path?: string | null
          status?: 'pending' | 'pushing' | 'succeeded' | 'failed'
          gh_response?: Json | null
          error_message?: string | null
          deployed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string | null
          skill_id?: string | null
          repo_full_name?: string
          branch?: string
          commit_sha?: string | null
          skill_path?: string | null
          status?: 'pending' | 'pushing' | 'succeeded' | 'failed'
          gh_response?: Json | null
          error_message?: string | null
          deployed_at?: string | null
          created_at?: string
        }
      }
      stats_daily: {
        Row: {
          stat_date: string
          new_merchants: number
          new_skills: number
          parse_success: number
          parse_failed: number
          github_pushes: number
          total_queries: number
          avg_parse_time_ms: number
          active_users: number
          created_at: string
          updated_at: string
        }
        Insert: {
          stat_date: string
          new_merchants?: number
          new_skills?: number
          parse_success?: number
          parse_failed?: number
          github_pushes?: number
          total_queries?: number
          avg_parse_time_ms?: number
          active_users?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          stat_date?: string
          new_merchants?: number
          new_skills?: number
          parse_success?: number
          parse_failed?: number
          github_pushes?: number
          total_queries?: number
          avg_parse_time_ms?: number
          active_users?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience types
export type Merchant = Database['public']['Tables']['merchants']['Row']
export type MerchantInsert = Database['public']['Tables']['merchants']['Insert']
export type MerchantUpdate = Database['public']['Tables']['merchants']['Update']

export type Skill = Database['public']['Tables']['skills']['Row']
export type SkillInsert = Database['public']['Tables']['skills']['Insert']
export type SkillUpdate = Database['public']['Tables']['skills']['Update']

export type ParseTask = Database['public']['Tables']['parse_tasks']['Row']
export type ParseTaskInsert = Database['public']['Tables']['parse_tasks']['Insert']
export type ParseTaskUpdate = Database['public']['Tables']['parse_tasks']['Update']

export type GitHubDeployment = Database['public']['Tables']['github_deployments']['Row']
export type GitHubDeploymentInsert = Database['public']['Tables']['github_deployments']['Insert']
export type GitHubDeploymentUpdate = Database['public']['Tables']['github_deployments']['Update']

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: number
          ip: string | null
          organization_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: never
          ip?: string | null
          organization_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: never
          ip?: string | null
          organization_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      clause_library: {
        Row: {
          body: string
          created_at: string
          id: string
          organization_id: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          organization_id: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          organization_id?: string
          title?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          lease_id: string
          notes: string | null
          organization_id: string
          status: Database["public"]["Enums"]["deposit_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          lease_id: string
          notes?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["deposit_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          lease_id?: string
          notes?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["deposit_status"]
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          doc_type: string | null
          entity_id: string
          entity_type: string
          id: string
          name: string
          organization_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          doc_type?: string | null
          entity_id: string
          entity_type: string
          id?: string
          name: string
          organization_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          doc_type?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          name?: string
          organization_id?: string
          storage_path?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          is_taxable: boolean
          line_total: number
          organization_id: string
          quantity: number
          tax_rate: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          is_taxable?: boolean
          line_total?: number
          organization_id: string
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          is_taxable?: boolean
          line_total?: number
          organization_id?: string
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          lease_id: string | null
          notes: string | null
          organization_id: string
          schedule_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number
          tenant_id: string | null
          total: number
          type: Database["public"]["Enums"]["invoice_type"]
          updated_at: string
          zatca_hash: string | null
          zatca_qr: string | null
          zatca_uuid: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          lease_id?: string | null
          notes?: string | null
          organization_id: string
          schedule_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tenant_id?: string | null
          total?: number
          type?: Database["public"]["Enums"]["invoice_type"]
          updated_at?: string
          zatca_hash?: string | null
          zatca_qr?: string | null
          zatca_uuid?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          lease_id?: string | null
          notes?: string | null
          organization_id?: string
          schedule_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tenant_id?: string | null
          total?: number
          type?: Database["public"]["Enums"]["invoice_type"]
          updated_at?: string
          zatca_hash?: string | null
          zatca_qr?: string | null
          zatca_uuid?: string | null
        }
        Relationships: []
      }
      lease_clauses: {
        Row: {
          body: string
          created_at: string
          id: string
          lease_id: string
          organization_id: string
          sort_order: number
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          lease_id: string
          organization_id: string
          sort_order?: number
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          lease_id?: string
          organization_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      lease_templates: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_default: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      leases: {
        Row: {
          auto_renew: boolean
          contract_number: string | null
          created_at: string
          deposit_amount: number | null
          ejar_contract_id: string | null
          end_date: string
          grace_period_days: number
          id: string
          late_fee_type: Database["public"]["Enums"]["late_fee_type"]
          late_fee_value: number | null
          notes: string | null
          organization_id: string
          payment_frequency: Database["public"]["Enums"]["payment_frequency"]
          renewal_notice_days: number | null
          rent_amount: number
          start_date: string
          status: Database["public"]["Enums"]["lease_status"]
          template_id: string | null
          tenant_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean
          contract_number?: string | null
          created_at?: string
          deposit_amount?: number | null
          ejar_contract_id?: string | null
          end_date: string
          grace_period_days?: number
          id?: string
          late_fee_type?: Database["public"]["Enums"]["late_fee_type"]
          late_fee_value?: number | null
          notes?: string | null
          organization_id: string
          payment_frequency?: Database["public"]["Enums"]["payment_frequency"]
          renewal_notice_days?: number | null
          rent_amount: number
          start_date: string
          status?: Database["public"]["Enums"]["lease_status"]
          template_id?: string | null
          tenant_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean
          contract_number?: string | null
          created_at?: string
          deposit_amount?: number | null
          ejar_contract_id?: string | null
          end_date?: string
          grace_period_days?: number
          id?: string
          late_fee_type?: Database["public"]["Enums"]["late_fee_type"]
          late_fee_value?: number | null
          notes?: string | null
          organization_id?: string
          payment_frequency?: Database["public"]["Enums"]["payment_frequency"]
          renewal_notice_days?: number | null
          rent_amount?: number
          start_date?: string
          status?: Database["public"]["Enums"]["lease_status"]
          template_id?: string | null
          tenant_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string | null
          entry_date: string
          id: string
          lease_id: string | null
          organization_id: string
          owner_id: string | null
          property_id: string | null
          reference: string | null
          type: Database["public"]["Enums"]["ledger_type"]
          unit_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
          lease_id?: string | null
          organization_id: string
          owner_id?: string | null
          property_id?: string | null
          reference?: string | null
          type: Database["public"]["Enums"]["ledger_type"]
          unit_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
          lease_id?: string | null
          organization_id?: string
          owner_id?: string | null
          property_id?: string | null
          reference?: string | null
          type?: Database["public"]["Enums"]["ledger_type"]
          unit_id?: string | null
        }
        Relationships: []
      }
      maintenance_costs: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          invoice_ref: string | null
          organization_id: string
          request_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          invoice_ref?: string | null
          organization_id: string
          request_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          invoice_ref?: string | null
          organization_id?: string
          request_id?: string
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          lease_id: string | null
          organization_id: string
          priority: Database["public"]["Enums"]["maintenance_priority"]
          reported_at: string
          status: Database["public"]["Enums"]["maintenance_status"]
          tenant_id: string | null
          title: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lease_id?: string | null
          organization_id: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          reported_at?: string
          status?: Database["public"]["Enums"]["maintenance_status"]
          tenant_id?: string | null
          title: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lease_id?: string | null
          organization_id?: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          reported_at?: string
          status?: Database["public"]["Enums"]["maintenance_status"]
          tenant_id?: string | null
          title?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          notes: string | null
          organization_id: string
          provider_id: string | null
          request_id: string
          scheduled_at: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          organization_id: string
          provider_id?: string | null
          request_id: string
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string
          provider_id?: string | null
          request_id?: string
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          caption: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          organization_id: string
          storage_path: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          organization_id: string
          storage_path: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          organization_id?: string
          storage_path?: string
        }
        Relationships: []
      }
      meter_readings: {
        Row: {
          created_at: string
          id: string
          meter_id: string
          organization_id: string
          reading: number
          reading_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          meter_id: string
          organization_id: string
          reading: number
          reading_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          meter_id?: string
          organization_id?: string
          reading?: number
          reading_date?: string
        }
        Relationships: []
      }
      meters: {
        Row: {
          created_at: string
          id: string
          meter_number: string | null
          organization_id: string
          type: Database["public"]["Enums"]["meter_type"]
          unit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meter_number?: string | null
          organization_id: string
          type: Database["public"]["Enums"]["meter_type"]
          unit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meter_number?: string | null
          organization_id?: string
          type?: Database["public"]["Enums"]["meter_type"]
          unit_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          data: Json | null
          id: string
          organization_id: string | null
          read_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json | null
          id?: string
          organization_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json | null
          id?: string
          organization_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role_id: string
          scope: Json
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role_id: string
          scope?: Json
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role_id?: string
          scope?: Json
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: Json | null
          cr_number: string | null
          created_at: string
          default_locale: string
          email: string | null
          id: string
          legal_name: string | null
          name: string
          phone: string | null
          slug: string | null
          status: Database["public"]["Enums"]["org_status"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: Json | null
          cr_number?: string | null
          created_at?: string
          default_locale?: string
          email?: string | null
          id?: string
          legal_name?: string | null
          name: string
          phone?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["org_status"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: Json | null
          cr_number?: string | null
          created_at?: string
          default_locale?: string
          email?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          phone?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["org_status"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      owner_statement_lines: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          kind: Database["public"]["Enums"]["ledger_type"]
          organization_id: string
          statement_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          kind: Database["public"]["Enums"]["ledger_type"]
          organization_id: string
          statement_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          kind?: Database["public"]["Enums"]["ledger_type"]
          organization_id?: string
          statement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_statement_lines_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "owner_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_statements: {
        Row: {
          created_at: string
          gross_income: number
          id: string
          management_fee: number
          net_payout: number
          organization_id: string
          owner_id: string
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["statement_status"]
          total_expenses: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          gross_income?: number
          id?: string
          management_fee?: number
          net_payout?: number
          organization_id: string
          owner_id: string
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["statement_status"]
          total_expenses?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          gross_income?: number
          id?: string
          management_fee?: number
          net_payout?: number
          organization_id?: string
          owner_id?: string
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["statement_status"]
          total_expenses?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_statements_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          commission_rate: number | null
          created_at: string
          email: string | null
          full_name: string
          iban: string | null
          id: string
          national_id: string | null
          notes: string | null
          organization_id: string
          phone: string | null
          portfolio_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          full_name: string
          iban?: string | null
          id?: string
          national_id?: string | null
          notes?: string | null
          organization_id: string
          phone?: string | null
          portfolio_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          full_name?: string
          iban?: string | null
          id?: string
          national_id?: string | null
          notes?: string | null
          organization_id?: string
          phone?: string | null
          portfolio_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owners_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_schedules: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          lease_id: string
          organization_id: string
          sequence: number
          status: Database["public"]["Enums"]["schedule_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          lease_id: string
          organization_id: string
          sequence: number
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          lease_id?: string
          organization_id?: string
          sequence?: number
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedules_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          gateway: string | null
          gateway_ref: string | null
          id: string
          invoice_id: string | null
          lease_id: string | null
          method: Database["public"]["Enums"]["payment_method"] | null
          organization_id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          gateway?: string | null
          gateway_ref?: string | null
          id?: string
          invoice_id?: string | null
          lease_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          organization_id: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          gateway?: string | null
          gateway_ref?: string | null
          id?: string
          invoice_id?: string | null
          lease_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          organization_id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string | null
          description: string | null
          id: string
          key: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          key: string
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          key?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferred_locale: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_locale?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_locale?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: Json | null
          created_at: string
          deed_number: string | null
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          national_address: string | null
          organization_id: string
          owner_id: string | null
          portfolio_id: string | null
          property_type: Database["public"]["Enums"]["property_type"]
          updated_at: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          deed_number?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          national_address?: string | null
          organization_id: string
          owner_id?: string | null
          portfolio_id?: string | null
          property_type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          deed_number?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          national_address?: string | null
          organization_id?: string
          owner_id?: string | null
          portfolio_id?: string | null
          property_type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          id: string
          is_system: boolean
          key: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_system?: boolean
          key: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_system?: boolean
          key?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          organization_id: string
          phone: string | null
          specialty: string | null
          type: Database["public"]["Enums"]["provider_type"]
          updated_at: string
        }
        Insert: {
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          specialty?: string | null
          type?: Database["public"]["Enums"]["provider_type"]
          updated_at?: string
        }
        Update: {
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          specialty?: string | null
          type?: Database["public"]["Enums"]["provider_type"]
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string
          price_per_unit: number
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          unit_quota: number
          units_used: number
          updated_at: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id: string
          price_per_unit?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          unit_quota?: number
          units_used?: number
          updated_at?: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string
          price_per_unit?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          unit_quota?: number
          units_used?: number
          updated_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          national_id: string | null
          organization_id: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          national_id?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          national_id?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      unit_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          area_sqm: number | null
          base_rent: number | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          floor: number | null
          furnished: boolean
          id: string
          organization_id: string
          property_id: string
          status: Database["public"]["Enums"]["unit_status"]
          unit_number: string
          unit_type_id: string | null
          updated_at: string
        }
        Insert: {
          area_sqm?: number | null
          base_rent?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          floor?: number | null
          furnished?: boolean
          id?: string
          organization_id: string
          property_id: string
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number: string
          unit_type_id?: string | null
          updated_at?: string
        }
        Update: {
          area_sqm?: number | null
          base_rent?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          floor?: number | null
          furnished?: boolean
          id?: string
          organization_id?: string
          property_id?: string
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number?: string
          unit_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_unit_type_id_fkey"
            columns: ["unit_type_id"]
            isOneToOne: false
            referencedRelation: "unit_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_organization: {
        Args: { p_name: string; p_slug?: string }
        Returns: Database["public"]["Tables"]["organizations"]["Row"]
      }
      has_permission: {
        Args: { p_org: string; p_perm: string }
        Returns: boolean
      }
      is_lease_tenant: { Args: { p_lease: string }; Returns: boolean }
      is_org_admin: { Args: { p_org: string }; Returns: boolean }
      is_org_member: { Args: { p_org: string }; Returns: boolean }
      is_owner_self: { Args: { p_owner: string }; Returns: boolean }
      user_org_ids: { Args: Record<PropertyKey, never>; Returns: string[] }
    }
    Enums: {
      billing_cycle: "monthly" | "annual"
      deposit_status: "held" | "partially_refunded" | "refunded" | "forfeited"
      invoice_status:
        | "draft"
        | "issued"
        | "paid"
        | "partially_paid"
        | "overdue"
        | "cancelled"
      invoice_type: "rent" | "management_fee" | "service" | "deposit" | "other"
      late_fee_type: "none" | "percentage" | "fixed"
      lease_status: "draft" | "active" | "expired" | "terminated" | "renewed"
      ledger_type: "income" | "expense"
      maintenance_priority: "low" | "medium" | "high" | "urgent"
      maintenance_status:
        | "new"
        | "assigned"
        | "in_progress"
        | "on_hold"
        | "completed"
        | "cancelled"
      media_kind: "image" | "floor_plan" | "video" | "document"
      member_status: "active" | "invited" | "disabled"
      meter_type: "electricity" | "water"
      notification_channel: "in_app" | "email" | "sms" | "whatsapp"
      notification_status: "pending" | "sent" | "failed"
      org_status: "active" | "suspended"
      payment_frequency: "monthly" | "quarterly" | "semi_annual" | "annual"
      payment_method:
        | "mada"
        | "card"
        | "apple_pay"
        | "bank_transfer"
        | "sadad"
        | "cash"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      property_type:
        | "residential_building"
        | "villa"
        | "floor"
        | "studio"
        | "apartment"
        | "compound"
        | "tower"
        | "other"
      provider_type: "internal" | "external"
      schedule_status: "pending" | "invoiced" | "paid" | "overdue" | "waived"
      statement_status: "draft" | "finalized" | "paid"
      subscription_status: "trialing" | "active" | "past_due" | "cancelled"
      subscription_tier: "basic" | "professional" | "enterprise"
      unit_status:
        | "vacant"
        | "occupied"
        | "reserved"
        | "maintenance"
        | "unavailable"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<
  T extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][T]["Update"]

export type Enums<
  T extends keyof DefaultSchema["Enums"],
> = DefaultSchema["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      billing_cycle: ["monthly", "annual"],
      deposit_status: ["held", "partially_refunded", "refunded", "forfeited"],
      invoice_status: [
        "draft",
        "issued",
        "paid",
        "partially_paid",
        "overdue",
        "cancelled",
      ],
      invoice_type: ["rent", "management_fee", "service", "deposit", "other"],
      late_fee_type: ["none", "percentage", "fixed"],
      lease_status: ["draft", "active", "expired", "terminated", "renewed"],
      ledger_type: ["income", "expense"],
      maintenance_priority: ["low", "medium", "high", "urgent"],
      maintenance_status: [
        "new",
        "assigned",
        "in_progress",
        "on_hold",
        "completed",
        "cancelled",
      ],
      media_kind: ["image", "floor_plan", "video", "document"],
      member_status: ["active", "invited", "disabled"],
      meter_type: ["electricity", "water"],
      notification_channel: ["in_app", "email", "sms", "whatsapp"],
      notification_status: ["pending", "sent", "failed"],
      org_status: ["active", "suspended"],
      payment_frequency: ["monthly", "quarterly", "semi_annual", "annual"],
      payment_method: [
        "mada",
        "card",
        "apple_pay",
        "bank_transfer",
        "sadad",
        "cash",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      property_type: [
        "residential_building",
        "villa",
        "floor",
        "studio",
        "apartment",
        "compound",
        "tower",
        "other",
      ],
      provider_type: ["internal", "external"],
      schedule_status: ["pending", "invoiced", "paid", "overdue", "waived"],
      statement_status: ["draft", "finalized", "paid"],
      subscription_status: ["trialing", "active", "past_due", "cancelled"],
      subscription_tier: ["basic", "professional", "enterprise"],
      unit_status: [
        "vacant",
        "occupied",
        "reserved",
        "maintenance",
        "unavailable",
      ],
    },
  },
} as const

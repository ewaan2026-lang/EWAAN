export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
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
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "clause_library_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "deposits_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "invoices_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "payment_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "lease_clauses_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_clauses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "lease_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "leases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "lease_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "ledger_entries_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "maintenance_costs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_costs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "media_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "meter_readings_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "meters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meter_readings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "meters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "org_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "owner_statement_lines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "owner_statements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "owners_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "payment_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
        Relationships: [
          {
            foreignKeyName: "portfolios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          services: string[]
          updated_at: string
          whatsapp_group_url: string | null
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
          services?: string[]
          updated_at?: string
          whatsapp_group_url?: string | null
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
          services?: string[]
          updated_at?: string
          whatsapp_group_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "service_providers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "tenants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "unit_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          area_sqm: number | null
          base_rent: number | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          features: string[]
          floor: number | null
          furnished: boolean
          has_water_tank: boolean
          id: string
          listing_text: string | null
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
          features?: string[]
          floor?: number | null
          furnished?: boolean
          has_water_tank?: boolean
          id?: string
          listing_text?: string | null
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
          features?: string[]
          floor?: number | null
          furnished?: boolean
          has_water_tank?: boolean
          id?: string
          listing_text?: string | null
          organization_id?: string
          property_id?: string
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number?: string
          unit_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "organizations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_permission: {
        Args: { p_org: string; p_perm: string }
        Returns: boolean
      }
      is_lease_tenant: { Args: { p_lease: string }; Returns: boolean }
      is_org_admin: { Args: { p_org: string }; Returns: boolean }
      is_org_member: { Args: { p_org: string }; Returns: boolean }
      is_owner_self: { Args: { p_owner: string }; Returns: boolean }
      user_org_ids: { Args: never; Returns: string[] }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

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

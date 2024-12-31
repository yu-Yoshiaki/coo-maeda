import type { BusinessPlan, BusinessPlanInput } from "../types/BusinessPlan"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export const businessPlanApi = {
  async getAll(): Promise<BusinessPlan[]> {
    const { data, error } = await supabase
      .from("business_plans")
      .select("*")
      .order("created_at", { ascending: false })

    if (error)
      throw error
    return data
  },

  async getById(id: string): Promise<BusinessPlan> {
    const { data, error } = await supabase
      .from("business_plans")
      .select("*")
      .eq("id", id)
      .single()

    if (error)
      throw error
    return data
  },

  async create(plan: BusinessPlanInput): Promise<BusinessPlan> {
    const { data, error } = await supabase
      .from("business_plans")
      .insert([plan])
      .select()
      .single()

    if (error)
      throw error
    return data
  },

  async update(id: string, plan: Partial<BusinessPlanInput>): Promise<BusinessPlan> {
    const { data, error } = await supabase
      .from("business_plans")
      .update(plan)
      .eq("id", id)
      .select()
      .single()

    if (error)
      throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("business_plans")
      .delete()
      .eq("id", id)

    if (error)
      throw error
  },
}

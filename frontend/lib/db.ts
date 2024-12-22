import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

export const db = createClient(supabaseUrl, supabaseKey)

// スケジュール関連のヘルパー関数
export const scheduleQueries = {
  // スケジュールの取得
  async findMany(options: any = {}) {
    const { data, error } = await db
      .from("schedules")
      .select(`
        *,
        participants (*),
        reminders (*),
        recurrence (*)
      `)
      .match(options.where || {})

    if (error)
      throw error
    return data
  },

  // 単一のスケジュールを取得
  async findUnique(options: any = {}) {
    const { data, error } = await db
      .from("schedules")
      .select(`
        *,
        participants (*),
        reminders (*),
        recurrence (*)
      `)
      .match(options.where || {})
      .single()

    if (error)
      throw error
    return data
  },

  // スケジュールの作成
  async create(options: any = {}) {
    const { data, error } = await db
      .from("schedules")
      .insert(options.data)
      .select(`
        *,
        participants (*),
        reminders (*),
        recurrence (*)
      `)
      .single()

    if (error)
      throw error
    return data
  },

  // スケジュールの更新
  async update(options: any = {}) {
    const { data, error } = await db
      .from("schedules")
      .update(options.data)
      .match(options.where || {})
      .select(`
        *,
        participants (*),
        reminders (*),
        recurrence (*)
      `)
      .single()

    if (error)
      throw error
    return data
  },

  // スケジュールの削除
  async delete(options: any = {}) {
    const { error } = await db
      .from("schedules")
      .delete()
      .match(options.where || {})

    if (error)
      throw error
    return true
  },
}

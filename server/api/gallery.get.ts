import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)

    const { data, error } = await client
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      images: data
    }
  } catch (err: any) {
    console.error('Error fetching gallery:', err)
    return {
      success: false,
      error: 'Nepodařilo se načíst galerii'
    }
  }
})
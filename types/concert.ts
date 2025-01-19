export interface Concert {
  id: number
  title: string
  date: string
  description: string
  group_name: string
  price: number
  image?: string
  qr_code?: any
  created_at: string
}
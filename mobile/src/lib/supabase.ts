import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jgnsfeqpzxjvmjeschqi.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnbnNmZXFwenhqdm1qZXNjaHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzY0MTIsImV4cCI6MjEwMzk1MjQxMn0.J1ZUBef2Sk9jroL2VIs2ACqkG0wrllPDyv_-zZXcZTc'

export const supabaseMobile = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

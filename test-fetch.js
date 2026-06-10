require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data: p } = await supabase.from('member_purchases').select('*')
  console.log('Purchases without pagination:', p.length)
  
  const { data: m } = await supabase.from('members').select('*')
  console.log('Members without pagination:', m.length)
}
run()

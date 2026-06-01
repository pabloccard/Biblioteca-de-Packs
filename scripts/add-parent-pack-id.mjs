// Script para adicionar parent_pack_id na tabela packs
// Executar via: node scripts/add-parent-pack-id.mjs

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function migrate() {
  console.log('🔧 Adicionando coluna parent_pack_id na tabela packs...')
  
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      ALTER TABLE packs 
      ADD COLUMN IF NOT EXISTS parent_pack_id UUID REFERENCES packs(id) ON DELETE SET NULL;
      
      CREATE INDEX IF NOT EXISTS idx_packs_parent_pack_id ON packs(parent_pack_id);
    `
  })

  if (error) {
    // Se rpc não existir, tentar via REST
    console.log('⚠️  RPC não disponível. Execute o SQL manualmente no Supabase Dashboard:')
    console.log('')
    console.log('  ALTER TABLE packs ADD COLUMN IF NOT EXISTS parent_pack_id UUID REFERENCES packs(id) ON DELETE SET NULL;')
    console.log('  CREATE INDEX IF NOT EXISTS idx_packs_parent_pack_id ON packs(parent_pack_id);')
    console.log('')
    console.log('Acesse: https://supabase.com/dashboard → SQL Editor')
  } else {
    console.log('✅ Coluna parent_pack_id adicionada com sucesso!')
  }
}

migrate()

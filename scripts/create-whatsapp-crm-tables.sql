-- ====================================================================
-- MIGRAÇÃO: CRM DE MARKETING WHATSAPP & IMPORTAÇÃO DE TELEFONES
-- Execute este script no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ====================================================================

-- 1. Adicionar coluna 'phone' na tabela 'members'
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);

-- 2. Tabela de Campanhas de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pack_id UUID REFERENCES packs(id) ON DELETE SET NULL,
  niche TEXT NOT NULL, -- 'provedor' | 'hamburgueria' | etc.
  language TEXT NOT NULL DEFAULT 'pt',
  message_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_created ON whatsapp_campaigns(created_at DESC);

-- 3. Tabela de Destinatários das Campanhas
CREATE TABLE IF NOT EXISTS whatsapp_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES whatsapp_campaigns(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' (aguardando) | 'sent' (já enviado) | 'skipped' (ignorado)
  sent_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_wcr_campaign_status ON whatsapp_campaign_recipients(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_wcr_member_id ON whatsapp_campaign_recipients(member_id);

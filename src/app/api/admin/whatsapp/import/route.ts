import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as XLSX from 'xlsx'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sanitizePhoneNumber } from '@/lib/phone-sanitizer'

export const dynamic = 'force-dynamic'

interface ImportRow {
  email: string
  phoneRaw: string
  countryRaw?: string
  nameRaw?: string
  rowNumber: number
}

interface NotFoundMember {
  email: string
  name?: string
  phone?: string
  country?: string
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticação de administrador
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'authenticated'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    // 2. Ler o arquivo em memória
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let workbook: XLSX.WorkBook
    try {
      workbook = XLSX.read(buffer, { type: 'buffer', raw: true })
    } catch (err: any) {
      return NextResponse.json(
        { error: `Erro ao ler a planilha: ${err?.message || 'Formato inválido.'}` },
        { status: 400 }
      )
    }

    const firstSheetName = workbook.SheetNames[0]
    if (!firstSheetName) {
      return NextResponse.json({ error: 'A planilha está vazia.' }, { status: 400 })
    }

    const sheet = workbook.Sheets[firstSheetName]
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' })

    if (!rawData || rawData.length === 0) {
      return NextResponse.json({ error: 'Nenhuma linha encontrada na planilha.' }, { status: 400 })
    }

    // 3. Detectar cabeçalhos das colunas dinamicamente
    const firstRow = rawData[0]
    const headers = Object.keys(firstRow)

    const normalizeHeader = (h: string) =>
      h
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()

    let emailKey = headers.find((h) => normalizeHeader(h).includes('email'))
    let phoneKey = headers.find(
      (h) =>
        normalizeHeader(h).includes('telefone') ||
        normalizeHeader(h).includes('whatsapp') ||
        normalizeHeader(h).includes('celular') ||
        normalizeHeader(h).includes('phone')
    )
    let countryKey = headers.find((h) => normalizeHeader(h).includes('pais') || normalizeHeader(h).includes('country'))
    let nameKey = headers.find((h) => normalizeHeader(h).includes('nome') && !normalizeHeader(h).includes('arquivo'))

    if (!emailKey || !phoneKey) {
      // Fallback por índice se os nomes das colunas não forem convencionais
      if (headers.length >= 2) {
        emailKey = emailKey || headers[0]
        phoneKey = phoneKey || headers[1]
      } else {
        return NextResponse.json(
          {
            error:
              'Não foi possível identificar as colunas de Email e Telefone. Certifique-se de que a planilha contenha colunas como "Email Comprador(a)" e "Telefone Comprador(a)".',
          },
          { status: 400 }
        )
      }
    }

    // 4. Mapear e higienizar linhas em memória
    const validRows: ImportRow[] = []
    let invalidPhoneCount = 0
    const invalidPhoneSamples: { email: string; raw: string; reason: string }[] = []

    rawData.forEach((row, index) => {
      const email = String(row[emailKey!] || '').trim().toLowerCase().replace(/['"\s]/g, '')
      const phoneRaw = String(row[phoneKey!] || '').trim()
      const countryRaw = countryKey ? String(row[countryKey] || '').trim() : ''
      const nameRaw = nameKey ? String(row[nameKey] || '').trim() : ''

      if (!email || !email.includes('@')) {
        return // ignora linha sem e-mail
      }

      const sanitizeCheck = sanitizePhoneNumber(phoneRaw, countryRaw)

      if (!sanitizeCheck.isValid || !sanitizeCheck.cleanPhone) {
        invalidPhoneCount++
        if (invalidPhoneSamples.length < 10) {
          invalidPhoneSamples.push({
            email,
            raw: phoneRaw,
            reason: sanitizeCheck.reason || 'Inválido',
          })
        }
        return
      }

      validRows.push({
        email,
        phoneRaw: sanitizeCheck.cleanPhone,
        countryRaw: countryRaw || undefined,
        nameRaw: nameRaw || undefined,
        rowNumber: index + 2,
      })
    })

    // 5. MÍNIMO EGRESS: Buscar APENAS id, email, phone, name da tabela members
    // Paginando de 1000 em 1000 para não truncar na limitação padrão do PostgREST
    let dbMembers: any[] = []
    let page = 0
    while (true) {
      const { data, error: dbError } = await supabaseAdmin
        .from('members')
        .select('id, email, phone, name, country')
        .range(page * 1000, (page + 1) * 1000 - 1)

      if (dbError) {
        return NextResponse.json({ error: `Erro ao consultar membros no Supabase: ${dbError.message}` }, { status: 500 })
      }

      if (!data || data.length === 0) break
      dbMembers = dbMembers.concat(data)
      if (data.length < 1000) break
      page++
    }

    // Mapear membros por email lowercase e sem espaços
    const memberMap = new Map<string, any>()
    for (const m of dbMembers || []) {
      if (m.email) {
        const cleanDbEmail = String(m.email).trim().toLowerCase().replace(/['"\s]/g, '')
        memberMap.set(cleanDbEmail, m)
      }
    }

    const updatesToApply: { id: string; phone: string; country?: string; name?: string }[] = []
    const notFoundInDb: NotFoundMember[] = []
    let alreadyHadSamePhoneCount = 0
    let newlyAddedPhoneCount = 0
    let updatedPhoneCount = 0

    // Deduplicar e-mails da planilha (manter o último registro se houver duplicatas)
    const emailToRow = new Map<string, ImportRow>()
    for (const row of validRows) {
      emailToRow.set(row.email, row)
    }

    for (const [email, row] of emailToRow.entries()) {
      const member = memberMap.get(email)

      if (!member) {
        notFoundInDb.push({
          email,
          name: row.nameRaw,
          phone: row.phoneRaw,
          country: row.countryRaw,
        })
        continue
      }

      // Se o membro já tem o mesmo número cadastrado
      if (member.phone === row.phoneRaw) {
        alreadyHadSamePhoneCount++
        continue
      }

      const isNew = !member.phone
      if (isNew) {
        newlyAddedPhoneCount++
      } else {
        updatedPhoneCount++
      }

      const updateData: any = {
        id: member.id,
        phone: row.phoneRaw,
      }

      if (row.countryRaw && !member.country) {
        updateData.country = row.countryRaw
      }

      if (row.nameRaw && (!member.name || member.name.trim() === '')) {
        updateData.name = row.nameRaw
      }

      updatesToApply.push(updateData)
    }

    // 6. Aplicar as atualizações no banco em lotes de 100 para manter egress e latência mínimos
    const BATCH_SIZE = 100
    for (let i = 0; i < updatesToApply.length; i += BATCH_SIZE) {
      const batch = updatesToApply.slice(i, i + BATCH_SIZE)

      // Atualizar individualmente ou em promessas paralelas por lote
      await Promise.all(
        batch.map((item) =>
          supabaseAdmin
            .from('members')
            .update({
              phone: item.phone,
              ...(item.country ? { country: item.country } : {}),
              ...(item.name ? { name: item.name } : {}),
            })
            .eq('id', item.id)
        )
      )
    }

    return NextResponse.json({
      success: true,
      report: {
        totalRowsInFile: rawData.length,
        validPhonesFound: validRows.length,
        savedNewPhones: newlyAddedPhoneCount,
        updatedPhones: updatedPhoneCount,
        alreadyHadSamePhone: alreadyHadSamePhoneCount,
        invalidOrMissingPhones: invalidPhoneCount,
        invalidPhoneSamples,
        notFoundInDbCount: notFoundInDb.length,
        notFoundInDb, // Lista completa dos e-mails da planilha que não estão cadastrados na plataforma
      },
    })
  } catch (err: any) {
    console.error('Error in whatsapp import route:', err)
    return NextResponse.json({ error: `Erro inesperado: ${err?.message || 'Erro desconhecido'}` }, { status: 500 })
  }
}

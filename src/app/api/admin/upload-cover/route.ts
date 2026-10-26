import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/app/admin/actions'

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const packId = (formData.get('pack_id') as string) || 'general'
    const versionId = (formData.get('version_id') as string) || `v-${Date.now()}`

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Clean extension
    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp'
    const timestamp = Date.now()
    const storagePath = `covers/${packId}/${versionId}-${timestamp}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const supabase = await createClient()

    const { error: uploadError } = await supabase.storage
      .from('pack-images')
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/webp',
        upsert: true,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('pack-images')
      .getPublicUrl(storagePath)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
    })
  } catch (err: any) {
    console.error('Upload cover error:', err)
    return NextResponse.json({ error: err.message || 'Erro ao fazer upload' }, { status: 500 })
  }
}

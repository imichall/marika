import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Kontrola oprávnění - admin nebo editor s oprávněním member_management.create
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id, role')
      .eq('email', user.email || '')
      .single() as { data: { id: string, role: string } | null, error: any }

    if (roleError || !roleData) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Nemáte oprávnění vytvářet členy'
      })
    }

    // Admin má vždy oprávnění
    if (roleData.role !== 'admin') {
      // Pro editory kontrolujeme oprávnění member_management.create
      const { data: permissionCheck } = await supabase
        .rpc('check_permission', {
          p_email: user.email || '',
          p_section: 'member_management',
          p_action: 'create'
        } as any) as { data: boolean | null }

      if (!permissionCheck) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Nemáte oprávnění vytvářet členy'
        })
      }
    }

    const body = await readBody(event)
    const { department_id, members } = body

    if (!department_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Oddíl je povinný'
      })
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Seznam členů musí být neprázdné pole'
      })
    }

    // Kontrola, zda oddíl existuje
    const { data: department, error: deptError } = await supabase
      .from('member_departments')
      .select('id')
      .eq('id', department_id)
      .single()

    if (deptError || !department) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Oddíl neexistuje'
      })
    }

    // Funkce pro převod data z formátu DD.MM.YYYY na ISO formát YYYY-MM-DD
    const parseDate = (dateStr: string | null | undefined): string | null => {
      if (!dateStr || typeof dateStr !== 'string') return null

      // Formát DD.MM.YYYY
      const match = dateStr.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
      if (match) {
        const [, day, month, year] = match
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }

      // Pokud už je ve formátu YYYY-MM-DD, vrátíme jak je
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr
      }

      return null
    }

    // Validace a příprava dat pro vložení
    const membersToInsert = members.map((member: any, index: number) => {
      // Mapování českých klíčů na anglické
      const full_name = member.Jmeno || member.full_name || member.jmeno
      if (!full_name || typeof full_name !== 'string' || full_name.trim() === '') {
        throw createError({
          statusCode: 400,
          statusMessage: `Člen na pozici ${index + 1} nemá vyplněné jméno (Jmeno)`
        })
      }

      return {
        department_id,
        full_name: full_name.trim(),
        email: (member['E-mail'] || member.email || member['e-mail'])?.trim() || null,
        phone: (member.Telefon || member.phone || member.telefon)?.trim() || null,
        street: (member.Ulice || member.street || member.ulice)?.trim() || null,
        city: (member.Mesto || member.city || member.mesto)?.trim() || null,
        postal_code: (member.PSC || member.postal_code || member.psc)?.trim() || null,
        full_address: (member['Cela Adresa'] || member.full_address || member['cela adresa'])?.trim() || null,
        birth_date: parseDate(member['Datum narozeni'] || member.birth_date || member['datum narozeni']),
        birth_place: (member['Mesto narozeni'] || member.birth_place || member['mesto narozeni'])?.trim() || null,
        notes: member.notes?.trim() || null,
        avatar_url: member.avatar_url?.trim() || null,
        is_active: member.is_active !== undefined ? member.is_active : true
      }
    })

    // Hromadné vložení členů
    const { data: insertedMembers, error: insertError } = await supabase
      .from('member_users')
      .insert(membersToInsert as any)
      .select(`
        *,
        department:member_departments(name, display_name)
      `)

    if (insertError) {
      console.error('Error importing members:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: insertError.message || 'Nepodařilo se importovat členy'
      })
    }

    return {
      success: true,
      imported: insertedMembers?.length || 0,
      members: insertedMembers || []
    }
  } catch (error: any) {
    console.error('Error in bulk import members endpoint:', error)
    throw error
  }
})


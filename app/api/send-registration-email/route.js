import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const formData = await request.json()
    
    const { name, email, phone, role } = formData

    // Prüfe ob API-Key vorhanden ist
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      // In Entwicklung: Loggen statt Fehler werfen
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 E-Mail würde gesendet werden (Development-Modus):')
        console.log('To: schule@teech.de')
        console.log('Subject: Neue vor Ort Anmeldung')
        console.log('Content:', {
          name,
          email,
          phone: phone || 'Nicht angegeben',
          role
        })
        return NextResponse.json({ 
          success: true, 
          message: 'E-Mail im Development-Modus geloggt. RESEND_API_KEY fehlt.' 
        })
      }
      
      return NextResponse.json(
        { success: false, error: 'E-Mail-Service nicht konfiguriert' },
        { status: 500 }
      )
    }

    // Rolle-Labels mappen
    const roleLabels = {
      lehrkraft: 'Lehrkraft',
      schulleiter: 'Schulleiter',
      schüler: 'Schüler',
      medienbeauftragter: 'Medienbeauftragter',
      elternteil: 'Elternteil',
      sonstiges: 'Sonstiges'
    }

    // E-Mail-Inhalt erstellen
    const emailContent = `
Neue vor Ort Anmeldung

Formulardaten:
- Vollständiger Name: ${name}
- Email: ${email}
- Telefon: ${phone || 'Nicht angegeben'}
- Du bist?: ${roleLabels[role] || role}
`

    // Resend nur initialisieren wenn API-Key vorhanden ist
    const resend = new Resend(process.env.RESEND_API_KEY)

    // E-Mail senden
    const { data, error } = await resend.emails.send({
      from: 'IDs-Anmeldung <noreply@teech.de>',
      to: ['schule@teech.de'],
      replyTo: email,
      subject: 'Neue vor Ort Anmeldung',
      text: emailContent,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { success: false, error: 'Fehler beim Senden der E-Mail' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    // Stelle sicher, dass immer JSON zurückgegeben wird
    return NextResponse.json(
      { success: false, error: error.message || 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

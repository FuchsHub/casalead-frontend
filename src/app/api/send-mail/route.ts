// src/app/api/send-mail/route.ts

// zwingt Next.js, diesen Handler auf Node.js laufen zu lassen (nicht Edge)
export const runtime = 'nodejs'

// Import als Namespace – so klappt es verlässlich mit CJS-Modulen
import * as nodemailer from 'nodemailer'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json()

    // SMTP‑Transport konfigurieren
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // SSL bei Port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers: 'SSLv3'
      }
    })

    // Mail verschicken
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to,       // Empfängeradresse
      subject,  // Betreff
      html      // HTML‑Inhalt
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Mail‑Error:', err)
    return NextResponse.json(
      { error: 'Konnte Mail nicht senden' },
      { status: 500 }
    )
  }
}

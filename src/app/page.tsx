'use client'

// src/app/page.tsx
export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">CasaLead – Leads generieren. Einfach. Schön. Effektiv.</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Ihre individuelle Immobilienbewertung als Widget für Ihre Website. Komplett in Ihrem Design.
        </p>

        <a
          href="/login"
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition"
        >
          Zum Login
        </a>

        <div className="mt-12 w-full">
          <h2 className="text-2xl font-semibold mb-4">So sieht das Widget auf Ihrer Website aus:</h2>
          <div className="border rounded-lg p-4 bg-gray-50">
          <div
            dangerouslySetInnerHTML={{
              __html: `<casalead-widget widget="valuation" company="demo"></casalead-widget>`,
            }}
          ></div>

          </div>
        </div>
      </div>
    </main>
  )
}

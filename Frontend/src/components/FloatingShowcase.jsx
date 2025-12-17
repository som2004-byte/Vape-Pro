import React from 'react'

export default function FloatingShowcase({ items = [] }){
  return (
    <section className="mt-10">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item, idx) => (
          <div key={item.src} className="relative rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/70 to-black/60 p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-800/20 via-transparent to-yellow-500/10 blur-3xl" aria-hidden="true" />
            <img
              src={item.src}
              alt={item.title}
              className={`relative mx-auto h-64 w-full object-contain drop-shadow-[0_20px_40px_rgba(124,58,237,0.35)] hover-spin ${
                idx % 3 === 0
                  ? 'float-soft'
                  : idx % 3 === 1
                    ? 'float-soft-delay'
                    : 'float-soft-slower'
              }`}
            />
            <div className="relative mt-4 text-center">
              <p className="font-semibold">{item.title}</p>
              {item.flavor && <p className="text-sm text-gray-400">{item.flavor}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}


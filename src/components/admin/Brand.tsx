export function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <img src="/mascot.png" alt="" width={49} height={80} />
      <span style={{ font: '800 28px/1 system-ui, sans-serif', color: '#2ca4e5', letterSpacing: '.02em' }}>КАНБРИК</span>
    </div>
  )
}

export function Icon() {
  return <img src="/mascot.png" alt="Канбрик" width={18} height={30} style={{ objectFit: 'contain' }} />
}

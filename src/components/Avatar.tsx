import { avatarColors } from '../data/mockData'

function hash(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

export function Avatar({
  name,
  size = 40,
  ring = false,
}: {
  name: string
  size?: number
  ring?: boolean
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const color = avatarColors[hash(name) % avatarColors.length]

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-black ${
        ring ? 'ring-2 ring-black' : ''
      }`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${color}bb)`,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  )
}

export function AvatarStack({ names, size = 28 }: { names: string[]; size?: number }) {
  return (
    <div className="flex items-center">
      {names.map((n, i) => (
        <div key={n + i} style={{ marginLeft: i === 0 ? 0 : -size * 0.35 }}>
          <Avatar name={n} size={size} ring />
        </div>
      ))}
    </div>
  )
}

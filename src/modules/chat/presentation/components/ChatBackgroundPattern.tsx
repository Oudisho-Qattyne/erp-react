import { useState } from "react"
import { MessageCircle, Smile, Heart, Star, Send, Bell, Camera, Music, Sun, Moon, Cloud, Zap, ThumbsUp, Sparkles, Gift } from "lucide-react"

const icons = [MessageCircle, Smile, Heart, Star, Send, Bell, Camera, Music, Sun, Moon, Cloud, Zap, ThumbsUp, Sparkles, Gift]

export function ChatBackgroundPattern() {
  const [instances] = useState(() => {
    const result: { icon: typeof icons[number]; x: number; y: number; size: number; rotation: number; opacity: number }[] = []
    for (let i = 0; i < 50; i++) {
      result.push({
        icon: icons[Math.floor(Math.random() * icons.length)],
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        size: Math.random() * 5 + 2,
        rotation: Math.random() * 360,
        opacity: 0.03 + Math.random() * 0.05,
      })
    }
    return result
  })

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {instances.map(({ icon: Icon, x, y, size, rotation, opacity }, i) => (
        <Icon
          key={i}
          size={size * 6}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            transform: `rotate(${rotation}deg) translate(-50%, -50%)`,
            opacity,
            color: 'currentColor',
          }}
        />
      ))}
    </div>
  )
}

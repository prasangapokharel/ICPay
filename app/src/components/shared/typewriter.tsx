import { useEffect, useState } from 'react'
import { Text } from '@/components/ui/text'

export function Typewriter({ text, className }: { text: string; className?: string }) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    setShown('')
    let index = 0
    const id = setInterval(() => {
      index += 1
      setShown(text.slice(0, index))
      if (index >= text.length) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [text])

  return <Text className={className}>{shown}</Text>
}

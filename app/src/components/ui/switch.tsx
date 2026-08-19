import { Switch as RNSwitch } from 'react-native'

export function Switch({
  value,
  onValueChange,
}: {
  value: boolean
  onValueChange: (value: boolean) => void
}) {
  return <RNSwitch value={value} onValueChange={onValueChange} />
}

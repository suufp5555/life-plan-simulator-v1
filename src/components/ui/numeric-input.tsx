import { useEffect, useState } from 'react';
import { Input } from './input';
import type { InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number;
  onChange: (value: number) => void;
}

export function NumericInput({ value, onChange, ...rest }: Props) {
  const [raw, setRaw] = useState(String(value));

  // 親の値が外部から変わったとき（JSONインポート等）に同期
  useEffect(() => {
    const parsed = parseFloat(raw);
    if (isNaN(parsed) || parsed !== value) {
      setRaw(String(value));
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value;
    setRaw(str);
    const num = parseFloat(str);
    if (!isNaN(num)) onChange(num);
  };

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={raw}
      onChange={handleChange}
      {...rest}
    />
  );
}

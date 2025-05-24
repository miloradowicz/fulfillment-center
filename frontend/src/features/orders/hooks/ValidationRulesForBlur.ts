export const validationRules: Record<string, (value: string) => string | null> = {
  amount: value => (Number(value) <= 0 ? 'Количество товара должно быть больше 0' : null),
}

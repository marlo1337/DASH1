export function applyEntry(balance, type, amount) {
  const signed = type === 'depense' ? -amount : amount;
  return balance + signed;
}

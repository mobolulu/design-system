/**
 * Digit masks for formatted number entry — a KTP number, a card's last
 * digits, a phone number. `#` in a mask is one digit; every other
 * character is a separator shown between the digits around it.
 *
 *   applyMask('3578010909900001', '#### #### #### ####')
 *     → '3578 0109 0990 0001'
 *
 * A separator is only ever shown BETWEEN digits, never trailing: a field
 * that ends in a separator swallows the next backspace (the keyboard
 * deletes the separator, the mask puts it back, and the caret looks stuck).
 */
export function applyMask(raw: string, mask: string): string {
  const digits = raw.replace(/\D/g, '');
  let out = '';
  let used = 0;
  let pending = '';
  for (const ch of mask) {
    if (used >= digits.length) break;
    if (ch === '#') {
      out += pending + digits[used];
      pending = '';
      used += 1;
    } else {
      pending += ch;
    }
  }
  return out;
}

/** How many digits a mask holds. */
export function maskCapacity(mask: string): number {
  let count = 0;
  for (const ch of mask) if (ch === '#') count += 1;
  return count;
}

/** The digits of whatever was typed or pasted, cut to what the mask holds. */
export function unmask(text: string, mask: string): string {
  return text.replace(/\D/g, '').slice(0, maskCapacity(mask));
}

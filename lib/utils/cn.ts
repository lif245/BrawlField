/**
 * Utility function for conditionally joining classNames together.
 * A lightweight alternative to the `clsx` or `classnames` packages.
 *
 * @example
 * cn('base-class', isActive && 'active', isDisabled && 'disabled')
 * // => 'base-class active' (when isActive is true, isDisabled is false)
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(" ");
}

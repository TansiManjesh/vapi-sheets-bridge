export function HondaLogo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 166" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M100 0C44.8 0 0 37.1 0 83s44.8 83 100 83 100-37.1 100-83S155.2 0 100 0zm0 148c-47.5 0-86-29.2-86-65s38.5-65 86-65 86 29.2 86 65-38.5 65-86 65z"
        fill="#E40521"
      />
      <path d="M164 83c0 29.2-28.7 53-64 53S36 112.2 36 83s28.7-53 64-53 64 23.8 64 53z" fill="#E40521" />
      <path d="M100 30c-35.3 0-64 23.8-64 53h128c0-29.2-28.7-53-64-53z" fill="#E40521" />
    </svg>
  )
}

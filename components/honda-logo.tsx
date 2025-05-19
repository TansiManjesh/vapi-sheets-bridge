export function HondaLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="200" fill="white" />
      <path
        d="M150 40C111.34 40 80 71.34 80 110C80 148.66 111.34 180 150 180C188.66 180 220 148.66 220 110C220 71.34 188.66 40 150 40ZM150 160C122.39 160 100 137.61 100 110C100 82.39 122.39 60 150 60C177.61 60 200 82.39 200 110C200 137.61 177.61 160 150 160Z"
        fill="#E40521"
      />
      <path d="M150 60C122.39 60 100 82.39 100 110H80C80 71.34 111.34 40 150 40V60Z" fill="#E40521" />
    </svg>
  )
}

export function NaplesLogo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Sfondo cielo azzurro Napoli */}
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="7"
        fill="#eef7fd"
        stroke="#b6ddf7"
        strokeWidth="1.2"
      />
      {/* Sole mediterraneo */}
      <circle cx="22.5" cy="9.5" r="3.6" fill="#f59e0b" />
      {/* Profilo stilizzato del Vesuvio (Gran Cono + Monte Somma) */}
      <path
        d="M4.5 22.5L11.2 12.2C11.6 11.6 12.4 11.5 13 11.9L14.5 12.8C15 13.1 15.6 13.1 16.1 12.7L19.4 10.6C20 10.2 20.8 10.4 21.2 11L27.5 22.5H4.5Z"
        fill="#006fb8"
      />
      {/* Onda del Golfo di Napoli */}
      <path
        d="M5 25.4C8.2 24.1 11.4 24.1 14.5 25.4C17.6 26.7 20.8 26.7 27 25.2"
        stroke="#0c8cd6"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

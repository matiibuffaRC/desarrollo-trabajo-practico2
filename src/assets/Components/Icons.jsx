// Íconos de trazo (heredan el color con currentColor)
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
};

const make = (paths) =>
  function Icon({ className = "h-5 w-5", ...props }) {
    return (
      <svg {...base} className={className} aria-hidden="true" {...props}>
        {paths}
      </svg>
    );
  };

export const HomeIcon = make(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></>);
export const ListIcon = make(<><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></>);
export const ChartIcon = make(<><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></>);
export const UserIcon = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>);
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />);
export const SearchIcon = make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const FilterIcon = make(<path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" />);
export const XIcon = make(<path d="M18 6 6 18M6 6l12 12" />);
export const ChevronLeft = make(<path d="m15 18-6-6 6-6" />);
export const ChevronRight = make(<path d="m9 18 6-6-6-6" />);
export const ChevronDown = make(<path d="m6 9 6 6 6-6" />);
export const DotsIcon = make(<><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></>);
export const EditIcon = make(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></>);
export const TrashIcon = make(<><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></>);
export const CopyIcon = make(<><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>);
export const DownloadIcon = make(<><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>);
export const UploadIcon = make(<><path d="M12 21V9" /><path d="m7 14 5-5 5 5" /><path d="M5 3h14" /></>);
export const ArrowUp = make(<path d="M12 19V5M5 12l7-7 7 7" />);
export const ArrowDown = make(<path d="M12 5v14M19 12l-7 7-7-7" />);
export const WalletIcon = make(<><path d="M3 7a2 2 0 0 1 2-2h13v4" /><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z" /><circle cx="16" cy="14.5" r="1" /></>);
export const SparkIcon = make(<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />);
export const AlertIcon = make(<><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>);
export const CheckIcon = make(<path d="M20 6 9 17l-5-5" />);
export const EyeIcon = make(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>);
export const EyeOffIcon = make(<><path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.4" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><path d="m3 3 18 18" /></>);
export const SunIcon = make(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>);
export const MoonIcon = make(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />);
export const MonitorIcon = make(<><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>);
export const TargetIcon = make(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>);
export const RepeatIcon = make(<><path d="m17 2 4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></>);
export const CalendarIcon = make(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>);
export const PieIcon = make(<><path d="M21 12A9 9 0 1 1 12 3v9z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15z" /></>);
export const PauseIcon = make(<><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>);
export const PlayIcon = make(<path d="M7 4v16l13-8z" />);
export const MinusIcon = make(<path d="M5 12h14" />);
export const KeyboardIcon = make(<><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></>);

// ---------- Íconos de categorías y metas ----------
export const FoodIcon = make(<><path d="M3 11h18" /><path d="M4 11a8 8 0 0 1 16 0" /><path d="M3 15h18" /><path d="M5 15v1a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-1" /></>);
export const BusIcon = make(<><rect x="4" y="3" width="16" height="15" rx="3" /><path d="M4 11h16M8 18v3M16 18v3" /><path d="M8 14.5h.01M16 14.5h.01" /></>);
export const BoltIcon = make(<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />);
export const FilmIcon = make(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4M3 12h18" /></>);
export const BagIcon = make(<><path d="M5 7h14l-1 14H6L5 7z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" /></>);
export const PillIcon = make(<><path d="M10.5 20.5a5 5 0 0 1-7-7l10-10a5 5 0 0 1 7 7l-10 10z" /><path d="m8.5 8.5 7 7" /></>);
export const BoxIcon = make(<><path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="m3 8 9 5 9-5M12 13v8" /></>);
export const BriefcaseIcon = make(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></>);
export const LaptopIcon = make(<><rect x="4" y="4" width="16" height="11" rx="1.5" /><path d="M2 19h20l-2-4H4l-2 4z" /></>);
export const TrendIcon = make(<><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>);
export const CoinsIcon = make(<><ellipse cx="9" cy="7" rx="6" ry="3" /><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" /><path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.6-2.4-2.9-5.5-3" /></>);
export const PlaneIcon = make(<path d="M17.8 19.2 16 11l3.5-3.5A2.1 2.1 0 0 0 16.5 4.5L13 8 4.8 6.2l-1.6 1.6L10 11.5 7 14.5l-3-.5-1.5 1.5 4 2 2 4L10 20l-.5-3 3-3 3.7 6.8 1.6-1.6z" />);
export const CarIcon = make(<><path d="M5 17H3v-5l2-5h14l2 5v5h-2" /><path d="M3 12h18" /><circle cx="7.5" cy="17" r="2" /><circle cx="16.5" cy="17" r="2" /><path d="M9.5 17h5" /></>);
export const GradIcon = make(<><path d="M22 9 12 4 2 9l10 5 10-5z" /><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6" /></>);
export const GemIcon = make(<><path d="M6 3h12l4 6-10 12L2 9l4-6z" /><path d="M2 9h20M10 3 8 9l4 12 4-12-2-6" /></>);
export const LifebuoyIcon = make(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="m4.9 4.9 4.3 4.3M14.8 14.8l4.3 4.3M14.8 9.2l4.3-4.3M4.9 19.1l4.3-4.3" /></>);
export const GamepadIcon = make(<><path d="M6 11h4M8 9v4M15 12h.01M18 10h.01" /><path d="M17.3 5H6.7a4 4 0 0 0-4 3.6L2 15a3 3 0 0 0 5.4 2l1.6-2h6l1.6 2A3 3 0 0 0 22 15l-.7-6.4A4 4 0 0 0 17.3 5z" /></>);
export const PhoneIcon = make(<><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /></>);
export const UmbrellaIcon = make(<><path d="M12 2a10 10 0 0 1 10 10H2A10 10 0 0 1 12 2z" /><path d="M12 12v7a2 2 0 0 0 4 0" /></>);
export const MusicIcon = make(<><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>);
export const PawIcon = make(<><circle cx="5" cy="10" r="2" /><circle cx="9" cy="5.5" r="2" /><circle cx="15" cy="5.5" r="2" /><circle cx="19" cy="10" r="2" /><path d="M12 12c-3 0-6 4.5-6 7a2 2 0 0 0 2 2c1.5 0 2.5-1 4-1s2.5 1 4 1a2 2 0 0 0 2-2c0-2.5-3-7-6-7z" /></>);
export const TrophyIcon = make(<><path d="M8 21h8M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0V4z" /><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" /></>);

const APP_ICONS = {
  food: FoodIcon, transport: BusIcon, services: BoltIcon, entertainment: FilmIcon, shopping: BagIcon,
  health: PillIcon, home: HomeIcon, other: BoxIcon, salary: BriefcaseIcon, laptop: LaptopIcon,
  investments: TrendIcon, coins: CoinsIcon, plane: PlaneIcon, car: CarIcon, education: GradIcon,
  ring: GemIcon, emergency: LifebuoyIcon, games: GamepadIcon, phone: PhoneIcon, beach: UmbrellaIcon,
  music: MusicIcon, pet: PawIcon, trophy: TrophyIcon, target: TargetIcon,
};

// Compatibilidad con metas guardadas con emojis en versiones anteriores
const LEGACY = {
  "🍔": "food", "🚌": "transport", "💡": "services", "🎬": "entertainment", "🛍️": "shopping", "💊": "health",
  "🏠": "home", "📦": "other", "💼": "salary", "💻": "laptop", "📈": "investments", "💰": "coins", "✈️": "plane",
  "🚗": "car", "🎓": "education", "💍": "ring", "🛟": "emergency", "🎮": "games", "📱": "phone", "🏖️": "beach",
  "🎸": "music", "🐶": "pet", "🏆": "trophy", "🎯": "target",
};

export function AppIcon({ name, className = "h-5 w-5", ...props }) {
  const Icon = APP_ICONS[name] || APP_ICONS[LEGACY[name]] || BoxIcon;
  return <Icon className={className} {...props} />;
}

import {
  UtensilsCrossed,
  Bus,
  Home,
  Zap,
  Smartphone,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Film,
  Users,
  Briefcase,
  Receipt,
  Tag,
  Wallet,
  Laptop,
  Gift,
  TrendingUp,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  food: UtensilsCrossed,
  transport: Bus,
  rent: Home,
  utilities: Zap,
  "airtime---data": Smartphone,
  "airtime-data": Smartphone,
  shopping: ShoppingBag,
  health: HeartPulse,
  education: GraduationCap,
  entertainment: Film,
  family: Users,
  business: Briefcase,
  bills: Receipt,
  other: Tag,
  salary: Wallet,
  freelance: Laptop,
  allowance: Gift,
  investment: TrendingUp,
  gift: Gift,
  tag: Tag,
  circle: Tag,
};

export function getCategoryIcon(icon: string | null | undefined): LucideIcon {
  if (!icon) return CircleDollarSign;
  return ICON_MAP[icon.toLowerCase()] ?? CircleDollarSign;
}

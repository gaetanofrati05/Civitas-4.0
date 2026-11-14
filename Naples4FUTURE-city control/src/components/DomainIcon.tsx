import {
  Building2,
  Bus,
  Compass,
  Leaf,
  ShieldCheck,
} from 'lucide-react';
import type { AgentDomain } from '../types/city';
import { DOMAIN_COLORS } from '../utils/labels';

export function getDomainIconComponent(domain: AgentDomain) {
  switch (domain) {
    case 'mobility':
      return Bus;
    case 'tourism':
      return Compass;
    case 'safety':
      return ShieldCheck;
    case 'environment':
      return Leaf;
    case 'services':
      return Building2;
  }
}

export function DomainIcon({
  domain,
  size = 'sm',
}: {
  domain: AgentDomain;
  size?: 'xs' | 'sm' | 'md';
}) {
  const Icon = getDomainIconComponent(domain);
  const colors = DOMAIN_COLORS[domain];

  if (size === 'xs') {
    return <Icon className={`h-3.5 w-3.5 shrink-0 ${colors.textAccent}`} />;
  }

  const boxSize = size === 'md' ? 'h-9 w-9' : 'h-7 w-7';
  const iconSize = size === 'md' ? 'h-4.5 w-4.5' : 'h-3.5 w-3.5';

  return (
    <span
      className={`inline-flex ${boxSize} shrink-0 items-center justify-center rounded-lg border ${colors.iconBox}`}
      aria-hidden="true"
    >
      <Icon className={iconSize} />
    </span>
  );
}

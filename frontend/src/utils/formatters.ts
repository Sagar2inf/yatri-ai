export function formatINR(amount: number | undefined | null): string {
  const n = Number(amount) || 0;
  if (n >= 100000) {
    return `₹${(n / 100000).toFixed(1)}L`;
  }
  if (n >= 1000) {
    return `₹${(n / 1000).toFixed(1)}K`;
  }
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatINRFull(amount: number | undefined | null): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(timeStr: string): string {
  return timeStr;
}

export function formatDuration(duration: string): string {
  return duration;
}

export function getStepColor(type: string): string {
  const colors: Record<string, string> = {
    train: 'bg-blue-500',
    flight: 'bg-indigo-500',
    bus: 'bg-green-500',
    transport: 'bg-cyan-500',
    'local-transport': 'bg-teal-500',
    activity: 'bg-amber-500',
    checkin: 'bg-purple-500',
    checkout: 'bg-gray-500',
    food: 'bg-orange-500',
    rest: 'bg-pink-400',
  };
  return colors[type] ?? 'bg-gray-400';
}

export function getStepBgColor(type: string): string {
  const colors: Record<string, string> = {
    train: 'bg-blue-50 border-blue-200',
    flight: 'bg-indigo-50 border-indigo-200',
    bus: 'bg-green-50 border-green-200',
    transport: 'bg-cyan-50 border-cyan-200',
    'local-transport': 'bg-teal-50 border-teal-200',
    activity: 'bg-amber-50 border-amber-200',
    checkin: 'bg-purple-50 border-purple-200',
    checkout: 'bg-gray-50 border-gray-200',
    food: 'bg-orange-50 border-orange-200',
    rest: 'bg-pink-50 border-pink-200',
  };
  return colors[type] ?? 'bg-gray-50 border-gray-200';
}

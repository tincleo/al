export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  if (date.toDateString() === now.toDateString()) {
    return `Today at ${formatTime(date)}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${formatTime(date)}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${formatTime(date)}`;
  } else {
    const diffDays = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays < 7) {
      return `${diffDays}d ago at ${formatTime(date)}`;
    } else {
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
    }
  }
}

export const formatPrice = (price: number, includeCurrency: boolean = false): string => {
  const formattedPrice = price.toLocaleString('fr-FR');
  return includeCurrency ? `${formattedPrice} FCFA` : formattedPrice;
};
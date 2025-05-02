
export function formatMessageDate(dateString: string): string {
  const date = new Date(dateString);
  
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
}

export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

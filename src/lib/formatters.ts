export function formatJurisdictionName(jurisdiction: string): string {
  if (!jurisdiction) return '';
  
  switch (jurisdiction.toLowerCase()) {
    case 'henrico':
    case 'chesterfield':
      // Capitalize first letter
      return jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1).toLowerCase();
    case 'richmond':
      return 'Richmond City';
    default:
      // For other or custom jurisdictions, ensure first letter is capitalized
      return jurisdiction.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
  }
} 
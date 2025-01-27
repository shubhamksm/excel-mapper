export function normalizeTitle(title: string): string {
  return (
    title
      // Convert to uppercase for consistent matching
      .toUpperCase()
      // Remove numbers and special characters
      .replace(/[0-9]/g, "")
      // Remove special characters except spaces
      .replace(/[^\w\s]/g, "")
      // Remove extra spaces
      .trim()
      .replace(/\s+/g, " ")
  );
}

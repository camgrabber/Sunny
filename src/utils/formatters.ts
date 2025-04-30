/**
 * Formats a filename by removing numbers, special characters, and file extensions
 * @param filename The original filename
 * @param options Optional configuration for formatting
 * @returns The formatted title
 */
export const formatTitle = (filename: string, options: {
  removeExtension?: boolean;
  removeNumbers?: boolean;
  removeParentheses?: boolean;
  capitalizeWords?: boolean;
} = {
  removeExtension: true,
  removeNumbers: true,
  removeParentheses: true,
  capitalizeWords: true,
}) => {
  const {
    removeExtension = true,
    removeNumbers = true,
    removeParentheses = true,
    capitalizeWords = true,
  } = options;

  // Start with the original filename
  let title = filename;

  // Remove file extension
  if (removeExtension) {
    title = title.replace(/\.[^/.]+$/, '');
  }

  // Remove parentheses and their contents, brackets, etc.
  if (removeParentheses) {
    title = title
      .replace(/\([^)]*\)/g, '')  // Remove (anything)
      .replace(/\[[^\]]*\]/g, '')  // Remove [anything]
      .replace(/\{[^}]*\}/g, '');  // Remove {anything}
  }

  // Remove numbers
  if (removeNumbers) {
    title = title.replace(/[0-9]/g, '');
  }

  // Replace special characters with spaces
  title = title
    .replace(/_/g, ' ')  // Replace underscore with space
    .replace(/-/g, ' ')  // Replace dash with space
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .trim();  // Remove leading/trailing spaces

  // Capitalize first letter of each word
  if (capitalizeWords) {
    title = title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return title;
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes The size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Formats a duration in seconds to a human-readable string
 * @param seconds The duration in seconds
 * @returns Formatted string (e.g., "1:23:45")
 */
export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}; 
/**
 * Removes leading protocol slashes from a string.
 * @param str - The input string.
 * @returns The string with leading slashes removed.
 */
export const removeProtocolSlashes = (str: string): string => {
  const parts = str.split("//");
  return parts.length === 2 ? parts[1] : str;
};

/**
 * Removes leading ampersand from a string.
 * @param str - The input string.
 * @returns The string with leading ampersand removed.
 */
export const removeLeadingAmpersand = (str: string): string => {
  const parts = str.split("@");
  return parts.length === 2 ? parts[1] : str;
};

/**
 * Replaces colons with slashes in a string.
 * @param str - The input string.
 * @returns The string with colons replaced by slashes.
 */
export const replaceColonsWithSlashes = (str: string): string => {
  return str.replace(":", "/");
};

/**
 * Normalizes a repository identifier by applying a series of transformations.
 * @param identifier - The repository identifier.
 * @returns The normalized repository identifier.
 */
export const normalizeRepoIdentifier = (identifier: string): string => {
  if (identifier) {
    identifier = removeProtocolSlashes(identifier);
    identifier = removeLeadingAmpersand(identifier);
    identifier = replaceColonsWithSlashes(identifier);
  }

  return identifier || "";
};

/**
 * Extracts information from a repository identifier.
 * @param identifier - The repository identifier.
 * @returns An object containing identifier, owner ID, and repository name.
 */
export const getRepoIdentifierInfo = (identifier: string) => {
  let [ownerId, repoName] = ["", ""];
  identifier = normalizeRepoIdentifier(identifier);

  if (!identifier) {
    return { identifier, ownerId, repoName };
  }

  const parts = identifier.split(/[\\/]/);

  const githubMatch = parts[0].match(/.*github.com/i);
  if (parts.length > 2 && githubMatch) {
    ownerId = parts[1];
  }

  if (parts.length > 2 && identifier.includes(".git")) {
    repoName = identifier.split("/").slice(-1)[0].split(".git")[0];
  }

  return { identifier, ownerId, repoName };
};

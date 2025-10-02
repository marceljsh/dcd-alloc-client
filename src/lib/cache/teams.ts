/**
 * Teams Cache Management Utilities
 * Handles localStorage caching for teams data to avoid unnecessary API calls
 */

export interface TeamOption {
  id: string;
  name: string;
}

const CACHE_KEY = "teamOptions";
const TIMESTAMP_KEY = "teamOptions_timestamp";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Save teams data to localStorage with timestamp
 */
export const saveTeamsToCache = (teams: TeamOption[]): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(teams));
    localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error("Failed to save teams to cache:", error);
  }
};

/**
 * Load teams data from localStorage if not expired
 */
export const loadTeamsFromCache = (): TeamOption[] | null => {
  try {
    const cachedTeams = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(TIMESTAMP_KEY);

    if (!cachedTeams || !timestamp) {
      return null;
    }

    // Check if cache is expired
    const cacheAge = Date.now() - parseInt(timestamp);
    if (cacheAge > CACHE_DURATION) {
      clearTeamsCache();
      return null;
    }

    const parsedTeams = JSON.parse(cachedTeams);
    return parsedTeams;
  } catch (error) {
    console.error("Failed to load teams from cache:", error);
    clearTeamsCache();
    return null;
  }
};

/**
 * Clear teams cache from localStorage
 */
export const clearTeamsCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
};

/**
 * Check if teams cache exists and is valid
 */
export const isTeamsCacheValid = (): boolean => {
  const cachedTeams = localStorage.getItem(CACHE_KEY);
  const timestamp = localStorage.getItem(TIMESTAMP_KEY);

  if (!cachedTeams || !timestamp) {
    return false;
  }

  const cacheAge = Date.now() - parseInt(timestamp);
  return cacheAge <= CACHE_DURATION;
};

/**
 * Get cache info for debugging
 */
export const getTeamsCacheInfo = () => {
  const cachedTeams = localStorage.getItem(CACHE_KEY);
  const timestamp = localStorage.getItem(TIMESTAMP_KEY);

  if (!cachedTeams || !timestamp) {
    return { exists: false, age: null, valid: false };
  }

  const cacheAge = Date.now() - parseInt(timestamp);
  const ageInHours = Math.floor(cacheAge / (60 * 60 * 1000));

  return {
    exists: true,
    age: ageInHours,
    valid: cacheAge <= CACHE_DURATION,
    timestamp: new Date(parseInt(timestamp)).toISOString(),
  };
};

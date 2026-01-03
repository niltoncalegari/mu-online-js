const fs = require('fs');
const path = require('path');
const configs = {};

/**
 * Read all config files and store them in memory.
 */
const loadAllConfigs = () => {
  const traverseDirectory = (currentPath) => {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const fileStats = fs.statSync(filePath);

      if (fileStats.isDirectory()) {
        // Recursively traverse subdirectories
        traverseDirectory(filePath);
      } else if (file.endsWith('.json')) {
        // Read and parse JSON files
        try {
          const fileName = path.basename(file, '.json');
          configs[fileName] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
          console.error(`Error reading or parsing ${filePath}: ${error}`);
        }
      }
    }
  };

  traverseDirectory('./config');
};

/**
 * Helper function to get a specific config from memory.
 * Supports environment variable overrides for specific keys.
 *
 * @param {string} name The name of the config file.
 * @param {?string} path Path for the nested config object.
 * @return {object|array|null}
 */
const getConfig = (name, path = '') => {
  try {
    const data = configs[name];
    if (!data) {
      return null;
    }

    if (!path) {
      // When no path is provided, return the config object with env var overrides applied
      const result = { ...data };
      // Apply environment variable overrides for each key
      for (const key in result) {
        const envKey = `${name.toUpperCase()}_${key.toUpperCase()}`;
        if (process.env[envKey]) {
          // Try to parse as number if original value is a number
          if (typeof result[key] === 'number') {
            const parsed = Number(process.env[envKey]);
            if (!isNaN(parsed)) {
              result[key] = parsed;
            } else {
              result[key] = process.env[envKey];
            }
          } else {
            result[key] = process.env[envKey];
          }
          if (process.env.DEBUG) {
            console.log(`[Config] Override ${name}.${key} from env ${envKey}: ${result[key]}`);
          }
        }
      }
      return result;
    }

    // Split the dot-separated path into an array of keys
    const keys = path.split('.');

    // Traverse the JSON object using the keys
    let result = data;
    for (const key of keys) {
      if (key in result) {
        result = result[key];
      } else {
        return null;
      }
    }

    // Check for environment variable override
    // Format: {NAME}_{PATH}_{KEY} (all uppercase, dots replaced with underscores)
    // Example: COMMON_JOINSERVERADDRESS for common.joinServerAddress
    const envKey = `${name.toUpperCase()}_${path.toUpperCase().replace(/\./g, '_')}`;
    if (process.env[envKey]) {
      // Try to parse as number if result is a number
      if (typeof result === 'number') {
        const parsed = Number(process.env[envKey]);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
      return process.env[envKey];
    }

    return result;
  } catch (error) {
    console.error(`Error reading or parsing config '${name}': ${error}`);
    return null;
  }
};

module.exports = {
  loadAllConfigs,
  getConfig
};

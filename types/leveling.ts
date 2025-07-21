// Update the imports to use database types where possible
import type {
  UserLevel as DBUserLevel,
  LevelRole as DBLevelRole,
  LevelingConfig as DBLevelingConfig,
  LevelingStats as DBLevelingStats,
} from "./database"

// Re-export database types with any additional properties needed
export interface UserLevel extends DBUserLevel {
  // Add any additional computed properties if needed
}

export interface LevelRole extends DBLevelRole {
  // Add any additional computed properties if needed
}

export interface LevelingConfig extends DBLevelingConfig {
  // Add any additional computed properties if needed
}

export interface LevelingStats extends DBLevelingStats {
  // Add any additional computed properties if needed
}

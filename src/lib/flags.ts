import { publicEnv } from "@/lib/env";

export type FeatureFlag = keyof typeof publicEnv.flags;

export interface RemoteFlagOverrides {
  /** Values from the admin landing settings API, when it exists. */
  [key: string]: boolean | undefined;
}

/**
 * A feature is on only when BOTH the environment allows it and the admin
 * settings (if available) do not switch it off. The admin can disable a
 * feature; it can never enable one the deployment has not shipped.
 */
export function isFeatureEnabled(
  flagName: FeatureFlag,
  remote?: RemoteFlagOverrides | null,
): boolean {
  const envValue = publicEnv.flags[flagName];
  if (!envValue) return false;
  const remoteValue = remote?.[flagName];
  return remoteValue === undefined ? true : remoteValue;
}

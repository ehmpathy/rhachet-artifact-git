import path from 'path';

/**
 * .what
 * `getArtifactObsDir` returns the **observability directory** path for a given artifact URI.
 *
 * .why
 * observability data (logs, metrics, traces, debug files) for an artifact
 * is stored in a dedicated `.rhachet` subdirectory relative to the artifact's route.
 * given an artifact URI, this function determines that directory.
 *
 * by default, the route is `/.rhachet/{key}` within the same parent directory.
 */
export const getArtifactObsDir = (input: { uri: string }): string => {
  const dir = path.dirname(input.uri);
  const key = path.basename(input.uri);
  return path.join(dir, '.rhachet', key);
};

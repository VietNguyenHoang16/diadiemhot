let hasLoggedMissingDatabaseUrl = false;

function logPublicDbError(scope: string, error: unknown) {
  console.error(`[public-db:${scope}]`, error);
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function safePublicDbQuery<T>(
  scope: string,
  fallback: T,
  query: () => Promise<T>
) {
  if (!hasDatabaseUrl()) {
    if (!hasLoggedMissingDatabaseUrl) {
      hasLoggedMissingDatabaseUrl = true;
      logPublicDbError(scope, new Error('Missing DATABASE_URL in runtime environment'));
    }
    return fallback;
  }

  try {
    return await query();
  } catch (error) {
    logPublicDbError(scope, error);
    return fallback;
  }
}

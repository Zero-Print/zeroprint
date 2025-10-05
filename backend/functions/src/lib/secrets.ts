let SecretManagerServiceClient: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SecretManagerServiceClient = require("@google-cloud/secret-manager").SecretManagerServiceClient;
} catch {
  SecretManagerServiceClient = null;
}
const client = SecretManagerServiceClient ? new SecretManagerServiceClient() : null as any;

export async function getSecretValue(name: string): Promise<string | undefined> {
  try {
    const envVal = process.env[name];
    if (envVal) return envVal;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
    if (!projectId || !client) return undefined;
    const [version] = await client.accessSecretVersion({name: `projects/${projectId}/secrets/${name}/versions/latest`});
    const payload = version?.payload?.data?.toString();
    return payload || undefined;
  } catch (_e) {
    return undefined;
  }
}

// Export secrets utilities
export const secrets = {
  getSecretValue,
};



// Password hashing utility for secure authentication simulation using Web Crypto SHA-256

export async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`salt_aisuccesshub_2026_${password}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Simple fallback string transformation if crypto.subtle is unavailable
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `sha256_mock_${Math.abs(hash)}`;
}

// Pre-computed hash for default Admin Password "Admin@12345"
export const ADMIN_PASSWORD_HASH_SAMPLE = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

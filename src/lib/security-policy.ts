import { contentSecurityPolicy } from "./security-policy.shared";

export function protectedContentSecurityPolicy(
  nonce: string,
  development = false,
) {
  return contentSecurityPolicy(nonce, development);
}

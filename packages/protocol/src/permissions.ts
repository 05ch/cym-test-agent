export type Capability =
  | `fs.read:${string}`
  | `fs.write:${string}`
  | `process.spawn:${string}`
  | `git.read`
  | `git.write`
  | `network.connect:${string}`
  | (string & {});

export interface CapabilityViolation {
  required: Capability;
  reason: string;
  timestamp: number;
}

export class CapabilityPolicyEngine {
  constructor(private grantedCapabilities: Set<Capability> = new Set()) {}

  grant(capability: Capability): void {
    this.grantedCapabilities.add(capability);
  }

  revoke(capability: Capability): void {
    this.grantedCapabilities.delete(capability);
  }

  isGranted(required: Capability): boolean {
    return Array.from(this.grantedCapabilities).some(granted =>
      this.matchesCapability(granted, required)
    );
  }

  assertCapability(required: Capability): void {
    if (!this.isGranted(required)) {
      throw new Error(`[Security Violation] Capability Denied: ${required}`);
    }
  }

  private matchesCapability(pattern: string, target: string): boolean {
    if (pattern === '*' || pattern === target) return true;
    if (pattern.endsWith('/**')) {
      const prefix = pattern.slice(0, -3);
      return target.startsWith(prefix);
    }
    if (pattern.endsWith(':*')) {
      const prefix = pattern.slice(0, -1);
      return target.startsWith(prefix);
    }
    return false;
  }

  getAllGranted(): string[] {
    return Array.from(this.grantedCapabilities);
  }
}

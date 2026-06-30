import type { AIReport } from '../types';

const EXECUTIVE_SUMMARIES = [
  'Analysis reveals a coordinated multi-stage attack targeting container orchestration infrastructure. The attacker gained initial access through a compromised container image, established persistence via cron jobs, and attempted lateral movement through SSH key injection. Immediate containment is recommended.',
  'A sophisticated supply chain attack was detected originating from a compromised NPM package. The malicious payload executed post-install scripts that established reverse shell connections to external C2 infrastructure. All affected containers should be rebuilt from trusted base images.',
  'Network analysis indicates DNS tunneling activity consistent with known APT group tactics. Data exfiltration volume is estimated at 2.3GB over the past 48 hours. The tunneling endpoint resolves to infrastructure previously associated with threat actor TA505.',
  'Container escape attempt detected through exploitation of CVE-2024-21626 (runc vulnerability). The attacker leveraged a working directory manipulation to gain host filesystem access. The attack was contained before privilege escalation was achieved.',
  'Cryptocurrency mining operation detected across 3 production containers. Resource consumption analysis shows 340% CPU spike correlated with XMRig miner deployment. The initial compromise vector appears to be an exposed Redis instance with default credentials.',
  'Automated credential stuffing attack detected against the authentication API. Over 50,000 unique credential pairs were attempted in a 2-hour window. The attack originated from a distributed botnet spanning 200+ IP addresses across 15 countries.',
  'File integrity monitoring detected modifications to critical system binaries including /usr/bin/sudo and /usr/bin/passwd. Hash comparison confirms binary replacement consistent with userspace rootkit deployment. Full system rebuild is mandatory.',
  'Web application firewall bypass detected through novel SQL injection technique using Unicode normalization. The attacker successfully extracted user credentials from the authentication database. 12,000 user records potentially compromised.',
  'Privilege escalation chain detected: initial web shell → container root → host access via Docker socket mount. The attack demonstrates advanced knowledge of container security boundaries and Kubernetes RBAC gaps.',
  'Lateral movement detected between production and staging environments through shared service account tokens. The attacker pivoted from a compromised staging pod to access production secrets. Token rotation and network segmentation required immediately.',
];

const LIKELY_CAUSES = [
  'Misconfigured container security context allowing privileged operations',
  'Outdated base container image with known CVEs (last updated 90+ days ago)',
  'Exposed management port (Docker socket mounted in application container)',
  'Weak network segmentation between production and development environments',
  'Compromised CI/CD pipeline injecting malicious code during build process',
  'Default credentials on internal service (Redis/MongoDB exposed without auth)',
  'Supply chain compromise through typosquatted NPM package dependency',
  'Insufficient RBAC policies allowing cross-namespace resource access',
  'Missing egress network policies enabling unrestricted outbound connections',
  'Unpatched web application vulnerability (OWASP Top 10 - Injection)',
];

function generateAIReport(eventId: string, index: number): AIReport {
  const summaryIdx = index % EXECUTIVE_SUMMARIES.length;
  const causeIdx = index % LIKELY_CAUSES.length;

  return {
    id: `report-${index + 1}-${Math.random().toString(36).slice(2, 8)}`,
    eventId,
    executiveSummary: EXECUTIVE_SUMMARIES[summaryIdx],
    attackChain: [
      { step: 1, action: 'Initial Access', detail: 'Exploited vulnerable service endpoint exposed to the internet', indicator: 'Inbound connection from known malicious IP' },
      { step: 2, action: 'Execution', detail: 'Deployed payload via command injection in application parameter', indicator: 'Unexpected child process spawned from web server' },
      { step: 3, action: 'Persistence', detail: 'Created scheduled task for recurring payload execution', indicator: 'New cron entry with base64-encoded command' },
      { step: 4, action: 'Privilege Escalation', detail: 'Exploited SUID binary to gain root access within container', indicator: 'Process UID changed from www-data to root' },
      { step: 5, action: 'Defense Evasion', detail: 'Cleared system logs and modified file timestamps', indicator: 'Log truncation and timestomping detected' },
      { step: 6, action: 'Credential Access', detail: 'Extracted service account tokens and environment variables', indicator: 'Access to /var/run/secrets and /proc/self/environ' },
      { step: 7, action: 'Lateral Movement', detail: 'Used stolen credentials to access adjacent services', indicator: 'SSH connection from container to internal host' },
      { step: 8, action: 'Exfiltration', detail: 'Data exfiltrated via encrypted channel to external server', indicator: 'Anomalous outbound TLS traffic volume' },
    ],
    likelyCause: LIKELY_CAUSES[causeIdx],
    affectedAssets: [
      { name: `api-server-${Math.floor(Math.random() * 9) + 1}`, type: 'container', risk: 'critical', details: 'Primary target - direct compromise confirmed' },
      { name: `prod-k8s-node-0${Math.floor(Math.random() * 3) + 1}`, type: 'host', risk: 'high', details: 'Host access attempted via container escape' },
      { name: `auth-service`, type: 'service', risk: 'high', details: 'Credentials potentially exposed through lateral movement' },
      { name: `internal-network-10.0.${Math.floor(Math.random() * 4)}.0/24`, type: 'network', risk: 'medium', details: 'Network segment accessible from compromised container' },
    ],
    confidenceScore: 75 + Math.floor(Math.random() * 20),
    recommendations: [
      { priority: 1, title: 'Immediate Containment', description: 'Isolate affected containers and rotate all exposed credentials within the blast radius', action: 'kubectl cordon affected-node && kubectl delete pod compromised-pod' },
      { priority: 1, title: 'Credential Rotation', description: 'Rotate all service account tokens, API keys, and database credentials that may have been exposed', action: 'Run automated credential rotation playbook' },
      { priority: 2, title: 'Network Segmentation', description: 'Implement strict network policies to prevent lateral movement between namespaces', action: 'Apply Calico/Cilium network policies for micro-segmentation' },
      { priority: 2, title: 'Image Rebuild', description: 'Rebuild all container images from verified base images with updated dependencies', action: 'Trigger CI/CD pipeline with --no-cache flag' },
      { priority: 3, title: 'Security Hardening', description: 'Enable Pod Security Standards, enforce seccomp profiles, and restrict capabilities', action: 'Apply PodSecurityPolicy restricted profile' },
      { priority: 3, title: 'Monitoring Enhancement', description: 'Deploy additional detection rules based on observed attack patterns', action: 'Update Falco and Suricata rule sets' },
    ],
    mitreMapping: [
      { tactic: 'Initial Access', technique: 'Exploit Public-Facing Application', techniqueId: 'T1190', confidence: 92 },
      { tactic: 'Execution', technique: 'Command and Scripting Interpreter', techniqueId: 'T1059', confidence: 88 },
      { tactic: 'Persistence', technique: 'Scheduled Task/Job', techniqueId: 'T1053', confidence: 85 },
      { tactic: 'Privilege Escalation', technique: 'Exploitation for Privilege Escalation', techniqueId: 'T1068', confidence: 79 },
      { tactic: 'Defense Evasion', technique: 'Indicator Removal', techniqueId: 'T1070', confidence: 73 },
      { tactic: 'Credential Access', technique: 'Steal Application Access Token', techniqueId: 'T1528', confidence: 81 },
      { tactic: 'Lateral Movement', technique: 'Remote Services', techniqueId: 'T1021', confidence: 77 },
      { tactic: 'Exfiltration', technique: 'Exfiltration Over Web Service', techniqueId: 'T1567', confidence: 70 },
    ],
    ruleImprovements: [
      {
        ruleId: 'FALCO-001',
        currentRule: '- rule: Terminal shell in container\n  condition: spawned_process and container and shell_procs',
        suggestedRule: '- rule: Terminal shell in container\n  condition: spawned_process and container and shell_procs and not (k8s.ns.name in (kube-system, monitoring))',
        reason: 'Reduce false positives from legitimate system containers while maintaining detection for application workloads',
      },
      {
        ruleId: 'SURICATA-001',
        currentRule: 'alert tcp any any -> $EXTERNAL_NET any (msg:"Reverse Shell"; flow:established;)',
        suggestedRule: 'alert tcp $HOME_NET any -> $EXTERNAL_NET [4444,5555,6666,7777,8888,9999] (msg:"Reverse Shell - Common Ports"; flow:established,to_server; content:"|2f 62 69 6e 2f|";)',
        reason: 'Target specific reverse shell ports and include binary signature matching for higher fidelity detection',
      },
    ],
    generatedAt: new Date(Date.now() - Math.random() * 86400000),
  };
}

// Pre-generate 50+ AI reports
export const AI_REPORTS: AIReport[] = Array.from({ length: 55 }, (_, i) =>
  generateAIReport(`EVT-${(Date.now() - i * 100000).toString(36).toUpperCase()}`, i)
);

export function getReportForEvent(eventId: string): AIReport {
  const existing = AI_REPORTS.find(r => r.eventId === eventId);
  if (existing) return existing;
  return generateAIReport(eventId, Math.floor(Math.random() * 50));
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Merchant Admin' | 'Agency/Editor' | 'Auditor';
  domain: 'GLOBAL' | 'IN' | 'US' | 'SG';
  verified: boolean;
  lastActive: string;
  initials: string;
  you?: boolean;
}

export interface RoleQuota {
  role: string;
  used: number;
  quota: number;
  status: string;
  limit: string;
  color: string;
}

export interface CapabilityPolicy {
  capability: string;
  owner: 'check' | 'block' | 'view';
  merchant: 'check' | 'block' | 'view';
  agency: 'check' | 'block' | 'view';
  auditor: 'check' | 'block' | 'view';
  gate: string;
}

export interface AuditLogEntry {
  id: string;
  iconType: 'role' | 'key' | 'mfa' | 'payout';
  title: string;
  time: string;
  desc: string;
}

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Arjun Menon',
    email: 'arjun@kalyansilks.com',
    role: 'Super Admin',
    domain: 'GLOBAL',
    verified: true,
    lastActive: 'Today 14:28 IST',
    initials: 'AM',
    you: true,
  },
  {
    id: '2',
    name: 'Priya Nair',
    email: 'priya.nair@kalyansilks.com',
    role: 'Merchant Admin',
    domain: 'IN',
    verified: true,
    lastActive: 'Today 12:04 IST',
    initials: 'PN',
  },
  {
    id: '3',
    name: 'David Chen',
    email: 'david.c@agency.panda',
    role: 'Agency/Editor',
    domain: 'SG',
    verified: true,
    lastActive: 'Today 10:11 SGT',
    initials: 'DC',
  },
  {
    id: '4',
    name: 'Sarah Kim',
    email: 'sarah.k@agency.panda',
    role: 'Agency/Editor',
    domain: 'US',
    verified: true,
    lastActive: 'Yesterday 22:14 EST',
    initials: 'SK',
  },
  {
    id: '5',
    name: 'Rahul Desai',
    email: 'rahul.d@kalyansilks.com',
    role: 'Merchant Admin',
    domain: 'IN',
    verified: true,
    lastActive: 'Today 13:50 IST',
    initials: 'RD',
  },
  {
    id: '6',
    name: 'Meera Pillai',
    email: 'meera.p@kalyansilks.com',
    role: 'Merchant Admin',
    domain: 'IN',
    verified: true,
    lastActive: 'Today 09:03 IST',
    initials: 'MP',
  },
  {
    id: '7',
    name: 'James Park',
    email: 'j.park@agency.panda',
    role: 'Agency/Editor',
    domain: 'US',
    verified: true,
    lastActive: 'Today 06:22 EST',
    initials: 'JP',
  },
  {
    id: '8',
    name: 'Ananya Gupta',
    email: 'ananya@kalyansilks.com',
    role: 'Auditor',
    domain: 'IN',
    verified: true,
    lastActive: 'Yesterday 18:30 IST',
    initials: 'AG',
  },
  {
    id: '9',
    name: 'Li Wei',
    email: 'li.wei@agency.panda',
    role: 'Agency/Editor',
    domain: 'SG',
    verified: true,
    lastActive: 'Today 11:45 SGT',
    initials: 'LW',
  },
  {
    id: '10',
    name: 'Karthik S',
    email: 'karthik.s@kalyansilks.com',
    role: 'Super Admin',
    domain: 'GLOBAL',
    verified: true,
    lastActive: 'Today 14:00 IST',
    initials: 'KS',
  },
  {
    id: '11',
    name: 'Emily Zhang',
    email: 'emily.z@agency.panda',
    role: 'Agency/Editor',
    domain: 'US',
    verified: true,
    lastActive: 'Yesterday 20:05 EST',
    initials: 'EZ',
  },
  {
    id: '12',
    name: 'Vikram R',
    email: 'vikram.r@kalyansilks.com',
    role: 'Merchant Admin',
    domain: 'IN',
    verified: true,
    lastActive: 'Today 08:12 IST',
    initials: 'VR',
  },
  {
    id: '13',
    name: 'Nisha K',
    email: 'nisha.k@kalyansilks.com',
    role: 'Agency/Editor',
    domain: 'IN',
    verified: false,
    lastActive: 'Invited • Pending',
    initials: 'NK',
  },
  {
    id: '14',
    name: 'Alex Turner',
    email: 'alex.t@agency.panda',
    role: 'Agency/Editor',
    domain: 'SG',
    verified: true,
    lastActive: 'Today 07:33 SGT',
    initials: 'AT',
  },
  {
    id: '15',
    name: 'Rohan Mathew',
    email: 'rohan.m@kalyansilks.com',
    role: 'Agency/Editor',
    domain: 'IN',
    verified: true,
    lastActive: 'Yesterday 16:42 IST',
    initials: 'RM',
  },
];

export const INITIAL_ROLE_QUOTAS: RoleQuota[] = [
  {
    role: 'Super Admin',
    used: 2,
    quota: 2,
    status: 'Quota Reached',
    limit: 'Unlimited',
    color: 'text-[var(--text)]',
  },
  {
    role: 'Merchant Admin',
    used: 4,
    quota: 6,
    status: '2 Available',
    limit: '₹50k/day Limit',
    color: 'text-[var(--text)]',
  },
  {
    role: 'Agency/Editor',
    used: 8,
    quota: 12,
    status: '4 Available',
    limit: 'No Payouts',
    color: 'text-[var(--text)]',
  },
  {
    role: 'Auditor',
    used: 1,
    quota: 5,
    status: '4 Available',
    limit: 'Read Only',
    color: 'text-[var(--text)]',
  },
];

export const CAPABILITY_POLICIES: CapabilityPolicy[] = [
  {
    capability: 'UGC Video Ingestion',
    owner: 'check',
    merchant: 'check',
    agency: 'check',
    auditor: 'view',
    gate: 'Auto',
  },
  {
    capability: 'WhatsApp Template Triggers',
    owner: 'check',
    merchant: 'check',
    agency: 'block',
    auditor: 'view',
    gate: 'Dual',
  },
  {
    capability: 'UPI Cash Payout',
    owner: 'check',
    merchant: 'check',
    agency: 'block',
    auditor: 'view',
    gate: 'Dual >₹500',
  },
  {
    capability: 'Meta Ad Catalog Sync',
    owner: 'check',
    merchant: 'check',
    agency: 'check',
    auditor: 'view',
    gate: 'Auto',
  },
  {
    capability: 'Billing & Webhooks',
    owner: 'check',
    merchant: 'block',
    agency: 'block',
    auditor: 'view',
    gate: 'Owner Only',
  },
];

export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: '1',
    iconType: 'role',
    title: 'Role change • Priya Nair → Merchant Admin',
    time: '14:31:02 IST',
    desc: 'Approved by arjun@ • hash 9f2a…c41d • IN domain',
  },
  {
    id: '2',
    iconType: 'key',
    title: 'API Key rotated • prod_whatsapp_v2',
    time: '13:04:11 IST',
    desc: 'Rotated by KS • scope whatsapp:send • ttl 90d',
  },
  {
    id: '3',
    iconType: 'mfa',
    title: 'MFA enforced • Agency seat invite',
    time: '11:22:47 IST',
    desc: 'Invite to nisha.k@ • 2FA required • expires 24h',
  },
  {
    id: '4',
    iconType: 'payout',
    title: 'Payout gate triggered • ₹12,400',
    time: '09:15:33 IST',
    desc: 'Dual-approval queued • requester RD • UPI auto-hold',
  },
];

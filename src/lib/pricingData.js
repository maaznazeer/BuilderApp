export const pricingFeatures = [
  {
    id: 'core-features',
    name: 'Core Features',
    features: [
      { name: 'Projects', tiers: { freemium: '1', essentiel: '3', pro: '10', premium: 'Unlimited' } },
      { name: 'Storage', tiers: { freemium: '500MB', essentiel: '5GB', pro: '25GB', premium: '100GB' } },
      { name: 'Collaborators per Project', tiers: { freemium: '1', essentiel: '5', pro: '15', premium: 'Unlimited' } },
      { name: 'Basic Task Management', tiers: { freemium: true, essentiel: true, pro: true, premium: true } },
      { name: 'Budget Tracking', tiers: { freemium: true, essentiel: true, pro: true, premium: true } },
    ],
  },
  {
    id: 'management-tools',
    name: 'Management Tools',
    features: [
      { name: 'Expense Management', tiers: { freemium: true, essentiel: true, pro: true, premium: true } },
      { name: 'Photo & Video Logs (HD)', tiers: { freemium: 'SD only', essentiel: true, pro: true, premium: true } },
      { name: 'Team & Contractor Directory', tiers: { freemium: false, essentiel: true, pro: true, premium: true } },
      { name: 'Milestone Tracking', tiers: { freemium: false, essentiel: true, pro: true, premium: true } },
      { name: 'Gantt Charts', tiers: { freemium: false, pro: true, premium: true } },
    ],
  },
  {
    id: 'advanced-features',
    name: 'Advanced Features',
    features: [
      { name: 'Advanced Financial Reports', tiers: { freemium: false, essentiel: false, pro: true, premium: true } },
      { name: 'Data Exports (CSV/PDF)', tiers: { freemium: false, essentiel: 'CSV only', pro: true, premium: true } },
      { name: 'Inspection Checklists', tiers: { freemium: false, essentiel: false, pro: false, premium: true } },
      { name: 'Custom Workflows', tiers: { freemium: false, essentiel: false, pro: false, premium: true } },
      { name: 'API Access', tiers: { freemium: false, essentiel: false, pro: false, premium: true } },
    ],
  },
  {
    id: 'support-security',
    name: 'Support & Security',
    features: [
      { name: 'Community Support', tiers: { freemium: true, essentiel: true, pro: true, premium: true } },
      { name: 'Email Support', tiers: { freemium: false, essentiel: true, pro: true, premium: true } },
      { name: 'Priority Support', tiers: { freemium: false, essentiel: false, pro: true, premium: true } },
      { name: 'Dedicated Account Manager', tiers: { freemium: false, essentiel: false, pro: false, premium: true } },
      { name: 'Two-Factor Authentication (2FA)', tiers: { freemium: true, essentiel: true, pro: true, premium: true } },
      { name: 'Advanced Role-Based Permissions', tiers: { freemium: false, essentiel: false, pro: false, premium: true } },
    ],
  },
];
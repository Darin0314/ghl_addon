export const mockKPIs = {
  totalContacts: 1248,
  totalContactsChange: +12,
  revenue: 94500,
  revenueChange: +8.3,
  openDeals: 37,
  openDealsChange: +5,
  appointmentsToday: 6,
  appointmentsTodayChange: -1,
};

export const mockPipelineSummary = [
  { stage: 'New Lead',      count: 24, value: 18200 },
  { stage: 'Contacted',     count: 18, value: 22400 },
  { stage: 'Qualified',     count: 12, value: 19800 },
  { stage: 'Proposal Sent', count: 9,  value: 28500 },
  { stage: 'Won',           count: 6,  value: 31200 },
  { stage: 'Lost',          count: 4,  value: 8700  },
];

export const mockActivity = [
  { id: 1, type: 'contact',     text: 'New contact added: James Hoover',       time: '2 min ago',  icon: 'user' },
  { id: 2, type: 'deal',        text: 'Deal moved to Qualified: Roofing #1032', time: '14 min ago', icon: 'deal' },
  { id: 3, type: 'appointment', text: 'Appointment booked with Sarah Chen',      time: '1 hr ago',   icon: 'calendar' },
  { id: 4, type: 'email',       text: 'Campaign "Spring Promo" sent (243 contacts)', time: '2 hr ago', icon: 'email' },
  { id: 5, type: 'deal',        text: 'Deal Won: Anderson Remodel — $8,400',    time: '3 hr ago',   icon: 'deal' },
  { id: 6, type: 'contact',     text: 'Tag "Hot Lead" added to 5 contacts',     time: '5 hr ago',   icon: 'tag' },
  { id: 7, type: 'appointment', text: 'Appointment completed: Mike Davis',       time: 'Yesterday',  icon: 'calendar' },
  { id: 8, type: 'email',       text: 'Email opened: Quote Follow-Up (34 opens)', time: 'Yesterday', icon: 'email' },
];

export const mockContacts = [
  { id: 1, name: 'James Hoover',   email: 'james@example.com',  phone: '555-0101', source: 'Website',  tags: ['Hot Lead'], stage: 'New Lead',   created_at: '2026-04-07' },
  { id: 2, name: 'Sarah Chen',     email: 'sarah@example.com',  phone: '555-0102', source: 'Referral', tags: ['VIP'],       stage: 'Qualified',  created_at: '2026-04-06' },
  { id: 3, name: 'Mike Davis',     email: 'mike@example.com',   phone: '555-0103', source: 'Google',   tags: [],            stage: 'Contacted',  created_at: '2026-04-05' },
  { id: 4, name: 'Lisa Thompson',  email: 'lisa@example.com',   phone: '555-0104', source: 'Facebook', tags: ['Follow Up'], stage: 'New Lead',   created_at: '2026-04-04' },
  { id: 5, name: 'Robert Klein',   email: 'rob@example.com',    phone: '555-0105', source: 'Website',  tags: ['VIP'],       stage: 'Proposal Sent', created_at: '2026-04-03' },
  { id: 6, name: 'Amanda Foster',  email: 'amanda@example.com', phone: '555-0106', source: 'Referral', tags: [],            stage: 'Won',        created_at: '2026-04-02' },
];

export const mockDeals = [
  { id: 1, title: 'Roofing Replacement #1032', contact: 'James Hoover',  value: 8400,  stage: 'Qualified',     daysInStage: 3 },
  { id: 2, title: 'Full Gut Remodel',          contact: 'Sarah Chen',    value: 22000, stage: 'Proposal Sent', daysInStage: 7 },
  { id: 3, title: 'Siding + Windows',          contact: 'Mike Davis',    value: 6800,  stage: 'Contacted',     daysInStage: 2 },
  { id: 4, title: 'Insurance Supplement',      contact: 'Lisa Thompson', value: 3200,  stage: 'New Lead',      daysInStage: 1 },
  { id: 5, title: 'Anderson Remodel',          contact: 'Robert Klein',  value: 8400,  stage: 'Won',           daysInStage: 0 },
];

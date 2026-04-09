import { create } from 'zustand';
import { mockContacts, mockDeals } from '../data/mockData';

const useAppStore = create((set) => ({
  contacts: mockContacts,
  deals: mockDeals,

  addContact: (contact) =>
    set((s) => ({ contacts: [...s.contacts, { ...contact, id: Date.now() }] })),

  updateContact: (id, data) =>
    set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...data } : c)) })),

  deleteContact: (id) =>
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

  moveDeal: (dealId, newStage) =>
    set((s) => ({ deals: s.deals.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)) })),
}));

export default useAppStore;

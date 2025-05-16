import { supabase } from '../lib/supabase';

export const clientConfigService = {
  // Tipos de ticket por cliente
  async getClientTicketTypes(clientId) {
    const { data, error } = await supabase
      .from('client_ticket_types')
      .select('id, ticket_type_id, ticket_types(name)')
      .eq('client_id', clientId);
    if (error) throw error;
    return data;
  },
  async addClientTicketType(clientId, ticketTypeId) {
    const { error } = await supabase
      .from('client_ticket_types')
      .insert([{ client_id: clientId, ticket_type_id: ticketTypeId }]);
    if (error) throw error;
  },
  async deleteClientTicketType(id) {
    const { error } = await supabase
      .from('client_ticket_types')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Prioridades de ticket por cliente
  async getClientTicketPriorities(clientId) {
    const { data, error } = await supabase
      .from('client_ticket_priorities')
      .select('id, ticket_priority_id, ticket_priorities(name)')
      .eq('client_id', clientId);
    if (error) throw error;
    return data;
  },
  async addClientTicketPriority(clientId, ticketPriorityId) {
    const { error } = await supabase
      .from('client_ticket_priorities')
      .insert([{ client_id: clientId, ticket_priority_id: ticketPriorityId }]);
    if (error) throw error;
  },
  async deleteClientTicketPriority(id) {
    const { error } = await supabase
      .from('client_ticket_priorities')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Categorías de ticket por cliente
  async getClientTicketCategories(clientId) {
    const { data, error } = await supabase
      .from('client_ticket_categories')
      .select('id, ticket_category_id, ticket_categories(name)')
      .eq('client_id', clientId);
    if (error) throw error;
    return data;
  },
  async addClientTicketCategory(clientId, ticketCategoryId) {
    const { error } = await supabase
      .from('client_ticket_categories')
      .insert([{ client_id: clientId, ticket_category_id: ticketCategoryId }]);
    if (error) throw error;
  },
  async deleteClientTicketCategory(id) {
    const { error } = await supabase
      .from('client_ticket_categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Subcategorías de ticket por cliente
  async getClientTicketSubcategories(clientId) {
    const { data, error } = await supabase
      .from('client_ticket_subcategories')
      .select('id, ticket_subcategory_id, ticket_category_id, ticket_subcategories(name), ticket_categories(name)')
      .eq('client_id', clientId);
    if (error) throw error;
    return data;
  },
  async addClientTicketSubcategory(clientId, ticketSubcategoryId, ticketCategoryId) {
    const { error } = await supabase
      .from('client_ticket_subcategories')
      .insert([{ client_id: clientId, ticket_subcategory_id: ticketSubcategoryId, ticket_category_id: ticketCategoryId }]);
    if (error) throw error;
  },
  async deleteClientTicketSubcategory(id) {
    const { error } = await supabase
      .from('client_ticket_subcategories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}; 
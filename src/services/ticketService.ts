import { supabase } from '../lib/supabase';
import { TicketPriority, TicketStatus, TicketType, UserRole } from '../types';

export interface CreateTicketData {
  title: string;
  description: string;
  priority: string;
  type: string;
  category?: string;
  subcategory?: string;
  files?: File[];
}

export const ticketService = {
  async createTicket(data: CreateTicketData) {
    try {
      // Get the current user and their client
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('client_id')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      if (!profile?.client_id) throw new Error('User has no associated client');

      // Upload files first if any
      const fileUrls = [];
      if (data.files?.length) {
        for (const file of data.files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `tickets/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('tickets')
            .upload(filePath, file);

          if (uploadError) throw uploadError;
          if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('tickets')
              .getPublicUrl(filePath);
            fileUrls.push(publicUrl);
          }
        }
      }

      // Create ticket record
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert([
          {
            title: data.title,
            description: data.description,
            priority: data.priority,
            type: data.type,
            category: data.category,
            subcategory: data.subcategory,
            attachments: fileUrls,
            status: 'open',
            user_id: user.id,
            client_id: profile.client_id
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return ticket;
    } catch (error) {
      console.error('Error in createTicket:', error);
      throw error;
    }
  },

  async getTickets() {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          title,
          description,
          priority,
          status,
          type,
          category,
          subcategory,
          created_at,
          updated_at,
          closed_at,
          client_id,
          assigned_to,
          user:user_id (
            name,
            avatar_url
          ),
          assignee:assigned_to (
            name,
            avatar_url
          ),
          client:client_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the database fields to match our interface
      return tickets.map(ticket => ({
        ...ticket,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        closedAt: ticket.closed_at,
        priority: ticket.priority as TicketPriority,
        status: ticket.status as TicketStatus,
        type: ticket.type as TicketType,
        assignedTo: ticket.assigned_to ? ticket.assignee?.name : null,
        clientName: ticket.client?.name || '-'
      }));
    } catch (error) {
      console.error('Error in getTickets:', error);
      throw error;
    }
  },

  async getUsers() {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          role,
          avatar_url,
          language,
          client:client_id (
            name
          )
        `)
        .order('name');

      if (error) throw error;

      return users.map(user => ({
        ...user,
        role: user.role as UserRole,
        clientName: user.client?.name || '-',
        status: 'active' // Default status since the column doesn't exist
      }));
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  },

  async createUser(data: { name: string; email: string; role: UserRole; password: string }) {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Then create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name: data.name,
            role: data.role,
            language: 'es' // Default language
          }
        ]);

      if (profileError) throw profileError;

      return authData.user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  },

  async getTicketTypes() {
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getTicketTypes:', error);
      throw error;
    }
  },

  async getTicketPriorities() {
    try {
      const { data, error } = await supabase
        .from('ticket_priorities')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getTicketPriorities:', error);
      throw error;
    }
  },

  async getTicketCategories() {
    try {
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getTicketCategories:', error);
      throw error;
    }
  },

  async getTicketSubcategories() {
    try {
      const { data, error } = await supabase
        .from('ticket_subcategories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getTicketSubcategories:', error);
      throw error;
    }
  },

  async getClientTicketSettings() {
    try {
      const { data, error } = await supabase
        .from('client_ticket_settings')
        .select('*')
        .order('client_id');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getClientTicketSettings:', error);
      throw error;
    }
  }
};
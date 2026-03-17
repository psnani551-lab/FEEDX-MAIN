import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";

const fxbotUrl = import.meta.env.VITE_FXBOT_SUPABASE_URL as string;
const fxbotAnonKey = import.meta.env.VITE_FXBOT_SUPABASE_ANON_KEY as string;
export const ADMIN_API_KEY = (import.meta.env.VITE_ADMIN_API_KEY as string || 'feedx-default-admin-key-2025').trim();

export const fxbotSupabase = createClient(fxbotUrl, fxbotAnonKey);

// Helper: Secure headers for Admin write operations
const adminHeaders = () => ({
  'Content-Type': 'application/json',
  'x-admin-api-key': ADMIN_API_KEY
});

// Helper: Cache busting timestamp
const getTimestamp = () => `t=${Date.now()}`;

// Logging Helper: Sends administrative actions to the VPS backend
export const logActivity = async (data: {
  type: 'notification' | 'update' | 'resource' | 'event' | 'spotlight' | 'testimonial' | 'institute' | 'settings' | 'project',
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'MODIFIED' | 'PUBLISHED' | 'DRAFTED',
  resource: string,
  details?: any
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await fetch('/api/admin/activity-logs', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({
        ...data,
        username: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'
      })
    });
  } catch (err) {
    console.warn('Logging failed:', err);
  }
};


// Types
export interface Notification {
  id: string;
  title: string;
  description: string;
  status?: 'draft' | 'published';
  timestamp: string;
}

export interface Update {
  id: string;
  title: string;
  description: string;
  images: string[];
  files: string[];
  priority: 'low' | 'medium' | 'high';
  type: string;
  category: string;
  status?: 'draft' | 'published';
  timestamp: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  files: string[];
  images: string[];
  status?: 'draft' | 'published';
  timestamp: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  registerLink: string;
  status: 'upcoming' | 'conducted' | 'draft' | 'published';
  files: string[];
  timestamp: string;
}

export interface Spotlight {
  id: string;
  title: string;
  description: string;
  images: string[];
  status?: 'draft' | 'published';
  timestamp: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  content: string;
  image: string;
  status?: 'draft' | 'published';
  timestamp: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  status: string;
  description: string;
  details: string[];
  projectUrl?: string;
  timestamp: string;
}

export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase fetch error for projects:', error);
      throw error;
    }
    return data.map(p => ({ ...p, timestamp: p.created_at }));
  },
  create: async (data: Omit<Project, 'id' | 'timestamp'>): Promise<Project> => {
    const payload = { ...data, project_url: data.projectUrl };
    delete (payload as any).projectUrl;
    const { data: record, error } = await supabase.from('projects').insert([payload]).select().single();
    if (error) throw error;
    logActivity({ type: 'project', action: 'CREATED', resource: data.title });
    return { ...record, timestamp: record.created_at, projectUrl: record.project_url };
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    logActivity({ type: 'project', action: 'DELETED', resource: id });
  },
  update: async (id: string, data: Partial<Project>): Promise<void> => {
    const payload: any = { ...data };
    if (payload.projectUrl !== undefined) {
      payload.project_url = payload.projectUrl;
      delete payload.projectUrl;
    }
    const { error } = await supabase.from('projects').update(payload).eq('id', id);
    if (error) throw error;
    logActivity({ type: 'project', action: 'UPDATED', resource: data.title || id });
  },
};

export interface GalleryImage {
  id: string;
  url: string;
  order: number;
  caption?: string;
  category?: string;
}

// Notifications API
export const notificationsAPI = {
  getAll: async (): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error for notifications:', error);
      throw error;
    }
    return data.map(n => ({ ...n, timestamp: n.created_at }));
  },

  create: async (data: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> => {
    const { data: record, error } = await supabase
      .from('notifications')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    logActivity({ type: 'notification', action: 'CREATED', resource: data.title });
    return { ...record, timestamp: record.created_at };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) throw error;
    logActivity({ type: 'notification', action: 'DELETED', resource: id });
  },

  update: async (id: string, data: Partial<Notification>): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update(data)
      .eq('id', id);
    if (error) throw error;
    logActivity({ type: 'notification', action: 'UPDATED', resource: data.title || id });
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    logActivity({ type: 'notification', action: status === 'published' ? 'PUBLISHED' : 'DRAFTED', resource: id });
  }
};

// Updates API
export const updatesAPI = {
  getAll: async (): Promise<Update[]> => {
    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error for updates:', error);
      throw error;
    }
    return data.map(u => ({ ...u, timestamp: u.created_at }));
  },

  create: async (data: Omit<Update, 'id' | 'timestamp'>): Promise<Update> => {
    const { data: record, error } = await supabase
      .from('updates')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    logActivity({ type: 'update', action: 'CREATED', resource: data.title });
    return { ...record, timestamp: record.created_at };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('updates')
      .delete()
      .eq('id', id);
    if (error) throw error;
    logActivity({ type: 'update', action: 'DELETED', resource: id });
  },

  update: async (id: string, data: Partial<Update>): Promise<void> => {
    const { error } = await supabase
      .from('updates')
      .update(data)
      .eq('id', id);
    if (error) throw error;
    logActivity({ type: 'update', action: 'UPDATED', resource: data.title || id });
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const { error } = await supabase
      .from('updates')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    logActivity({ type: 'update', action: status === 'published' ? 'PUBLISHED' : 'DRAFTED', resource: id });
  }
};

// Resources API
export const resourcesAPI = {
  getAll: async (): Promise<Resource[]> => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase fetch error for resources:', error);
      throw error;
    }
    return data.map(r => ({ ...r, timestamp: r.created_at }));
  },

  getById: async (id: string): Promise<Resource> => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { ...data, timestamp: data.created_at };
  },

  create: async (data: Omit<Resource, 'id' | 'timestamp'>): Promise<Resource> => {
    const payload = {
      ...data,
      long_description: data.longDescription
    };
    delete (payload as any).longDescription;

    const { data: record, error } = await supabase
      .from('resources')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    logActivity({ type: 'resource', action: 'CREATED', resource: data.title });
    return { ...record, timestamp: record.created_at, longDescription: record.long_description };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);
    if (error) throw error;
    logActivity({ type: 'resource', action: 'DELETED', resource: id });
  },

  update: async (id: string, data: Partial<Resource>): Promise<void> => {
    const payload = { ...data } as any;
    if (data.longDescription) {
      payload.long_description = data.longDescription;
      delete payload.longDescription;
    }
    const { error } = await supabase
      .from('resources')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
    logActivity({ type: 'resource', action: 'UPDATED', resource: data.title || id });
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const { error } = await supabase
      .from('resources')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    logActivity({ type: 'resource', action: status === 'published' ? 'PUBLISHED' : 'DRAFTED', resource: id });
  }
};

// Events API
export const eventsAPI = {
  getAll: async (): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase fetch error for events:', error);
      throw error;
    }
    return data.map(e => ({
      ...e,
      timestamp: e.created_at,
      date: e.event_date || e.date,
      time: e.event_time || e.time,
      registerLink: e.register_link || e.registerLink,
      isComingSoon: e.is_coming_soon || e.isComingSoon,
      adminStatus: e.admin_status || e.adminStatus
    }));
  },

  create: async (data: any): Promise<Event> => {
    const payload = {
      ...data,
      event_date: data.date,
      event_time: data.time,
      register_link: data.registerLink,
      is_coming_soon: data.isComingSoon,
      admin_status: data.adminStatus
    };
    delete payload.date;
    delete payload.time;
    delete payload.registerLink;
    delete payload.isComingSoon;
    delete payload.adminStatus;

    const { data: record, error } = await supabase
      .from('events')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    logActivity({ type: 'event', action: 'CREATED', resource: data.title });
    return {
      ...record,
      timestamp: record.created_at,
      date: record.event_date,
      time: record.event_time,
      registerLink: record.register_link,
      isComingSoon: record.is_coming_soon
    };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
    logActivity({ type: 'event', action: 'DELETED', resource: id });
  },

  update: async (id: string, data: any): Promise<void> => {
    const payload = { ...data };
    if (data.date) {
      payload.event_date = data.date;
      delete payload.date;
    }
    if (data.time) {
      payload.event_time = data.time;
      delete payload.time;
    }
    if (data.registerLink) {
      payload.register_link = data.registerLink;
      delete payload.registerLink;
    }
    if (data.isComingSoon !== undefined) {
      payload.is_coming_soon = data.isComingSoon;
      delete payload.isComingSoon;
    }
    if (data.adminStatus) {
      payload.admin_status = data.adminStatus;
      delete payload.adminStatus;
    }
    const { error } = await supabase.from('events').update(payload).eq('id', id);
    if (error) throw error;
    logActivity({ type: 'event', action: 'UPDATED', resource: data.title || id });
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    const { error } = await supabase.from('events').update({ status }).eq('id', id);
    if (error) throw error;
    logActivity({ type: 'event', action: 'MODIFIED', resource: id, details: { status } });
  }
};

// Spotlight API
export const spotlightAPI = {
  getAll: async (): Promise<Spotlight[]> => {
    const { data, error } = await supabase.from('spotlight').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase fetch error for spotlight:', error);
      throw error;
    }
    return data.map(s => ({ ...s, timestamp: s.created_at }));
  },

  create: async (data: any): Promise<Spotlight> => {
    const { data: record, error } = await supabase.from('spotlight').insert([data]).select().single();
    if (error) throw error;
    logActivity({ type: 'spotlight', action: 'CREATED', resource: data.title });
    return { ...record, timestamp: record.created_at };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('spotlight').delete().eq('id', id);
    if (error) throw error;
    logActivity({ type: 'spotlight', action: 'DELETED', resource: id });
  },

  update: async (id: string, data: Partial<Spotlight>): Promise<void> => {
    const { error } = await supabase.from('spotlight').update(data).eq('id', id);
    if (error) throw error;
    logActivity({ type: 'spotlight', action: 'UPDATED', resource: data.title || id });
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const { error } = await supabase.from('spotlight').update({ status }).eq('id', id);
    if (error) throw error;
    logActivity({ type: 'spotlight', action: status === 'published' ? 'PUBLISHED' : 'DRAFTED', resource: id });
  }
};

// Testimonials API
export const testimonialsAPI = {
  getAll: async (): Promise<Testimonial[]> => {
    const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase fetch error for testimonials:', error);
      throw error;
    }
    return data.map(t => ({ ...t, timestamp: t.created_at }));
  },

  create: async (data: any): Promise<Testimonial> => {
    const { data: record, error } = await supabase.from('testimonials').insert([data]).select().single();
    if (error) throw error;
    logActivity({ type: 'testimonial', action: 'CREATED', resource: data.name });
    return { ...record, timestamp: record.created_at };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;
    logActivity({ type: 'testimonial', action: 'DELETED', resource: id });
  },

  update: async (id: string, data: Partial<Testimonial>): Promise<void> => {
    const { error } = await supabase.from('testimonials').update(data).eq('id', id);
    if (error) throw error;
    logActivity({ type: 'testimonial', action: 'UPDATED', resource: data.name || id });
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const { error } = await supabase.from('testimonials').update({ status }).eq('id', id);
    if (error) throw error;
    logActivity({ type: 'testimonial', action: status === 'published' ? 'PUBLISHED' : 'DRAFTED', resource: id });
  }
};

// Gallery API
export const galleryAPI = {
  getAll: async (): Promise<GalleryImage[]> => {
    const { data, error } = await supabase.from('gallery').select('*').order('display_order', { ascending: true });
    if (error) {
      console.error('Supabase fetch error for gallery:', error);
      throw error;
    }
    return data ? data.map(img => ({ id: img.id, url: img.url, order: img.display_order })) : [];
  },

  create: async (image: { url: string; order: number }) => {
    const { data, error } = await supabase.from('gallery').insert([{ url: image.url, display_order: image.order }]).select().single();
    if (error) throw error;
    logActivity({ type: 'resource', action: 'CREATED', resource: 'Gallery Item', details: { url: image.url } });
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) throw error;
    logActivity({ type: 'resource', action: 'DELETED', resource: 'Gallery Item', details: { id } });
  },

  reorder: async (images: { id: string; order: number }[]) => {
    const promises = images.map(img =>
      supabase.from('gallery').update({ display_order: img.order }).eq('id', img.id)
    );
    await Promise.all(promises);
    logActivity({ type: 'resource', action: 'MODIFIED', resource: 'Gallery Order' });
  },
};

// ECET API
export interface EcetTopic {
  title: string;
  summary: string;
  details: string[];
}

export interface EcetSubject {
  subject: string;
  questions: number;
  icon: string;
  topics: EcetTopic[];
}

export interface EcetQuestion {
  q: string;
  options: string[];
  ans: string;
}

export interface EcetPaper {
  year: string;
  season: string;
  questions: number;
  duration: string;
  difficulty: string;
  downloadUrl: string;
}

export const ecetAPI = {
  getSyllabus: async (): Promise<EcetSubject[]> => {
    const { data } = await supabase.from('ecet_data').select('*').eq('type', 'syllabus');
    return data?.map(d => d.content) || [];
  },
  getTests: async (): Promise<Record<string, EcetQuestion[]>> => {
    const { data } = await supabase.from('ecet_data').select('*').eq('type', 'test');
    const tests: Record<string, EcetQuestion[]> = {};
    data?.forEach(d => {
      tests[d.title] = d.content;
    });
    return tests;
  },
  getPapers: async (): Promise<EcetPaper[]> => {
    const { data } = await supabase.from('ecet_data').select('*').eq('type', 'paper');
    return data?.map(d => ({ ...d.content, downloadUrl: d.url })) || [];
  },
};

export interface FacultyMember { id: string;[key: string]: any; }
export interface Department { id: string;[key: string]: any; }
export interface Course { id: string;[key: string]: any; }
export interface Placement { id: string;[key: string]: any; }

export interface Infrastructure { id: string;[key: string]: any; }
export interface Review { id: string; rating: number;[key: string]: any; }
export interface QA { id: string;[key: string]: any; }

export interface Institute {
  id?: string;
  code: string;
  name: string;
  place: string;
  dist: string;
  region?: string;
  type?: string;
  minority?: string;
  mode?: string;
  description?: string;
  images?: string[];
  bannerImage?: string;
  logoImage?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  principal?: string;
  established?: string;
  courses?: any[];
  departments?: Department[];
  faculty?: FacultyMember[];
  placements?: Placement[];
  gallery?: GalleryImage[];
  infrastructure?: Infrastructure[];
  reviews?: Review[];
  qna?: QA[];
  facilities?: string[];
  vision?: string;
  mission?: string;
  uniqueFeatures?: string;
  unique_features?: string;
  status?: 'draft' | 'published' | string;
  timestamp?: string;
}

export const institutesAPI = {
  getAll: async (): Promise<Institute[]> => {
    const { data, error } = await supabase.from('institutes').select('*');
    if (error) {
      console.error('Supabase fetch error for institutes:', error);
      throw error;
    }
    return (data || []).map(inst => ({
      ...inst,
      logoImage: inst.logo_image,
      bannerImage: inst.banner_image,
      uniqueFeatures: inst.unique_features
    }));
  },
  getByCode: async (code: string): Promise<Institute | null> => {
    const { data, error } = await supabase.from('institutes').select('*').eq('code', code).single();
    if (error) return null;
    return {
      ...data,
      logoImage: data.logo_image,
      bannerImage: data.banner_image,
      uniqueFeatures: data.unique_features
    };
  },
  getById: async (code: string): Promise<Institute | null> => {
    return institutesAPI.getByCode(code);
  },
  create: async (institute: Partial<Institute>) => {
    const payload = {
      ...institute,
      logo_image: institute.logoImage,
      banner_image: institute.bannerImage,
      unique_features: institute.uniqueFeatures || institute.unique_features
    };
    delete (payload as any).logoImage;
    delete (payload as any).bannerImage;
    delete (payload as any).uniqueFeatures;

    const { error } = await supabase.from('institutes').upsert(payload, { onConflict: 'code' });
    if (error) throw error;
    logActivity({ type: 'institute', action: 'UPDATED', resource: institute.name || institute.code });
  },
  delete: async (code: string) => {
    const { error } = await supabase.from('institutes').delete().eq('code', code);
    if (error) throw error;
    logActivity({ type: 'institute', action: 'DELETED', resource: code });
  },
  updateStatus: async (code: string, status: 'published' | 'draft') => {
    const { error } = await supabase.from('institutes').update({ status }).eq('code', code);
    if (error) throw error;
    logActivity({ type: 'institute', action: status === 'published' ? 'PUBLISHED' : 'DRAFTED', resource: code });
  },
};
// In a real migration, we would map every single Express endpoint here.

// Image/File Upload to Supabase Storage
export const uploadFile = async (file: File, bucket = 'uploads'): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};

export const uploadImage = (file: File) => uploadFile(file, 'images');

// Auth API (Logic now managed via Supabase Auth events in AuthContext)
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Legacy support: return what the existing components expect
    return {
      token: data.session?.access_token,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0],
      }
    };
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  getAuditLogs: async () => {
    const { data } = await supabase.from('login_logs').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  getActivityLogs: async () => {
    const res = await fetch('/api/admin/activity-logs', { headers: adminHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },
  downloadBackup: async () => {
    toast({ title: "Backup Feature", description: "Please use Supabase Dashboard for direct data exports." });
  }
};

// Subscriptions API
export const subscriptionsAPI = {
  subscribe: async (data: { name: string; email: string }): Promise<void> => {
    const { error } = await supabase
      .from('subscriptions')
      .insert([data]);
    if (error) throw error;
  }
};

// Contact API
export const contactAPI = {
  send: async (data: { name: string; email: string; message: string }): Promise<void> => {
    const { error } = await supabase
      .from('contact_messages')
      .insert([data]);
    if (error) throw error;
  }
};

// ================== FXBOT STUDENT PORTAL APIs ==================

export interface Student {
  id: string;
  email: string;
  full_name: string;
  pin?: string;
  department: string;
  mobile: string;
  username: string;
  role: 'student' | 'faculty';
  designation: 'student' | 'Faculty' | 'HOD' | 'Principal' | 'Admin';
  created_at: string;
}

export interface FXBotIssue {
  id: string;
  student_id: string;
  department: string;
  type: 'Issue' | 'Feedback' | 'Suggestion';
  category: string;
  description: string;
  whom_to_send: string;
  is_anonymous: boolean;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Escalated';
  staff_name?: string;
  resolution_message?: string;
  internal_directive?: string; // Internal notes from HOD/Principal
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  attachments?: string[];
}

// Helper: get current user's JWT for proxy authorization
// Reads exclusively from localStorage (set after proxy OTP verification)
// No direct Supabase contact — ISP-block safe
const getAuthHeader = async (): Promise<string | undefined> => {
  const localToken = localStorage.getItem('fxbot_access_token');
  return localToken ? `Bearer ${localToken}` : undefined;
};

// Helper: trigger VPS sync after admin writes so data appears instantly
const triggerSync = () => fetch('/api/sync/trigger', { method: 'POST' }).catch(() => {/* non-critical */ });

export const fxbotAPI = {
  // ── Access Code Validation ─────────────────────────────────────────────────
  validateAdminCode: async (code: string, designation: 'Principal' | 'Admin'): Promise<boolean> => {
    const { data, error } = await fxbotSupabase
      .from('fxbot_admin_codes')
      .select('id')
      .eq('code', code.trim().toUpperCase())
      .eq('designation', designation)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  // ── Student Auth & Record Management ──────────────────────────────────────
  checkEmailExists: async (email: string): Promise<boolean> => {
    const { data, error } = await fxbotSupabase
      .from('students')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (error) return false;
    return !!data;
  },

  getStudentProfile: async (email: string): Promise<Student | null> => {
    const { data, error } = await fxbotSupabase
      .from('students')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  getStudentById: async (studentId: string): Promise<Student | null> => {
    const { data, error } = await fxbotSupabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  createStudent: async (student: Omit<Student, 'id' | 'created_at'>): Promise<Student> => {
    const { data, error } = await fxbotSupabase
      .from('students')
      .insert([{
        ...student,
        email: student.email.toLowerCase(),
        department: student.department.toUpperCase(),
        designation: student.role === 'student' ? 'student' : (student.designation || 'Faculty')
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ── Issue Management ───────────────────────────────────────────────────────
  submitIssue: async (issue: Omit<FXBotIssue, 'status' | 'created_at' | 'updated_at'>): Promise<FXBotIssue> => {
    // 1. Separate attachments from the main issue data to avoid schema cache errors
    const { attachments, ...issueData } = issue;

    // 2. Insert main issue record into fxbot_issues
    const { data: insertedIssue, error: issueError } = await fxbotSupabase
      .from('fxbot_issues')
      .insert([{ ...issueData, department: issue.department.toUpperCase() }])
      .select()
      .single();
      
    if (issueError) throw issueError;

    // 3. Insert attachments into issue_attachments if there are any
    if (attachments && attachments.length > 0) {
      const attachmentsData = attachments.map(url => ({
        issue_id: insertedIssue.id,
        url: url
        // filename can be derived or left null in DB if not strictly required
      }));

      const { error: attachmentsError } = await fxbotSupabase
        .from('issue_attachments')
        .insert(attachmentsData);
        
      if (attachmentsError) throw attachmentsError;
    }

    // Return the inserted issue, optionally attaching the URLs back in for frontend consistency
    return { ...insertedIssue, attachments: attachments || [] };
  },

  getStudentIssues: async (studentId: string): Promise<FXBotIssue[]> => {
    const { data, error } = await fxbotSupabase
      .from('fxbot_issues')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  escalateIssue: async (issueId: string, whomToSend: string): Promise<void> => {
    const { error } = await fxbotSupabase
      .from('issues')
      .update({ status: 'Escalated', whom_to_send: whomToSend })
      .eq('id', issueId);
    if (error) throw error;
  },

  getFacultyIssues: async (user: Student): Promise<FXBotIssue[]> => {
    const { designation, department } = user;
    let query = fxbotSupabase.from('fxbot_issues').select(`
      *,
      students:student_id (
        full_name,
        pin,
        department,
        mobile
      )
    `).order('created_at', { ascending: false });

    if (designation === 'Faculty' || designation === 'HOD') {
      query = query.eq('department', department).in('status', ['Pending', 'In Progress', 'Resolved']);
    } else if (designation === 'Principal') {
      query = query.eq('whom_to_send', 'Principal').eq('status', 'Escalated');
    } else if (designation === 'Admin') {
      query = query.in('whom_to_send', ['Admin', 'SBTET']).eq('status', 'Escalated');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getIssueAttachments: async (issueId: string): Promise<string[]> => {
    const { data, error } = await fxbotSupabase
      .from('issue_attachments')
      .select('url')
      .eq('issue_id', issueId);
    
    if (error) {
      console.error("Failed to fetch attachments for", issueId, error);
      return [];
    }
    
    return data?.map(row => row.url) || [];
  },

  submitDirective: async (issueId: string, directive: string): Promise<void> => {
    const { error } = await fxbotSupabase
      .from('fxbot_issues')
      .update({ internal_directive: directive })
      .eq('id', issueId);
    if (error) throw error;
  },

  updateIssueStatus: async (issueId: string, status: string, resolution?: string): Promise<void> => {
    const { error } = await fxbotSupabase
      .from('fxbot_issues')
      .update({
        status,
        resolution_message: resolution,
        resolved_at: status === 'Resolved' ? new Date().toISOString() : null
      })
      .eq('id', issueId);
    if (error) throw error;
  },

  verifySbtetPin: async (pin: string): Promise<{ success: boolean; student?: { name: string; branch: string }; error?: string }> => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/api/sbtet/verify-pin?pin=${encodeURIComponent(pin)}`);
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to connect to verification server' };
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('student_session');
    await fxbotSupabase.auth.signOut();
  }
};



export const settingsAPI = {
  getCommunityMembers: async (): Promise<number> => {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('community_members')
      .single();
    if (error) return 6554;
    return data.community_members || 6554;
  },
  updateCommunityMembers: async (count: number): Promise<void> => {
    const { error } = await supabase
      .from('platform_settings')
      .update({ community_members: count })
      .eq('id', 1);
    if (error) throw error;
    logActivity({ type: 'settings', action: 'MODIFIED', resource: 'Community Members', details: { count } });
  }
};

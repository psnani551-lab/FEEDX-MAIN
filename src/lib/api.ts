import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";

const fxbotUrl = import.meta.env.VITE_FXBOT_SUPABASE_URL as string;
const fxbotAnonKey = import.meta.env.VITE_FXBOT_SUPABASE_ANON_KEY as string;
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY as string || 'feedx-default-admin-key-2025';

export const fxbotSupabase = createClient(fxbotUrl, fxbotAnonKey);

// Helper: Secure headers for Admin write operations
const adminHeaders = () => ({
  'Content-Type': 'application/json',
  'x-admin-api-key': ADMIN_API_KEY
});

// Helper: Cache busting timestamp
const getTimestamp = () => `t=${Date.now()}`;


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
    const res = await fetch(`/api/projects?${getTimestamp()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((p: any) => ({ ...p, timestamp: p.timestamp || p.created_at, projectUrl: p.projectUrl || p.project_url })) : [];
  },
  create: async (data: Omit<Project, 'id' | 'timestamp'>): Promise<Project> => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
  update: async (id: string, data: Partial<Project>): Promise<void> => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
};

export interface GalleryImage {
  id: string;
  url: string;
  order?: number;
  caption?: string;
  category?: string;
  [key: string]: any;
}

export const notificationsAPI = {
  getAll: async (): Promise<Notification[]> => {
    const res = await fetch(`/api/notifications?${getTimestamp()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((n: any) => ({ ...n, timestamp: n.timestamp || n.created_at })) : [];
  },

  create: async (data: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> => {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const record = await res.json();
    return { ...record, timestamp: record.timestamp || record.created_at };
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  update: async (id: string, data: Partial<Notification>): Promise<void> => {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const res = await fetch(`/api/notifications/${id}/status`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Updates API
export const updatesAPI = {
  getAll: async (): Promise<Update[]> => {
    const res = await fetch(`/api/updates?${getTimestamp()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((u: any) => ({ ...u, timestamp: u.timestamp || u.created_at })) : [];
  },

  create: async (data: Omit<Update, 'id' | 'timestamp'>): Promise<Update> => {
    const res = await fetch('/api/updates', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const record = await res.json();
    return { ...record, timestamp: record.timestamp || record.created_at };
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/updates/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  update: async (id: string, data: Partial<Update>): Promise<void> => {
    const res = await fetch(`/api/updates/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const res = await fetch(`/api/updates/${id}/status`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Resources API
export const resourcesAPI = {
  getAll: async (): Promise<Resource[]> => {
    const res = await fetch(`/api/resources?${getTimestamp()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((r: any) => ({ ...r, timestamp: r.timestamp || r.created_at, longDescription: r.longDescription || r.long_description || '' })) : [];
  },

  getById: async (id: string): Promise<Resource> => {
    const res = await fetch(`/api/resources?${getTimestamp()}`);
    const data = await res.json();
    const item = data.find((r: any) => r.id == id); // Loose matching for flexibility
    if (!item) throw new Error('Resource not found');
    return { ...item, timestamp: item.timestamp || item.created_at, longDescription: item.longDescription || item.long_description || '' };
  },

  create: async (data: Omit<Resource, 'id' | 'timestamp'>): Promise<Resource> => {
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const record = await res.json();
    return { ...record, timestamp: record.timestamp || record.created_at, longDescription: record.longDescription || record.long_description || '' };
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/resources/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  update: async (id: string, data: Partial<Resource>): Promise<void> => {
    const res = await fetch(`/api/resources/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const res = await fetch(`/api/resources/${id}/status`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Events API
export const eventsAPI = {
  getAll: async (): Promise<Event[]> => {
    try {
      const res = await fetch(`/api/events?${getTimestamp()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data.map((e: any) => ({
        ...e,
        timestamp: e.timestamp || e.created_at,
        date: e.date || e.event_date,
        time: e.time || e.event_time,
        registerLink: e.registerLink || e.register_link,
        isComingSoon: e.isComingSoon || e.is_coming_soon,
        adminStatus: e.adminStatus || e.admin_status
      })) : [];
    } catch (err) {
      console.error('Backend fetch failed for events, falling back to Supabase:', err);
      const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(e => ({
        ...e,
        timestamp: e.created_at,
        date: e.event_date || e.date,
        time: e.event_time || e.time,
        registerLink: e.register_link || e.registerLink,
        isComingSoon: e.is_coming_soon || e.isComingSoon,
        adminStatus: e.admin_status || e.adminStatus
      }));
    }
  },

  create: async (data: any): Promise<Event> => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  update: async (id: string, data: any): Promise<void> => {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    const res = await fetch(`/api/events/${id}/status`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Spotlight API
export const spotlightAPI = {
  getAll: async (): Promise<Spotlight[]> => {
    const res = await fetch(`/api/spotlight?${getTimestamp()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((s: any) => ({ ...s, timestamp: s.timestamp || s.created_at })) : [];
  },

  create: async (data: any): Promise<Spotlight> => {
    const res = await fetch('/api/spotlight', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const record = await res.json();
    return { ...record, timestamp: record.timestamp || record.created_at };
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/spotlight/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  update: async (id: string, data: Partial<Spotlight>): Promise<void> => {
    const res = await fetch(`/api/spotlight/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const res = await fetch(`/api/spotlight/${id}/status`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Testimonials API
export const testimonialsAPI = {
  getAll: async (): Promise<Testimonial[]> => {
    const res = await fetch(`/api/testimonials?${getTimestamp()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((t: any) => ({ ...t, timestamp: t.timestamp || t.created_at })) : [];
  },

  create: async (data: any): Promise<Testimonial> => {
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const record = await res.json();
    return { ...record, timestamp: record.timestamp || record.created_at };
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/testimonials/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  update: async (id: string, data: Partial<Testimonial>): Promise<void> => {
    const res = await fetch(`/api/testimonials/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const res = await fetch(`/api/testimonials/${id}/status`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Gallery API
export const galleryAPI = {
  getAll: async (): Promise<GalleryImage[]> => {
    const res = await fetch(`/api/gallery?${getTimestamp()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((img: any) => ({ id: img.id, url: img.url, order: img.display_order ?? img.order ?? 0 })) : [];
  },

  create: async (image: { url: string; order: number }) => {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ url: image.url, order: image.order })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`/api/gallery/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  reorder: async (images: GalleryImage[]) => {
    const res = await fetch('/api/gallery/reorder', {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ images })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
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
    return data || [];
  },
  getByCode: async (code: string): Promise<Institute | null> => {
    const { data, error } = await supabase.from('institutes').select('*').eq('code', code).single();
    return data;
  },
  getById: async (code: string): Promise<Institute | null> => {
    const { data, error } = await supabase.from('institutes').select('*').eq('code', code).single();
    return data;
  },
  create: async (institute: Partial<Institute>) => {
    const { error } = await supabase.from('institutes').upsert(institute, { onConflict: 'code' });
    if (error) throw error;
  },
  delete: async (code: string) => {
    const { error } = await supabase.from('institutes').delete().eq('code', code);
    if (error) throw error;
  },
  updateStatus: async (code: string, status: 'published' | 'draft') => {
    const { error } = await supabase.from('institutes').update({ status }).eq('code', code);
    if (error) throw error;
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
    const { data, error } = await fxbotSupabase
      .from('issues')
      .insert([{ ...issue, department: issue.department.toUpperCase() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getStudentIssues: async (studentId: string): Promise<FXBotIssue[]> => {
    const { data, error } = await fxbotSupabase
      .from('issues')
      .select(`
        *,
        issue_attachments (
          url,
          filename
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data?.map((item: any) => ({ ...item, attachments: item.issue_attachments?.map((a: any) => a.url) || [] })) || [];
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
    let query = fxbotSupabase.from('issues').select(`
      *,
      issue_attachments (
        url,
        filename
      ),
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
    return data?.map((item: any) => ({ ...item, attachments: item.issue_attachments?.map((a: any) => a.url) || [] })) || [];
  },

  submitDirective: async (issueId: string, directive: string): Promise<void> => {
    const { error } = await fxbotSupabase
      .from('issues')
      .update({ internal_directive: directive })
      .eq('id', issueId);
    if (error) throw error;
  },

  updateIssueStatus: async (issueId: string, status: string, resolution?: string): Promise<void> => {
    const { error } = await fxbotSupabase
      .from('issues')
      .update({
        status,
        resolution_message: resolution,
        resolved_at: status === 'Resolved' ? new Date().toISOString() : null
      })
      .eq('id', issueId);
    if (error) throw error;
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
  }
};

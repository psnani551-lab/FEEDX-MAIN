import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fxbotSupabase } from "@/integrations/supabase/fxbot-client";



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
    return { ...record, timestamp: record.created_at, projectUrl: record.project_url };
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },
  update: async (id: string, data: Partial<Project>): Promise<void> => {
    const payload: any = { ...data };
    if (payload.projectUrl !== undefined) {
      payload.project_url = payload.projectUrl;
      delete payload.projectUrl;
    }
    const { error } = await supabase.from('projects').update(payload).eq('id', id);
    if (error) throw error;
  },
};

export interface GalleryImage {
  id: string;
  url: string;
  order: number;
}

// Notifications API
export const notificationsAPI = {
  getAll: async (): Promise<Notification[]> => {
    // Use backend API (same domain) — faster and avoids Supabase mobile timeout
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data.map((n: any) => ({ ...n, timestamp: n.timestamp || n.created_at })) : [];
    } catch (err) {
      console.error('Backend fetch failed for notifications, falling back to Supabase:', err);
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(n => ({ ...n, timestamp: n.created_at }));
    }
  },

  create: async (data: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> => {
    const { data: record, error } = await supabase
      .from('notifications')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return { ...record, timestamp: record.created_at };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  update: async (id: string, data: Partial<Notification>): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update(data)
      .eq('id', id);
    if (error) throw error;
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  }
};

// Updates API
export const updatesAPI = {
  getAll: async (): Promise<Update[]> => {
    // Use backend API (same domain) — faster and avoids Supabase mobile timeout
    try {
      const res = await fetch('/api/updates');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data.map((u: any) => ({ ...u, timestamp: u.timestamp || u.created_at })) : [];
    } catch (err) {
      console.error('Backend fetch failed for updates, falling back to Supabase:', err);
      const { data, error } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(u => ({ ...u, timestamp: u.created_at }));
    }
  },

  create: async (data: Omit<Update, 'id' | 'timestamp'>): Promise<Update> => {
    const { data: record, error } = await supabase
      .from('updates')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return { ...record, timestamp: record.created_at };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('updates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  update: async (id: string, data: Partial<Update>): Promise<void> => {
    const { error } = await supabase
      .from('updates')
      .update(data)
      .eq('id', id);
    if (error) throw error;
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const { error } = await supabase
      .from('updates')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  }
};

// Resources API
export const resourcesAPI = {
  getAll: async (): Promise<Resource[]> => {
    try {
      const res = await fetch('/api/resources');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data.map((r: any) => ({ ...r, timestamp: r.timestamp || r.created_at, longDescription: r.longDescription || r.long_description || '' })) : [];
    } catch (err) {
      console.error('Backend fetch failed for resources, falling back to Supabase:', err);
      const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(r => ({ ...r, timestamp: r.created_at }));
    }
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
    return { ...record, timestamp: record.created_at, longDescription: record.long_description };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);
    if (error) throw error;
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
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const { error } = await supabase
      .from('resources')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  }
};

// Events API
export const eventsAPI = {
  getAll: async (): Promise<Event[]> => {
    try {
      const res = await fetch('/api/events');
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
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    const { error } = await supabase.from('events').update({ status }).eq('id', id);
    if (error) throw error;
  }
};

// Spotlight API
export const spotlightAPI = {
  getAll: async (): Promise<Spotlight[]> => {
    try {
      const res = await fetch('/api/spotlight');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data.map((s: any) => ({ ...s, timestamp: s.timestamp || s.created_at })) : [];
    } catch (err) {
      console.error('Backend fetch failed for spotlight, falling back to Supabase:', err);
      const { data, error } = await supabase.from('spotlight').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(s => ({ ...s, timestamp: s.created_at }));
    }
  },

  create: async (data: any): Promise<Spotlight> => {
    const { data: record, error } = await supabase.from('spotlight').insert([data]).select().single();
    if (error) throw error;
    return { ...record, timestamp: record.created_at };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('spotlight').delete().eq('id', id);
    if (error) throw error;
  },

  update: async (id: string, data: Partial<Spotlight>): Promise<void> => {
    const { error } = await supabase.from('spotlight').update(data).eq('id', id);
    if (error) throw error;
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const { error } = await supabase.from('spotlight').update({ status }).eq('id', id);
    if (error) throw error;
  }
};

// Testimonials API
export const testimonialsAPI = {
  getAll: async (): Promise<Testimonial[]> => {
    try {
      const res = await fetch('/api/testimonials');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data.map((t: any) => ({ ...t, timestamp: t.timestamp || t.created_at })) : [];
    } catch (err) {
      console.error('Backend fetch failed for testimonials, falling back to Supabase:', err);
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(t => ({ ...t, timestamp: t.created_at }));
    }
  },

  create: async (data: any): Promise<Testimonial> => {
    const { data: record, error } = await supabase.from('testimonials').insert([data]).select().single();
    if (error) throw error;
    return { ...record, timestamp: record.created_at };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;
  },

  update: async (id: string, data: Partial<Testimonial>): Promise<void> => {
    const { error } = await supabase.from('testimonials').update(data).eq('id', id);
    if (error) throw error;
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const { error } = await supabase.from('testimonials').update({ status }).eq('id', id);
    if (error) throw error;
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
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) throw error;
  },

  reorder: async (images: { id: string; order: number }[]) => {
    const promises = images.map(img =>
      supabase.from('gallery').update({ display_order: img.order }).eq('id', img.id)
    );
    await Promise.all(promises);
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

export const fxbotAPI = {
  // ── Access Code Validation (Principal / Admin signup protection) ──────────
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

  // Student Auth & Record Management
  checkEmailExists: async (email: string): Promise<boolean> => {
    const { data, error } = await fxbotSupabase
      .from('students')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) throw error;
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

  // Admin-only: fetch full student identity by UUID (for audit view)
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

  // Issue Management
  submitIssue: async (issue: Omit<FXBotIssue, 'status' | 'created_at' | 'updated_at'>): Promise<FXBotIssue> => {
    const { data, error } = await fxbotSupabase
      .from('fxbot_issues')
      .insert([{
        ...issue,
        department: issue.department.toUpperCase(), // Normalize department
        status: 'Pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getStudentIssues: async (studentId: string): Promise<FXBotIssue[]> => {
    const { data, error } = await fxbotSupabase
      .from('fxbot_issues')
      .select('*, issue_attachments(url)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => ({
      ...item,
      attachments: item.issue_attachments?.map((a: any) => a.url) || []
    }));
  },

  escalateIssue: async (issueId: string, whomToSend: string): Promise<void> => {
    const { error } = await fxbotSupabase
      .from('fxbot_issues')
      .update({
        status: 'Escalated',
        whom_to_send: whomToSend,
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId);

    if (error) throw error;
  },

  getFacultyIssues: async (user: Student): Promise<FXBotIssue[]> => {
    const { designation, department } = user;
    let query = fxbotSupabase
      .from('fxbot_issues')
      .select('*, issue_attachments(url)')
      .order('created_at', { ascending: false });

    // Tiered Filtering Logic
    if (designation === 'Faculty' || designation === 'HOD' || (user.role === 'faculty' && designation === 'student')) {
      query = query.eq('department', department.toUpperCase());
    }
    // Principal and Admin see Global (all departments)

    const { data, error } = await query;
    if (error) throw error;

    // Process result and apply Principal Identity Masking
    return data.map((item: any) => {
      const issue: FXBotIssue = {
        ...item,
        attachments: item.issue_attachments?.map((a: any) => a.url) || []
      };

      if (designation === 'Principal') {
        // Principal masking: They see "FXID" (username) but we mask the student_id or name in UI
        (issue as any)._principalMask = true;
      }
      return issue;
    });
  },

  submitDirective: async (issueId: string, directive: string): Promise<void> => {
    const { error } = await fxbotSupabase
      .from('fxbot_issues')
      .update({
        internal_directive: directive,
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId);
    if (error) throw error;
  },

  updateIssueStatus: async (issueId: string, status: string, resolution?: string): Promise<void> => {
    const { error } = await fxbotSupabase
      .from('fxbot_issues')
      .update({
        status,
        resolution_message: resolution,
        resolved_at: status === 'Resolved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId);

    if (error) throw error;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("student_session");
    await fxbotSupabase.auth.signOut();
  }
};

export const settingsAPI = {
  getCommunityMembers: async (): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('id', 'community_members')
        .single();

      if (error) throw error;
      return parseInt(data.value, 10) || 6554;
    } catch {
      return 6554; // Fallback
    }
  },
  updateCommunityMembers: async (count: number): Promise<void> => {
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ id: 'community_members', value: count.toString() });

    if (error) throw error;
  }
};

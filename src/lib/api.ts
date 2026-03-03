import { toast } from "@/hooks/use-toast";


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
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.map((p: any) => ({ ...p, timestamp: p.created_at }));
  },
  create: async (data: Omit<Project, 'id' | 'timestamp'>): Promise<Project> => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
  update: async (id: string, data: Partial<Project>): Promise<void> => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((n: any) => ({ ...n, timestamp: n.timestamp || n.created_at })) : [];
  },

  create: async (data: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> => {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  update: async (id: string, data: Partial<Notification>): Promise<void> => {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const res = await fetch(`/api/notifications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Updates API
export const updatesAPI = {
  getAll: async (): Promise<Update[]> => {
    const res = await fetch('/api/updates');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((u: any) => ({ ...u, timestamp: u.timestamp || u.created_at })) : [];
  },

  create: async (data: Omit<Update, 'id' | 'timestamp'>): Promise<Update> => {
    const res = await fetch('/api/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/updates/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  update: async (id: string, data: Partial<Update>): Promise<void> => {
    const res = await fetch(`/api/updates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const res = await fetch(`/api/updates/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Resources API
export const resourcesAPI = {
  getAll: async (): Promise<Resource[]> => {
    const res = await fetch('/api/resources');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((r: any) => ({ ...r, timestamp: r.timestamp || r.created_at, longDescription: r.longDescription || r.long_description || '' })) : [];
  },

  getById: async (id: string): Promise<Resource> => {
    const res = await fetch(`/api/resources/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ...data, timestamp: data.created_at };
  },

  create: async (data: Omit<Resource, 'id' | 'timestamp'>): Promise<Resource> => {
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  update: async (id: string, data: Partial<Resource>): Promise<void> => {
    const res = await fetch(`/api/resources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const res = await fetch(`/api/resources/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Events API
export const eventsAPI = {
  getAll: async (): Promise<Event[]> => {
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
  },

  create: async (data: any): Promise<Event> => {
    // Write directly to VPS JSON — list updates immediately
    const payload = { ...data };
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  delete: async (id: string): Promise<void> => {
    // Delete from VPS JSON — admin list updates immediately
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  update: async (id: string, data: any): Promise<void> => {
    // Update in VPS JSON directly
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    const res = await fetch(`/api/events/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Spotlight API
export const spotlightAPI = {
  getAll: async (): Promise<Spotlight[]> => {
    const res = await fetch('/api/spotlight');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((s: any) => ({ ...s, timestamp: s.timestamp || s.created_at })) : [];
  },

  create: async (data: any): Promise<Spotlight> => {
    const res = await fetch('/api/spotlight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/spotlight/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  update: async (id: string, data: Partial<Spotlight>): Promise<void> => {
    const res = await fetch(`/api/spotlight/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const res = await fetch(`/api/spotlight/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Testimonials API
export const testimonialsAPI = {
  getAll: async (): Promise<Testimonial[]> => {
    const res = await fetch('/api/testimonials');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((t: any) => ({ ...t, timestamp: t.timestamp || t.created_at })) : [];
  },

  create: async (data: any): Promise<Testimonial> => {
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  update: async (id: string, data: Partial<Testimonial>): Promise<void> => {
    const res = await fetch(`/api/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateStatus: async (id: string, status: 'published' | 'draft'): Promise<void> => {
    const res = await fetch(`/api/testimonials/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Gallery API
export const galleryAPI = {
  getAll: async (): Promise<GalleryImage[]> => {
    const res = await fetch('/api/gallery');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((img: any) => ({
      id: img.id,
      url: img.url,
      order: img.display_order || img.order || 0
    })) : [];
  },

  create: async (image: { url: string; order: number }) => {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(image)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  reorder: async (images: { id: string; order: number }[]) => {
    const res = await fetch('/api/gallery/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
    const res = await fetch('/api/ecet/syllabus');
    const data = await res.json();
    return data || [];
  },
  getTests: async (): Promise<Record<string, EcetQuestion[]>> => {
    const res = await fetch('/api/ecet/tests');
    const data = await res.json();
    return data || {};
  },
  getPapers: async (): Promise<EcetPaper[]> => {
    const res = await fetch('/api/ecet/papers');
    const data = await res.json();
    return data || [];
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
    const res = await fetch('/api/institutes');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },
  getByCode: async (code: string): Promise<Institute | null> => {
    try {
      const res = await fetch(`/api/admin/institutes/${code}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch institute by code:', err);
      return null;
    }
  },
  create: async (institute: Partial<Institute>) => {
    const res = await fetch('/api/admin/institutes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(institute)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
  delete: async (code: string) => {
    const res = await fetch(`/api/admin/institutes/${code}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
  updateStatus: async (code: string, status: 'published' | 'draft') => {
    const res = await fetch(`/api/admin/institutes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, status })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
};
// In a real migration, we would map every single Express endpoint here.

// Image/File Upload to Supabase Storage
export const uploadFile = async (file: File, bucket = 'uploads'): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substr(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const res = await fetch(`/api/proxy/storage/upload/${bucket}?path=${filePath}`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream'
    },
    body: file
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Upload failed');
  }

  // The URL should be your image-proxy URL now to be 100% ISP proof
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
  return `/api/image-proxy?url=${encodeURIComponent(publicUrl)}`;
};

export const uploadImage = (file: File) => uploadFile(file, 'images');

// Auth API (Logic now managed via Supabase Auth events in AuthContext)
export const authAPI = {
  login: async (email: string, password: string) => {
    // Check VPS /api/auth/login first (for admin panel users.json)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      if (res.ok) {
        const data = await res.json();
        // Save to local storage for AuthContext to pick up immediately
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        return data;
      }
    } catch (e) {
      console.warn('VPS local auth check failed, trying Supabase proxy...');
    }

    // Fallback to Supabase Proxy (for regular students/users)
    const resProxy = await fetch('/api/proxy/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!resProxy.ok) {
      const errorData = await resProxy.json();
      throw new Error(errorData.error || errorData.message || `Login failed: ${resProxy.status}`);
    }

    const authData = await resProxy.json();
    const result = {
      token: authData.access_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.full_name || authData.user.email.split('@')[0],
      }
    };

    localStorage.setItem('adminToken', result.token);
    localStorage.setItem('adminUser', JSON.stringify(result.user));
    return result;
  },
  signup: async (email: string, password: string, metadata: any = {}) => {
    const res = await fetch('/api/proxy/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, data: metadata })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || errorData.message || `Signup failed: ${res.status}`);
    }

    return await res.json();
  },
  logout: async () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
  getCurrentUser: async () => {
    const userStr = localStorage.getItem('adminUser');
    return userStr ? JSON.parse(userStr) : null;
  },
  getAuditLogs: async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch audit logs from VPS, returning empty:', err);
      return [];
    }
  },
  downloadBackup: async () => {
    toast({ title: "Backup Feature", description: "Please use Supabase Dashboard for direct data exports." });
  }
};

// Subscriptions API
export const subscriptionsAPI = {
  subscribe: async (data: { name: string; email: string }): Promise<void> => {
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

// Contact API
export const contactAPI = {
  send: async (data: { name: string; email: string; message: string }): Promise<void> => {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
    // All requests go through VPS proxy — no direct Supabase contact (ISP-block safe)
    const res = await fetch(`/api/fxbot/admin-codes?code=${encodeURIComponent(code.trim().toUpperCase())}&designation=${encodeURIComponent(designation)}`, {
      headers: { ...(await getAuthHeader() && { 'Authorization': await getAuthHeader() as string }) }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return !!data.valid;
  },

  // ── Student Auth & Record Management ──────────────────────────────────────
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/fxbot/check-email?email=${encodeURIComponent(email)}`, {
        headers: { ...(await getAuthHeader() && { 'Authorization': await getAuthHeader() as string }) }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const proxyData = await res.json();
      return !!proxyData?.exists;
    } catch { return false; }
  },

  getStudentProfile: async (email: string): Promise<Student | null> => {
    const res = await fetch(`/api/fxbot/student?email=${encodeURIComponent(email)}`, {
      headers: { ...(await getAuthHeader() && { 'Authorization': await getAuthHeader() as string }) }
    });
    if (res.status === 406) return null; // Supabase returns 406 when single row not found
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data && Object.keys(data).length > 0 ? data : null;
  },

  getStudentById: async (studentId: string): Promise<Student | null> => {
    const res = await fetch(`/api/fxbot/student/${encodeURIComponent(studentId)}`, {
      headers: { ...(await getAuthHeader() && { 'Authorization': await getAuthHeader() as string }) }
    });
    if (res.status === 406) return null; // Supabase returns 406 when single row not found
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data && Object.keys(data).length > 0 ? data : null;
  },

  createStudent: async (student: Omit<Student, 'id' | 'created_at'>): Promise<Student> => {
    const res = await fetch('/api/fxbot/student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeader() && { 'Authorization': await getAuthHeader() as string })
      },
      body: JSON.stringify({ ...student, email: student.email.toLowerCase(), department: student.department.toUpperCase(), designation: student.role === 'student' ? 'student' : (student.designation || 'Faculty') })
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || `HTTP ${res.status}`); }
    return await res.json();
  },

  // ── Issue Management ───────────────────────────────────────────────────────
  submitIssue: async (issue: Omit<FXBotIssue, 'status' | 'created_at' | 'updated_at'>): Promise<FXBotIssue> => {
    const res = await fetch('/api/fxbot/issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeader() && { 'Authorization': await getAuthHeader() as string })
      },
      body: JSON.stringify({ ...issue, department: issue.department.toUpperCase() })
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || `HTTP ${res.status}`); }
    return await res.json();
  },

  getStudentIssues: async (studentId: string): Promise<FXBotIssue[]> => {
    const res = await fetch(`/api/fxbot/issues/student/${encodeURIComponent(studentId)}`, {
      headers: { ...(await getAuthHeader() && { 'Authorization': await getAuthHeader() as string }) }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((item: any) => ({ ...item, attachments: item.issue_attachments?.map((a: any) => a.url) || [] })) : [];
  },

  escalateIssue: async (issueId: string, whomToSend: string): Promise<void> => {
    const res = await fetch(`/api/fxbot/issues/${encodeURIComponent(issueId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeader() && { 'Authorization': await getAuthHeader() as string })
      },
      body: JSON.stringify({ status: 'Escalated', whom_to_send: whomToSend })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  getFacultyIssues: async (user: Student): Promise<FXBotIssue[]> => {
    const { designation, department } = user;
    const params = new URLSearchParams({ designation: designation || '', department: department || '' });
    const res = await fetch(`/api/fxbot/issues?${params}`, {
      headers: { ...(await getAuthHeader() && { 'Authorization': await getAuthHeader() as string }) }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map((item: any) => ({ ...item, attachments: item.issue_attachments?.map((a: any) => a.url) || [] })) : [];
  },

  submitDirective: async (issueId: string, directive: string): Promise<void> => {
    const res = await fetch(`/api/fxbot/issues/${encodeURIComponent(issueId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeader() && { 'Authorization': await getAuthHeader() as string })
      },
      body: JSON.stringify({ internal_directive: directive })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateIssueStatus: async (issueId: string, status: string, resolution?: string): Promise<void> => {
    const res = await fetch(`/api/fxbot/issues/${encodeURIComponent(issueId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeader() && { 'Authorization': await getAuthHeader() as string })
      },
      body: JSON.stringify({ status, resolution_message: resolution, resolved_at: status === 'Resolved' ? new Date().toISOString() : null })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  logout: async (): Promise<void> => {
    // Clear all local ISP-bypass tokens and student session
    const token = localStorage.getItem('fxbot_access_token');
    localStorage.removeItem('fxbot_access_token');
    localStorage.removeItem('fxbot_refresh_token');
    localStorage.removeItem('student_session');
    // Inform VPS to invalidate server-side session (fire-and-forget, non-critical)
    if (token) {
      fetch('/api/fxbot/sign-out', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => { });
    }
  }
};



export const settingsAPI = {
  getCommunityMembers: async (): Promise<number> => {
    try {
      // Use VPS endpoint — no direct Supabase contact (ISP-block safe)
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return parseInt(data.community_members, 10) || 6554;
    } catch {
      return 6554; // Fallback
    }
  },
  updateCommunityMembers: async (count: number): Promise<void> => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ community_members: count.toString() })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};

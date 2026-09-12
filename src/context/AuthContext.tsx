import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Workspace, Project, CollectionForm } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  workspace: Workspace | null;
  project: Project | null;
  collectionForm: CollectionForm | null;
  isLoading: boolean;
  isDemoMode: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  refreshWorkspaceContext: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'demo-user-001',
  app_metadata: {},
  user_metadata: { full_name: 'Demo Founder' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'founder@demo.reviewvault.dev',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

const DEMO_WORKSPACE: Workspace = {
  id: 'ws-demo-1',
  ownerId: 'demo-user-001',
  name: 'Acme SaaS Studio',
  slug: 'acme-saas',
  plan: 'free',
  createdAt: new Date().toISOString(),
};

const DEMO_PROJECT: Project = {
  id: 'proj-demo-1',
  workspaceId: 'ws-demo-1',
  name: 'Pulse AI Product',
  slug: 'pulse-ai',
  websiteUrl: 'https://pulseai.dev',
  createdAt: new Date().toISOString(),
};

const DEMO_FORM: CollectionForm = {
  id: 'form-demo-1',
  projectId: 'proj-demo-1',
  publicSlug: 'pulse-feedback',
  title: 'Share Your Experience with Pulse AI',
  description: 'Your feedback helps other founders discover how we accelerate growth.',
  isActive: true,
  allowVideo: true,
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [collectionForm, setCollectionForm] = useState<CollectionForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    // Only allow demo mode if explicitly set in localStorage AND supabase is not configured
    return localStorage.getItem('reviewvault_demo_mode') === 'true' && !isSupabaseConfigured;
  });
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize workspace, project, and collection form for the user
  const initUserTenancy = async (currentUser: User) => {
    if (!supabase) return;

    try {
      // 1. Fetch or create workspace
      const { data: workspaces, error: wsError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', currentUser.id);

      if (wsError) throw wsError;

      let currentWs: Workspace;

      if (!workspaces || workspaces.length === 0) {
        const userPrefix = (currentUser.email || 'user').split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        const defaultSlug = `${userPrefix}-ws-${currentUser.id.substring(0, 6)}`;
        
        const { data: newWs, error: createWsErr } = await supabase
          .from('workspaces')
          .insert({
            owner_id: currentUser.id,
            name: `${userPrefix.toUpperCase()}'s Workspace`,
            slug: defaultSlug,
            plan: 'free',
          })
          .select()
          .single();

        if (createWsErr) throw createWsErr;
        currentWs = {
          id: newWs.id,
          ownerId: newWs.owner_id,
          name: newWs.name,
          slug: newWs.slug,
          plan: newWs.plan,
          createdAt: newWs.created_at,
          updatedAt: newWs.updated_at,
        };
      } else {
        const row = workspaces[0];
        currentWs = {
          id: row.id,
          ownerId: row.owner_id,
          name: row.name,
          slug: row.slug,
          plan: row.plan,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
      setWorkspace(currentWs);

      // 2. Fetch or create project
      const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', currentWs.id);

      if (projError) throw projError;

      let currentProj: Project;

      if (!projects || projects.length === 0) {
        const projSlug = `${currentWs.slug}-project`;
        const { data: newProj, error: createProjErr } = await supabase
          .from('projects')
          .insert({
            workspace_id: currentWs.id,
            name: 'Main Product',
            slug: projSlug,
          })
          .select()
          .single();

        if (createProjErr) throw createProjErr;
        currentProj = {
          id: newProj.id,
          workspaceId: newProj.workspace_id,
          name: newProj.name,
          slug: newProj.slug,
          websiteUrl: newProj.website_url,
          createdAt: newProj.created_at,
          updatedAt: newProj.updated_at,
        };
      } else {
        const row = projects[0];
        currentProj = {
          id: row.id,
          workspaceId: row.workspace_id,
          name: row.name,
          slug: row.slug,
          websiteUrl: row.website_url,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
      setProject(currentProj);

      // 3. Fetch or create collection form
      const { data: forms, error: formError } = await supabase
        .from('collection_forms')
        .select('*')
        .eq('project_id', currentProj.id);

      if (formError) throw formError;

      if (!forms || forms.length === 0) {
        const formSlug = `${currentProj.slug}-feedback`;
        const { data: newForm, error: createFormErr } = await supabase
          .from('collection_forms')
          .insert({
            project_id: currentProj.id,
            public_slug: formSlug,
            title: `Share your experience with ${currentProj.name}`,
            description: 'Your honest feedback helps us grow and serve you better.',
            is_active: true,
          })
          .select()
          .single();

        if (createFormErr) throw createFormErr;
        setCollectionForm({
          id: newForm.id,
          projectId: newForm.project_id,
          publicSlug: newForm.public_slug,
          title: newForm.title,
          description: newForm.description,
          isActive: newForm.is_active,
          allowVideo: newForm.allow_video,
          settings: newForm.settings,
          createdAt: newForm.created_at,
          updatedAt: newForm.updated_at,
        });
      } else {
        const row = forms[0];
        setCollectionForm({
          id: row.id,
          projectId: row.project_id,
          publicSlug: row.public_slug,
          title: row.title,
          description: row.description,
          isActive: row.is_active,
          allowVideo: row.allow_video,
          settings: row.settings,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      }
    } catch (err: any) {
      console.error('[AuthContext] Failed to initialize tenant workspace/project:', err);
      setAuthError(err.message || 'Failed to initialize tenant workspace');
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      if (isDemoMode) {
        setUser(DEMO_USER);
        setWorkspace(DEMO_WORKSPACE);
        setProject(DEMO_PROJECT);
        setCollectionForm(DEMO_FORM);
      }
      setIsLoading(false);
      return;
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        initUserTenancy(session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await initUserTenancy(session.user);
      } else {
        setWorkspace(null);
        setProject(null);
        setCollectionForm(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  const signUp = async (email: string, password: string) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' 
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }

    if (data.user) {
      setUser(data.user);
      await initUserTenancy(data.user);
    }

    return { success: true };
  };

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        error: 'Supabase is not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment variables.' 
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }

    if (data.user) {
      setUser(data.user);
      await initUserTenancy(data.user);
    }

    return { success: true };
  };

  const signOut = async () => {
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setWorkspace(null);
    setProject(null);
    setCollectionForm(null);
    disableDemoMode();
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        error: 'Supabase is not configured. Password recovery requires cloud Supabase credentials.' 
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const enableDemoMode = () => {
    if (isSupabaseConfigured) {
      console.warn('[Security] Demo mode is disabled in production when Supabase is configured.');
      return;
    }
    localStorage.setItem('reviewvault_demo_mode', 'true');
    setIsDemoMode(true);
    setUser(DEMO_USER);
    setWorkspace(DEMO_WORKSPACE);
    setProject(DEMO_PROJECT);
    setCollectionForm(DEMO_FORM);
  };

  const disableDemoMode = () => {
    localStorage.removeItem('reviewvault_demo_mode');
    setIsDemoMode(false);
    setUser(null);
    setWorkspace(null);
    setProject(null);
    setCollectionForm(null);
  };

  const refreshWorkspaceContext = async () => {
    if (user) {
      await initUserTenancy(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        workspace,
        project,
        collectionForm,
        isLoading,
        isDemoMode,
        authError,
        setAuthError,
        signUp,
        signIn,
        signOut,
        resetPassword,
        enableDemoMode,
        disableDemoMode,
        refreshWorkspaceContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

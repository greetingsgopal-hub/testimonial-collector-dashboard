import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { Workspace, Project, CollectionForm, PlanTier } from '../types';
import { cleanBrandOrProductName, deduplicateRepeatedString } from '../lib/security';

/** Translate raw Firebase auth error codes into friendly, customer-readable messages. */
function translateFirebaseError(error: any): string {
  const code: string = error?.code || '';
  const map: Record<string, string> = {
    'auth/invalid-email':             'Please enter a valid email address.',
    'auth/user-disabled':             'This account has been disabled. Please contact support.',
    'auth/user-not-found':            'No account found with this email. Please check or sign up.',
    'auth/wrong-password':            'Incorrect password. Please try again or use Forgot Password.',
    'auth/invalid-credential':        'Incorrect email or password. Please try again.',
    'auth/too-many-requests':         'Too many failed attempts. Please wait a moment and try again.',
    'auth/email-already-in-use':      'An account with this email already exists. Please sign in instead.',
    'auth/weak-password':             'Password must be at least 6 characters long.',
    'auth/network-request-failed':    'Network error. Please check your connection and try again.',
    'auth/popup-closed-by-user':      'Google sign-in window was closed before completing.',
    'auth/popup-blocked':             'Sign-in popup was blocked by your browser. Please allow popups for this site.',
    'auth/cancelled-popup-request':   'Sign-in request was cancelled. Please try again.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email using a different sign-in method.',
    'auth/operation-not-allowed':     'Google sign-in is not yet enabled in the Firebase Console. Please enable Google under Authentication > Sign-in method.',
    'auth/unauthorized-domain':       'This domain is not authorized for Firebase Authentication. Please ensure the production hostname is added to Authorized Domains in Firebase Console.',
    'auth/requires-recent-login':     'Please sign out and sign in again to continue.',
  };
  return map[code] || error?.message || 'An unexpected error occurred. Please try again.';
}

export interface AuthUser {
  id: string;
  uid: string;
  email: string | null;
  displayName?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  workspace: Workspace | null;
  project: Project | null;
  collectionForm: CollectionForm | null;
  isLoading: boolean;
  isDemoMode: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  refreshWorkspaceContext: () => Promise<void>;
  // ── Multi-project support ───────────────────────────────
  allProjects: Project[];
  setActiveProject: (project: Project) => Promise<void>;
  createNewProject: (name: string, websiteUrl?: string) => Promise<Project | null>;
  updateProjectDetails: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  deleteProjectById: (id: string) => Promise<boolean>;
  isNewUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: AuthUser = {
  id: 'demo-user-001',
  uid: 'demo-user-001',
  email: 'founder@demo.pandapraise.dev',
  displayName: 'Demo Founder',
};

const DEMO_WORKSPACE: Workspace = {
  id: 'ws-demo-1',
  ownerId: 'demo-user-001',
  name: 'Acme SaaS Studio',
  slug: 'acme-saas',
  plan: 'free',
  testimonialCount: 8,
  projectCount: 2,
  seatCount: 1,
  createdAt: new Date().toISOString(),
};

const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-demo-1',
    workspaceId: 'ws-demo-1',
    ownerId: 'demo-user-001',
    name: 'Pulse AI Product',
    slug: 'pulse-ai',
    websiteUrl: 'https://pulseai.dev',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-demo-2',
    workspaceId: 'ws-demo-1',
    ownerId: 'demo-user-001',
    name: 'NightOwl Analytics',
    slug: 'nightowl',
    websiteUrl: 'https://nightowl.io',
    createdAt: new Date().toISOString(),
  },
];

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [collectionForm, setCollectionForm] = useState<CollectionForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const isDemo = localStorage.getItem('pandapraise_demo_mode') === 'true';
    return isDemo && !isFirebaseConfigured;
  });
  const [authError, setAuthError] = useState<string | null>(null);

  // Load the collection form for a given project
  const loadCollectionForm = useCallback(async (currentUser: AuthUser, currentProj: Project) => {
    if (!db) return;
    try {
      const formQuery = query(
        collection(db, 'collection_forms'),
        where('ownerId', '==', currentUser.uid),
        where('projectId', '==', currentProj.id)
      );
      const formSnapshot = await getDocs(formQuery);

      if (formSnapshot.empty) {
        const formSlug = `${currentProj.slug}-feedback`;
        const formRef = doc(collection(db, 'collection_forms'));
        const now = new Date().toISOString();

        const cleanProjName = cleanBrandOrProductName(currentProj.name);
        const formTitle = cleanProjName
          ? `Share your experience with ${cleanProjName}`
          : 'Share your experience';

        const formData = {
          projectId: currentProj.id,
          ownerId: currentUser.uid,
          publicSlug: formSlug,
          title: formTitle,
          description: 'Your honest feedback helps us grow and serve you better.',
          isActive: true,
          allowVideo: true,
          settings: {},
          createdAt: now,
          updatedAt: now,
        };

        await setDoc(formRef, formData);
        setCollectionForm({
          id: formRef.id,
          ...formData,
        });
      } else {
        const row = formSnapshot.docs[0];
        const data = row.data();
        setCollectionForm({
          id: row.id,
          projectId: data.projectId,
          publicSlug: data.publicSlug,
          title: deduplicateRepeatedString(data.title) || 'Share your experience',
          description: data.description,
          isActive: data.isActive,
          allowVideo: data.allowVideo,
          settings: data.settings,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }
    } catch (err) {
      console.error('[AuthContext] Failed to load collection form:', err);
    }
  }, []);

  // Initialize workspace, project, and collection form for the user in Firestore
  const initUserTenancy = async (currentUser: AuthUser) => {
    if (!db) return;

    try {
      // 1. Fetch or create workspace
      const wsQuery = query(collection(db, 'workspaces'), where('ownerId', '==', currentUser.uid));
      const wsSnapshot = await getDocs(wsQuery);

      let currentWs: Workspace;
      let userIsNew = false;

      if (wsSnapshot.empty) {
        userIsNew = true;
        const userPrefix = (currentUser.email || 'user').split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        const defaultSlug = `${userPrefix}-ws-${currentUser.uid.substring(0, 6)}`;
        const wsRef = doc(collection(db, 'workspaces'));
        const now = new Date().toISOString();

        const wsData = {
          ownerId: currentUser.uid,
          name: `${userPrefix.toUpperCase()}'s Workspace`,
          slug: defaultSlug,
          plan: 'free' as PlanTier,
          testimonialCount: 0,
          projectCount: 0,
          seatCount: 1,
          createdAt: now,
          updatedAt: now,
        };

        await setDoc(wsRef, wsData);
        currentWs = {
          id: wsRef.id,
          ...wsData,
        };
      } else {
        const row = wsSnapshot.docs[0];
        const data = row.data();
        currentWs = {
          id: row.id,
          ownerId: data.ownerId,
          name: data.name,
          slug: data.slug,
          plan: data.plan,
          billingCycle: data.billingCycle,
          stripeCustomerId: data.stripeCustomerId,
          stripeSubscriptionId: data.stripeSubscriptionId,
          subscriptionStatus: data.subscriptionStatus,
          testimonialCount: data.testimonialCount,
          projectCount: data.projectCount,
          seatCount: data.seatCount,
          logoUrl: data.logoUrl,
          brandColor: data.brandColor,
          customDomain: data.customDomain,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }
      setWorkspace(currentWs);
      setIsNewUser(userIsNew);

      // 2. Fetch all projects for this workspace
      const projQuery = query(
        collection(db, 'projects'),
        where('ownerId', '==', currentUser.uid),
        where('workspaceId', '==', currentWs.id)
      );
      const projSnapshot = await getDocs(projQuery);

      let projects: Project[] = [];
      let currentProj: Project;

      if (projSnapshot.empty) {
        const projSlug = `${currentWs.slug}-project`;
        const projRef = doc(collection(db, 'projects'));
        const now = new Date().toISOString();

        const projData = {
          workspaceId: currentWs.id,
          ownerId: currentUser.uid,
          name: 'Main Product',
          slug: projSlug,
          websiteUrl: '',
          createdAt: now,
          updatedAt: now,
        };

        await setDoc(projRef, projData);
        currentProj = {
          id: projRef.id,
          ...projData,
        };
        projects = [currentProj];

        // Update workspace project count
        await updateDoc(doc(db, 'workspaces', currentWs.id), { projectCount: 1 });
      } else {
        projects = projSnapshot.docs.map(row => {
          const data = row.data();
          return {
            id: row.id,
            workspaceId: data.workspaceId,
            ownerId: data.ownerId,
            name: data.name,
            slug: data.slug,
            websiteUrl: data.websiteUrl,
            logoUrl: data.logoUrl,
            brandColor: data.brandColor,
            customDomain: data.customDomain,
            description: data.description,
            industry: data.industry,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });

        // Restore last active project from localStorage, or use first
        const lastActiveId = localStorage.getItem(`pandapraise_active_project_${currentUser.uid}`);
        currentProj = projects.find(p => p.id === lastActiveId) || projects[0];
      }

      setAllProjects(projects);
      setProject(currentProj);

      // 3. Load collection form for active project
      await loadCollectionForm(currentUser, currentProj);

    } catch (err: any) {
      console.error('[AuthContext] Failed to initialize tenant workspace/project in Firestore:', err);
      setAuthError(err.message || 'Failed to initialize tenant workspace');
    }
  };

  // ── Switch active project ─────────────────────────────────
  const setActiveProject = useCallback(async (newProject: Project) => {
    setProject(newProject);
    if (user) {
      localStorage.setItem(`pandapraise_active_project_${user.uid}`, newProject.id);
      await loadCollectionForm(user, newProject);
    }
  }, [user, loadCollectionForm]);

  // ── Create new project ────────────────────────────────────
  const createNewProject = useCallback(async (name: string, websiteUrl?: string): Promise<Project | null> => {
    if (!db || !user || !workspace) return null;
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const projRef = doc(collection(db, 'projects'));
      const now = new Date().toISOString();

      const projData = {
        workspaceId: workspace.id,
        ownerId: user.uid,
        name,
        slug: `${slug}-${projRef.id.substring(0, 4)}`,
        websiteUrl: websiteUrl || '',
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(projRef, projData);
      const newProject: Project = { id: projRef.id, ...projData };

      // Create a default collection form for the new project
      const formRef = doc(collection(db, 'collection_forms'));
      const cleanProjName = cleanBrandOrProductName(name);
      const formTitle = cleanProjName
        ? `Share your experience with ${cleanProjName}`
        : 'Share your experience';

      const formData = {
        projectId: newProject.id,
        ownerId: user.uid,
        publicSlug: `${projData.slug}-feedback`,
        title: formTitle,
        description: 'Your honest feedback helps us grow and serve you better.',
        isActive: true,
        allowVideo: true,
        settings: {},
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(formRef, formData);

      // Update workspace project count
      const newCount = allProjects.length + 1;
      await updateDoc(doc(db, 'workspaces', workspace.id), {
        projectCount: newCount,
        updatedAt: now,
      });
      setWorkspace(prev => prev ? { ...prev, projectCount: newCount } : prev);

      setAllProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err: any) {
      console.error('[AuthContext] Failed to create project:', err);
      setAuthError(err.message || 'Failed to create project');
      return null;
    }
  }, [user, workspace, allProjects]);

  // ── Update project details ────────────────────────────────
  const updateProjectDetails = useCallback(async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    if (!db) return null;
    try {
      const now = new Date().toISOString();
      const projRef = doc(db, 'projects', id);
      await updateDoc(projRef, { ...updates, updatedAt: now });

      setAllProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: now } : p));
      if (project?.id === id) {
        setProject(prev => prev ? { ...prev, ...updates, updatedAt: now } : prev);
      }

      return { ...allProjects.find(p => p.id === id)!, ...updates, updatedAt: now };
    } catch (err: any) {
      console.error('[AuthContext] Failed to update project:', err);
      return null;
    }
  }, [project, allProjects]);

  // ── Delete project ────────────────────────────────────────
  const deleteProjectById = useCallback(async (id: string): Promise<boolean> => {
    if (!db || !workspace || allProjects.length <= 1) return false;
    try {
      await deleteDoc(doc(db, 'projects', id));
      const remaining = allProjects.filter(p => p.id !== id);
      setAllProjects(remaining);

      // If we deleted the active project, switch to the first remaining
      if (project?.id === id && remaining.length > 0) {
        await setActiveProject(remaining[0]);
      }

      // Update workspace count
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'workspaces', workspace.id), {
        projectCount: remaining.length,
        updatedAt: now,
      });
      setWorkspace(prev => prev ? { ...prev, projectCount: remaining.length } : prev);

      return true;
    } catch (err: any) {
      console.error('[AuthContext] Failed to delete project:', err);
      return false;
    }
  }, [workspace, allProjects, project, setActiveProject]);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      if (isDemoMode) {
        setUser(DEMO_USER);
        setWorkspace(DEMO_WORKSPACE);
        setProject(DEMO_PROJECTS[0]);
        setAllProjects(DEMO_PROJECTS);
        setCollectionForm(DEMO_FORM);
      }
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const authUser: AuthUser = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        };
        setUser(authUser);
        await initUserTenancy(authUser);
      } else {
        setUser(null);
        setWorkspace(null);
        setProject(null);
        setAllProjects([]);
        setCollectionForm(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const signUp = async (email: string, password: string) => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: 'Firebase is not configured. Please set VITE_FIREBASE_* environment variables.',
      };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser: AuthUser = {
        id: userCredential.user.uid,
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      };
      setUser(authUser);
      await initUserTenancy(authUser);
      return { success: true };
    } catch (error: any) {
      const friendlyMessage = translateFirebaseError(error);
      setAuthError(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: 'Firebase is not configured. Please set VITE_FIREBASE_* environment variables.',
      };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser: AuthUser = {
        id: userCredential.user.uid,
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      };
      setUser(authUser);
      await initUserTenancy(authUser);
      return { success: true };
    } catch (error: any) {
      const friendlyMessage = translateFirebaseError(error);
      setAuthError(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: 'Firebase is not configured. Google Sign-In requires VITE_FIREBASE_* credentials.',
      };
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      const authUser: AuthUser = {
        id: userCredential.user.uid,
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      };
      setUser(authUser);
      await initUserTenancy(authUser);
      return { success: true };
    } catch (error: any) {
      const friendlyMessage = translateFirebaseError(error);
      setAuthError(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  const signOut = async () => {
    if (auth && isFirebaseConfigured) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setWorkspace(null);
    setProject(null);
    setAllProjects([]);
    setCollectionForm(null);
    disableDemoMode();
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: 'Firebase is not configured. Password recovery requires VITE_FIREBASE_* credentials.',
      };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      const friendlyMessage = translateFirebaseError(error);
      setAuthError(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  const enableDemoMode = () => {
    if (isFirebaseConfigured) {
      console.warn('[Security] Demo mode is disabled in production when Firebase is configured.');
      return;
    }
    localStorage.setItem('pandapraise_demo_mode', 'true');
    setIsDemoMode(true);
    setUser(DEMO_USER);
    setWorkspace(DEMO_WORKSPACE);
    setProject(DEMO_PROJECTS[0]);
    setAllProjects(DEMO_PROJECTS);
    setCollectionForm(DEMO_FORM);
  };


  const disableDemoMode = () => {
    localStorage.removeItem('pandapraise_demo_mode');
    setIsDemoMode(false);
    setUser(null);
    setWorkspace(null);
    setProject(null);
    setAllProjects([]);
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
        workspace,
        project,
        collectionForm,
        isLoading,
        isDemoMode,
        authError,
        setAuthError,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        enableDemoMode,
        disableDemoMode,
        refreshWorkspaceContext,
        // Multi-project support
        allProjects,
        setActiveProject,
        createNewProject,
        updateProjectDetails,
        deleteProjectById,
        isNewUser,
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

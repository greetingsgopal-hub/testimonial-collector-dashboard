import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { Workspace, Project, CollectionForm } from '../types';

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
    'auth/popup-closed-by-user':      'Sign-in was cancelled. Please try again.',
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
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  refreshWorkspaceContext: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: AuthUser = {
  id: 'demo-user-001',
  uid: 'demo-user-001',
  email: 'founder@demo.reviewvault.dev',
  displayName: 'Demo Founder',
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [collectionForm, setCollectionForm] = useState<CollectionForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('reviewvault_demo_mode') === 'true' && !isFirebaseConfigured;
  });
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize workspace, project, and collection form for the user in Firestore
  const initUserTenancy = async (currentUser: AuthUser) => {
    if (!db) return;

    try {
      // 1. Fetch or create workspace
      const wsQuery = query(collection(db, 'workspaces'), where('ownerId', '==', currentUser.uid));
      const wsSnapshot = await getDocs(wsQuery);

      let currentWs: Workspace;

      if (wsSnapshot.empty) {
        const userPrefix = (currentUser.email || 'user').split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        const defaultSlug = `${userPrefix}-ws-${currentUser.uid.substring(0, 6)}`;
        const wsRef = doc(collection(db, 'workspaces'));
        const now = new Date().toISOString();

        const wsData = {
          ownerId: currentUser.uid,
          name: `${userPrefix.toUpperCase()}'s Workspace`,
          slug: defaultSlug,
          plan: 'free' as const,
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
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }
      setWorkspace(currentWs);

      // 2. Fetch or create project
      const projQuery = query(collection(db, 'projects'), where('workspaceId', '==', currentWs.id));
      const projSnapshot = await getDocs(projQuery);

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
      } else {
        const row = projSnapshot.docs[0];
        const data = row.data();
        currentProj = {
          id: row.id,
          workspaceId: data.workspaceId,
          name: data.name,
          slug: data.slug,
          websiteUrl: data.websiteUrl,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }
      setProject(currentProj);

      // 3. Fetch or create collection form
      const formQuery = query(collection(db, 'collection_forms'), where('projectId', '==', currentProj.id));
      const formSnapshot = await getDocs(formQuery);

      if (formSnapshot.empty) {
        const formSlug = `${currentProj.slug}-feedback`;
        const formRef = doc(collection(db, 'collection_forms'));
        const now = new Date().toISOString();

        const formData = {
          projectId: currentProj.id,
          ownerId: currentUser.uid,
          publicSlug: formSlug,
          title: `Share your experience with ${currentProj.name}`,
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
          title: data.title,
          description: data.description,
          isActive: data.isActive,
          allowVideo: data.allowVideo,
          settings: data.settings,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }
    } catch (err: any) {
      console.error('[AuthContext] Failed to initialize tenant workspace/project in Firestore:', err);
      setAuthError(err.message || 'Failed to initialize tenant workspace');
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      if (isDemoMode) {
        setUser(DEMO_USER);
        setWorkspace(DEMO_WORKSPACE);
        setProject(DEMO_PROJECT);
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

  const signOut = async () => {
    if (auth && isFirebaseConfigured) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setWorkspace(null);
    setProject(null);
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

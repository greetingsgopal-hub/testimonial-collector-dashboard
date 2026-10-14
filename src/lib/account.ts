import { auth } from './firebase';

/**
 * Requests cascade account deletion under GDPR Article 17 Right to Erasure.
 * Purges workspaces, projects, collection forms, reviews, widgets,
 * cancels Stripe subscriptions, and deletes the Firebase Auth account.
 */
export async function requestAccountDeletion(): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User is not authenticated' };
    }

    const token = await currentUser.getIdToken();
    const res = await fetch('/api/account/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ confirmation: 'DELETE' }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to delete account.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Account] Deletion failed:', err);
    return { success: false, error: err.message || 'Network error requesting account deletion' };
  }
}

import React from 'react';
import SocialBroadcastHub, { SocialTestimonial } from '../SocialBroadcastHub';
import { Review } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

interface SocialPostViewProps {
  reviews?: Review[];
  onOpenAccountsModal?: () => void;
  workspaceId?: string;
  workspaceName?: string;
}

export const SocialPostView: React.FC<SocialPostViewProps> = ({
  reviews = [],
  workspaceId,
  workspaceName,
}) => {
  const { workspace, project } = useAuth();
  const effectiveWsId = workspaceId || workspace?.id || project?.id || 'papasystem';
  const effectiveWsName = workspaceName || workspace?.name || project?.name || 'PandaPraise';

  const initialTestimonials: SocialTestimonial[] = reviews
    .filter((r) => r.status === 'approved')
    .map((r) => ({
      id: r.id,
      authorName: r.name || (r as any).authorName || (r as any).author_name || 'Verified Customer',
      authorRole: (r as any).authorRole || (r as any).author_role || (r as any).role || 'Verified Buyer',
      content: r.content || (r as any).text || '',
      rating: Number(r.rating || 5),
      createdAt: r.createdAt || (r as any).created_at || new Date().toISOString(),
    }));

  const effectiveWsSlug =
    (workspace as any)?.slug ||
    (project as any)?.slug ||
    (effectiveWsName ? effectiveWsName.toLowerCase().replace(/[^a-z0-9]/g, '') : 'myprojectpotato');

  const effectiveWsWebsite =
    (workspace as any)?.website ||
    (workspace as any)?.url ||
    (project as any)?.website;

  return (
    <SocialBroadcastHub
      workspaceId={effectiveWsId}
      workspaceName={effectiveWsName}
      workspaceSlug={effectiveWsSlug}
      workspaceWebsite={effectiveWsWebsite}
      initialApprovedTestimonials={initialTestimonials}
    />
  );
};

export default SocialPostView;

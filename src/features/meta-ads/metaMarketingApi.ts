export interface MetaAdCampaignPayload {
  shopDomain: string;
  accessToken: string;
  adAccountId: string; // e.g., act_123456789
  pageId: string;      // Facebook Page ID linked to Instagram
  creativeTitle: string;
  primaryText: string;
  headline: string;
  imageUrl?: string;
  ctaType: string;     // e.g., SHOP_NOW, LEARN_MORE
  destinationUrl: string;
}

export interface MetaCampaignPublishResult {
  success: boolean;
  campaignId?: string;
  adSetId?: string;
  adId?: string;
  error?: string;
}

/**
 * Pushes a review-based ad creative directly to Meta Ads Manager via Graph API
 */
export async function publishAdToMetaManager(
  payload: MetaAdCampaignPayload
): Promise<MetaCampaignPublishResult> {
  const {
    accessToken,
    adAccountId,
    pageId,
    creativeTitle,
    primaryText,
    headline,
    imageUrl,
    ctaType,
    destinationUrl,
  } = payload;

  const apiVersion = 'v19.0';
  const accountIdClean = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

  try {
    // Step 1: Create an Ad Image Hash if image URL is provided
    let imageHash = '';
    if (imageUrl) {
      const imageRes = await fetch(`https://graph.facebook.com/${apiVersion}/${accountIdClean}/adimages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl }),
      });
      const imageData = await imageRes.json() as any;
      if (imageData.error) {
        throw new Error(`Meta Image Upload Error: ${imageData.error.message}`);
      }
      imageHash = imageData.images?.[Object.keys(imageData.images)[0]]?.hash;
    }

    // Step 2: Create Ad Creative (Page post formatting with testimonial quote)
    const creativeRes = await fetch(`https://graph.facebook.com/${apiVersion}/${accountIdClean}/adcreatives`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Review Ad - ${creativeTitle}`,
        object_story_spec: {
          page_id: pageId,
          link_data: {
            message: primaryText,
            link: destinationUrl,
            name: headline,
            call_to_action: {
              type: ctaType || 'SHOP_NOW',
              value: { link: destinationUrl },
            },
            ...(imageHash ? { image_hash: imageHash } : {}),
          },
        },
      }),
    });

    const creativeData = await creativeRes.json() as any;
    if (creativeData.error) {
      throw new Error(`Meta Ad Creative Error: ${creativeData.error.message}`);
    }

    return {
      success: true,
      adSetId: creativeData.id, // Reference to created creative object
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unknown Meta API failure',
    };
  }
}

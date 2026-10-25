export const PushToAdsButton = ({ video }: { video: any }) => {
  const push = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiUrl}/api/meta/push-creative`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({
        videoId: video._id || video.id || '665xxx',
        adAccountId: '123456',
        hookText: video.hooks?.[0] || 'The only saree you will ever need',
        videoUrl: video.ratios?.['9:16'] || 'https://s3.pandapraise.com/raw/video.mp4'
      })
    });
    const data = await res.json();
    alert(`Creative ${data.creativeId} pushed! adsLeft ${data.adsLeft}`);
  };
  return (
    <button
      onClick={push}
      className="h-9 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
    >
      Push to Meta Ads
    </button>
  );
};

export const UpiPayoutButton = ({ video }: { video: any }) => {
  const payout = async () => {
    const upi = prompt('Enter customer UPI (e.g. ananya@okaxis):');
    if (!upi) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiUrl}/api/payout/trigger-upi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({
        customerUpi: upi,
        amount: 200,
        videoId: video._id || video.id || '665xxx',
        orderId: video.orderId || video.order || 'KAL-2341'
      })
    });
    const data = await res.json();
    if (data.success) alert(`Payout ${data.payoutId} status ${data.status}`);
    else alert(data.error);
  };
  return (
    <button
      onClick={payout}
      className="h-9 px-4 bg-[#00BFA5] hover:bg-[#00a892] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
    >
      Pay ₹200 UPI
    </button>
  );
};

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { captureReferralCode } from '../lib/referral';

export const ReferralRedirectPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      captureReferralCode(`?ref=${code}`);
      navigate(`/?ref=${encodeURIComponent(code)}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/60 font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-[#6701e6] animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Applying your free month invitation...</span>
      </div>
    </div>
  );
};
export default ReferralRedirectPage;

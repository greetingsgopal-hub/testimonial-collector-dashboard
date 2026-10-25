export const permissions = {
  merchant_admin: ['read:inbox','write:approve','write:reward','read:ad-library','read:billing','write:billing','write:hooks'],
  agency_editor: ['read:inbox','write:hooks','read:ad-library'],
  super_admin: ['*'],
  auditor: ['read:inbox','read:ad-library','read:billing'],
};

export const can = (role, scope) => {
  if (!permissions[role]) return false;
  if (permissions[role].includes('*')) return true;
  return permissions[role].includes(scope);
};

export const checkPermission = (scope) => (req, res, next) => {
  if (can(req.user.role, scope)) return next();
  return res.status(403).json({ error: `Missing permission ${scope}` });
};

export const requireAdsLeft = async (req, res, next) => {
  const { Payment } = await import('../models/Payment.js');
  const store = req.effectiveStore || req.user.storeDomain;
  const active = await Payment.findOne({ shop: store, status: 'paid' }).sort({ createdAt: -1 });
  if (!active || active.adsLeft <= 0) {
    return res.status(402).json({ error: 'No ads left', code: 'NO_ADS_LEFT', shop: store });
  }
  req.activePayment = active;
  next();
};

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
  const store = req.effectiveStore || req.user?.storeDomain || 'kalyansilks.myshopify.com';
  let active;
  try {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState === 1) {
      const { Payment } = await import('../models/Payment.js');
      active = await Payment.findOne({ shop: store, status: 'paid' }).sort({ createdAt: -1 });
    }
  } catch {}

  if (!active) {
    const { memoryPayments } = await import('../routes/billing.js');
    active = memoryPayments.get(store);
    if (!active) {
      // Default active growth drop for testing if not yet paid
      active = {
        shop: store,
        drop: 'growth',
        amount: 2999,
        adsTotal: 20,
        adsUsed: 0,
        adsLeft: 20,
        status: 'paid',
        save: async function() { memoryPayments.set(store, this); return this; }
      };
      memoryPayments.set(store, active);
    }
  }

  if (!active || active.adsLeft <= 0) {
    return res.status(402).json({ error: 'No ads left', code: 'NO_ADS_LEFT', shop: store });
  }
  if (!active.save) {
    active.save = async function() { return this; };
  }
  req.activePayment = active;
  next();
};

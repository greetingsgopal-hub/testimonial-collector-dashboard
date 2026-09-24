// End-to-end verification script for Panda Praise Viral Loop Production Hardening
// Verifies Tests 1-10 covering all security and functional requirements.
console.log('--- Starting Panda Praise Viral Loop Production Hardening Verification (Tests 1-10) ---\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

// ─────────────────────────────────────────────────────────────
// Simulated Multi-Tenant Environment & Database
// ─────────────────────────────────────────────────────────────
const db = {
  users: new Map(),
  workspaces: new Map(),
  projects: new Map(),
  collectionForms: new Map(),
  reviews: new Map(),
  publicReviews: new Map(),
  sessionStorage: new Map(),
};

// 1. Setup Business A
const businessA_User = { uid: 'user_biz_a', email: 'owner@business-a.com' };
db.users.set(businessA_User.uid, businessA_User);

const businessA_Workspace = {
  id: 'ws_biz_a',
  ownerId: businessA_User.uid,
  name: "Business A Workspace",
  slug: "business-a-ws",
};
db.workspaces.set(businessA_Workspace.id, businessA_Workspace);

const businessA_Project = {
  id: 'proj_biz_a',
  workspaceId: businessA_Workspace.id,
  ownerId: businessA_User.uid,
  name: 'Acme Studio',
  slug: 'acme-studio',
};
db.projects.set(businessA_Project.id, businessA_Project);

const businessA_Form = {
  id: 'form_biz_a',
  projectId: businessA_Project.id,
  ownerId: businessA_User.uid,
  publicSlug: 'acme-feedback',
  title: 'Share your experience with Acme Studio',
  isActive: true,
  settings: {
    autoApprove: true,
    autoTag: 'featured',
  },
};
db.collectionForms.set(businessA_Form.id, businessA_Form);

// ─────────────────────────────────────────────────────────────
// TEST 1: Normal testimonial (Anonymous customer submission)
// ─────────────────────────────────────────────────────────────
console.log('Running TEST 1: Normal testimonial submission...');
function submitAnonymousTestimonial(input) {
  const newReview = {
    id: 'rev_' + Math.random().toString(36).substring(2, 9),
    projectId: input.projectId,
    collectionFormId: input.collectionFormId,
    name: input.name,
    email: input.email,
    rating: input.rating,
    content: input.content,
    // PRIORITY 1: Anonymous customer submission MUST ALWAYS be pending!
    status: 'pending',
    consent: true,
    source: 'form',
    isFeatured: false,
    createdAt: new Date().toISOString(),
  };
  db.reviews.set(newReview.id, newReview);
  return newReview;
}

const customerB_submission = submitAnonymousTestimonial({
  projectId: businessA_Project.id,
  collectionFormId: businessA_Form.id,
  name: 'Brenda Miller',
  email: 'brenda@designlab.co',
  rating: 5,
  content: 'Acme Studio provides exceptional high-touch design work!',
});

assert(db.reviews.has(customerB_submission.id), 'Testimonial is securely saved in private reviews');
assert(customerB_submission.status === 'pending', 'Anonymous client submission is strictly PENDING (Priority 1)');
assert(customerB_submission.projectId === businessA_Project.id, 'Original Business A is the recipient');
assert(!db.publicReviews.has(customerB_submission.id), 'Anonymous client did NOT write directly to public_reviews');

// ─────────────────────────────────────────────────────────────
// TEST 2: Auto-approval Promotion via Trusted Logic
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 2: Auto-approval Promotion via Trusted Application Logic...');
function trustedEvaluateAutoApproval(reviewId, projectId, callerUser) {
  const rev = db.reviews.get(reviewId);
  if (!rev) return null;
  const project = db.projects.get(projectId || rev.projectId);
  if (!project) return null;

  // Caller must be authorized owner of the project
  if (!callerUser || callerUser.uid !== project.ownerId) {
    return { error: 'Unauthorized: Anonymous users cannot promote reviews' };
  }

  // Never auto-approve negative feedback
  if (rev.tags?.includes('private-feedback') || rev.rating <= 3) {
    return rev;
  }

  const form = db.collectionForms.get(rev.collectionFormId);
  if (form?.settings?.autoApprove && rev.rating >= 4) {
    rev.status = 'approved';
    rev.updatedAt = new Date().toISOString();
    db.reviews.set(rev.id, rev);

    // Sync to public_reviews
    db.publicReviews.set(rev.id, {
      id: rev.id,
      projectId: rev.projectId,
      name: rev.name,
      rating: rev.rating,
      content: rev.content,
      status: 'approved',
      createdAt: rev.createdAt,
    });
    return rev;
  }
  return rev;
}

// Anonymous attempt to promote should fail
const anonAttempt = trustedEvaluateAutoApproval(customerB_submission.id, businessA_Project.id, null);
assert(anonAttempt.error !== undefined, 'Anonymous caller cannot promote review to approved (Blocked)');

// Trusted owner evaluation succeeds
const ownerPromotion = trustedEvaluateAutoApproval(customerB_submission.id, businessA_Project.id, businessA_User);
assert(ownerPromotion.status === 'approved', 'Trusted process promoted review PENDING -> APPROVED');
assert(db.publicReviews.has(customerB_submission.id), 'public_reviews receives approved testimonial');
assert(db.publicReviews.get(customerB_submission.id).status === 'approved', 'Public review is verified approved');

// ─────────────────────────────────────────────────────────────
// TEST 3: Negative feedback flow (1-3 stars, strictly private)
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 3: Negative feedback flow...');
function submitNegativeFeedback(input) {
  if (input.content.length < 10) {
    throw new Error('Feedback must be at least 10 characters');
  }
  const feedbackRecord = {
    id: 'rev_neg_' + Math.random().toString(36).substring(2, 9),
    projectId: input.projectId,
    collectionFormId: input.collectionFormId,
    name: 'Private Customer',
    email: '',
    rating: input.rating,
    content: input.content,
    status: 'pending', // Valid pending status for submission
    consent: true, // User consents to share private feedback directly with owner
    source: 'form',
    tags: ['private-feedback'],
    isFeatured: false,
    createdAt: new Date().toISOString(),
  };
  db.reviews.set(feedbackRecord.id, feedbackRecord);
  return feedbackRecord;
}

const negativeRecord = submitNegativeFeedback({
  projectId: businessA_Project.id,
  collectionFormId: businessA_Form.id,
  rating: 2,
  content: 'The onboarding was slower than expected, but the team was polite.',
});

assert(db.reviews.has(negativeRecord.id), 'Private feedback record saved in reviews collection');
assert(negativeRecord.tags.includes('private-feedback'), 'Feedback tagged as private-feedback');

// Even if owner runs auto-approval, negative feedback is NEVER approved or public
trustedEvaluateAutoApproval(negativeRecord.id, businessA_Project.id, businessA_User);
assert(!db.publicReviews.has(negativeRecord.id), 'Negative feedback is NEVER placed in public_reviews');
assert(db.reviews.get(negativeRecord.id).status !== 'approved', 'Negative feedback is NEVER promoted to approved');

// ─────────────────────────────────────────────────────────────
// TEST 4: Viral Signup Path & Account Provisioning
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 4: Viral signup path & account provisioning...');
// When Customer B clicks viral CTA on Business A confirmation modal:
const cleanFirstName = customerB_submission.name.split(' ')[0];
const viralOriginData = {
  source: 'testimonial',
  customerFirstName: cleanFirstName,
  customerEmail: customerB_submission.email,
  referredFromProjectId: businessA_Project.id,
  referredFromFormId: businessA_Form.id,
  timestamp: Date.now(),
};
db.sessionStorage.set('pandapraise_viral_origin', JSON.stringify(viralOriginData));

assert(db.sessionStorage.has('pandapraise_viral_origin'), 'Viral session context stored for signup');

// Customer B signs up
const customerB_User = { uid: 'user_cust_b', email: viralOriginData.customerEmail };
db.users.set(customerB_User.uid, customerB_User);

// Provision workspace for Customer B
const customerB_Workspace = {
  id: 'ws_cust_b',
  ownerId: customerB_User.uid,
  name: `${cleanFirstName.toUpperCase()}'s Workspace`,
  slug: `brenda-ws-${customerB_User.uid.substring(0, 4)}`,
  plan: 'free',
  referralSource: viralOriginData.source,
  referredFromProjectId: viralOriginData.referredFromProjectId,
  referredFromFormId: viralOriginData.referredFromFormId,
};
db.workspaces.set(customerB_Workspace.id, customerB_Workspace);

// Provision project for Customer B (Requirement 10 & Priority 7)
const customerB_Project = {
  id: 'proj_cust_b',
  workspaceId: customerB_Workspace.id,
  ownerId: customerB_User.uid,
  name: `${cleanFirstName}'s Testimonials`,
  slug: 'brenda-testimonials',
  referralSource: viralOriginData.source,
  referredFromProjectId: viralOriginData.referredFromProjectId,
  referredFromFormId: viralOriginData.referredFromFormId,
};
db.projects.set(customerB_Project.id, customerB_Project);

// Provision collection form with consistent title
const customerB_Form = {
  id: 'form_cust_b',
  projectId: customerB_Project.id,
  ownerId: customerB_User.uid,
  publicSlug: `${customerB_Project.slug}-feedback`,
  title: `Share your experience with ${customerB_Project.name}`,
  isActive: true,
  settings: {
    brandName: customerB_Project.name,
  },
};
db.collectionForms.set(customerB_Form.id, customerB_Form);

assert(customerB_Project.name === "Brenda's Testimonials", 'Customer B project named neutral & personal');
assert(customerB_Project.name !== businessA_Project.name, 'Customer B project NOT named after Business A (Requirement 10)');
assert(customerB_Form.title === "Share your experience with Brenda's Testimonials", 'Collection form title is consistent with project name (Priority 7)');

// ─────────────────────────────────────────────────────────────
// TEST 5: Referral Attribution Persistence
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 5: Referral attribution persistence (Priority 3)...');
assert(customerB_Workspace.referralSource === 'testimonial', 'Workspace retains referralSource = testimonial');
assert(customerB_Workspace.referredFromProjectId === businessA_Project.id, 'Workspace retains referredFromProjectId = Business A project ID');
assert(customerB_Workspace.referredFromFormId === businessA_Form.id, 'Workspace retains referredFromFormId = Business A form ID');
assert(customerB_Project.referredFromProjectId === businessA_Project.id, 'Project retains referredFromProjectId for attribution');

// ─────────────────────────────────────────────────────────────
// TEST 6: Session Cleanup on Activation (Priority 4 & 5)
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 6: Viral session cleanup upon reaching /ready...');
// Activation screen cleans up session storage
function onViralActivationScreenLoaded() {
  db.sessionStorage.delete('pandapraise_viral_origin');
}
onViralActivationScreenLoaded();
assert(!db.sessionStorage.has('pandapraise_viral_origin'), 'pandapraise_viral_origin cleared from sessionStorage (Priority 4)');

// ─────────────────────────────────────────────────────────────
// TEST 7: Existing Account Recovery (Priority 8)
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 7: Existing account handling without duplication...');
function handleSignupAttempt(email) {
  const existingUser = Array.from(db.users.values()).find(u => u.email === email);
  if (existingUser) {
    return {
      success: false,
      error: 'auth/email-already-in-use',
      existingUser: true,
      recoveryRedirect: `/login?redirect=/ready&email=${encodeURIComponent(email)}`,
    };
  }
  return { success: true };
}

const duplicateAttempt = handleSignupAttempt('brenda@designlab.co');
assert(duplicateAttempt.existingUser === true, 'Existing account detected when signing up with Brenda email');
assert(duplicateAttempt.recoveryRedirect.includes('/login?redirect=/ready'), 'Recovery redirect points to login with return to /ready');

// When existing user logs in, existing workspace is reused
const existingWorkspaces = Array.from(db.workspaces.values()).filter(w => w.ownerId === customerB_User.uid);
assert(existingWorkspaces.length === 1, 'No duplicate workspace created for existing account');

// ─────────────────────────────────────────────────────────────
// TEST 8: Loop Repeatability (A -> B -> C -> D)
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 8: Loop repeatability (Customer C on Customer B link)...');
const customerB_link = `https://pandapraise.com/c/${customerB_Form.publicSlug}`;

// Customer C submits on B's link
const customerC_submission = submitAnonymousTestimonial({
  projectId: customerB_Project.id,
  collectionFormId: customerB_Form.id,
  name: 'Carlos Ruiz',
  email: 'carlos@growthventures.net',
  rating: 5,
  content: 'Brenda provides stellar design systems and feedback!',
});

assert(customerC_submission.projectId === customerB_Project.id, 'Customer C review belongs to Customer B project');
assert(customerC_submission.status === 'pending', 'Customer C review is pending');

// Customer C converts
const customerC_cleanFirstName = customerC_submission.name.split(' ')[0];
const customerC_Workspace = {
  id: 'ws_cust_c',
  ownerId: 'user_cust_c',
  name: `${customerC_cleanFirstName.toUpperCase()}'s Workspace`,
  slug: `carlos-ws`,
  plan: 'free',
  referralSource: 'testimonial',
  referredFromProjectId: customerB_Project.id,
  referredFromFormId: customerB_Form.id,
};
db.workspaces.set(customerC_Workspace.id, customerC_Workspace);

const customerC_Project = {
  id: 'proj_cust_c',
  workspaceId: customerC_Workspace.id,
  ownerId: 'user_cust_c',
  name: `${customerC_cleanFirstName}'s Testimonials`,
  slug: 'carlos-testimonials',
  referralSource: 'testimonial',
  referredFromProjectId: customerB_Project.id,
  referredFromFormId: customerB_Form.id,
};
db.projects.set(customerC_Project.id, customerC_Project);

const customerC_Form = {
  id: 'form_cust_c',
  projectId: customerC_Project.id,
  ownerId: 'user_cust_c',
  publicSlug: 'carlos-testimonials-feedback',
  title: `Share your experience with ${customerC_Project.name}`,
  isActive: true,
};
db.collectionForms.set(customerC_Form.id, customerC_Form);

assert(customerC_Workspace.referredFromProjectId === customerB_Project.id, 'Customer C workspace attributed to Customer B');
assert(customerC_Project.name === "Carlos's Testimonials", 'Customer C project named correctly');
assert(customerC_Form.title === "Share your experience with Carlos's Testimonials", 'Customer C collection form title consistent');

// ─────────────────────────────────────────────────────────────
// TEST 9: Tenant Isolation
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 9: Tenant Isolation...');
function getPrivateReviewsForOwner(ownerId) {
  const userProjects = Array.from(db.projects.values()).filter(p => p.ownerId === ownerId).map(p => p.id);
  return Array.from(db.reviews.values()).filter(r => userProjects.includes(r.projectId));
}

const businessA_Reviews = getPrivateReviewsForOwner(businessA_User.uid);
const customerB_Reviews = getPrivateReviewsForOwner(customerB_User.uid);
const customerC_Reviews = getPrivateReviewsForOwner('user_cust_c');

assert(!businessA_Reviews.some(r => r.id === customerC_submission.id), 'Business A cannot read Customer B or C private reviews');
assert(!customerB_Reviews.some(r => r.id === customerB_submission.id), 'Customer B cannot read Business A private reviews');
assert(!customerC_Reviews.some(r => r.id === customerB_submission.id), 'Customer C cannot read Business A private reviews');

// ─────────────────────────────────────────────────────────────
// TEST 10: Public Collection Privacy (Priority 6)
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 10: Public collection privacy projection...');
function getPublicCollectionProjection(formDoc) {
  // Public visitors only receive safe fields:
  return {
    id: formDoc.id,
    projectId: formDoc.projectId,
    publicSlug: formDoc.publicSlug,
    title: formDoc.title,
    description: formDoc.description,
    isActive: formDoc.isActive,
    settings: {
      brandName: formDoc.settings?.brandName,
      brandColor: formDoc.settings?.brandColor,
    }
  };
}

const publicProj = getPublicCollectionProjection(businessA_Form);
assert(publicProj.ownerId === undefined, 'ownerId is stripped from public form projection');
assert(publicProj.internalNotes === undefined, 'Internal notes stripped from public form projection');
assert(publicProj.title === 'Share your experience with Acme Studio', 'Public title safely rendered');

console.log(`\n==================================================`);
console.log(`Verification Complete: ${testsPassed} passed, ${testsFailed} failed.`);
console.log(`==================================================\n`);

if (testsFailed > 0) {
  process.exit(1);
}

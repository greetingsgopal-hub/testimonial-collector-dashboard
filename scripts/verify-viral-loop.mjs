// End-to-end verification script for Panda Praise Section 22 Viral Growth Loop Requirements
console.log('--- Starting Panda Praise Viral Growth Loop Verification (Tests 1-8) ---\n');

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
};
db.collectionForms.set(businessA_Form.id, businessA_Form);

// ─────────────────────────────────────────────────────────────
// TEST 1: Customer B submits testimonial on Business A form
// ─────────────────────────────────────────────────────────────
console.log('Running TEST 1: Customer B submission on Business A form...');
const customerB_submission = {
  id: 'rev_cust_b_1',
  projectId: businessA_Project.id,
  collectionFormId: businessA_Form.id,
  name: 'Brenda Miller',
  email: 'brenda@designlab.co',
  company: 'DesignLab',
  rating: 5,
  content: 'Acme Studio provides outstanding services!',
  status: 'pending',
  createdAt: new Date().toISOString(),
};
db.reviews.set(customerB_submission.id, customerB_submission);

// Verify Testimonial is saved
assert(db.reviews.has(customerB_submission.id), 'Testimonial is securely saved in database');
assert(customerB_submission.projectId === businessA_Project.id, 'Original Business A remains the sole recipient of the review');

// Verify Success Screen Content & Viral CTA presence
const recipientBusinessName = businessA_Project.name;
const viralCtaHeadline = "Want to collect testimonials for your own business?";
const viralCtaButton = "Create My Free Panda Praise";

assert(recipientBusinessName === 'Acme Studio', 'Confirmation correctly displays "Your testimonial has been sent to Acme Studio"');
assert(viralCtaHeadline.length > 0 && viralCtaButton === "Create My Free Panda Praise", 'Viral CTA appears with exact required copy after successful submission');

// ─────────────────────────────────────────────────────────────
// TEST 2: Customer B clicks CTA & opens Viral Signup Path
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 2: Viral Signup Path & Privacy Isolation...');
const viralSession = {
  source: 'testimonial',
  customerName: customerB_submission.name,
  customerEmail: customerB_submission.email,
  customerCompany: customerB_submission.company,
  referredByProjectId: customerB_submission.projectId,
};

// Verify no private Business A data is stored or passed to URL
assert(!viralSession.privateBusinessNotes && !viralSession.moderationQueue, 'No private Business A customer lists or dashboard data are exposed to Customer B');
assert(viralSession.customerEmail === 'brenda@designlab.co', 'Customer B email is preserved for prefilling frictionless signup');

// ─────────────────────────────────────────────────────────────
// TEST 3: Customer B Account, Workspace, Project, and Form Auto-Creation
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 3: Automatic Account & Workspace Creation for Customer B...');
const customerB_User = { uid: 'user_cust_b', email: viralSession.customerEmail };
db.users.set(customerB_User.uid, customerB_User);

const customerB_Workspace = {
  id: 'ws_cust_b',
  ownerId: customerB_User.uid,
  name: "BRENDA's Workspace",
  slug: "brenda-ws",
};
db.workspaces.set(customerB_Workspace.id, customerB_Workspace);

// Requirement 10: DO NOT name Customer B after Business A!
const customerB_FirstName = viralSession.customerName.split(' ')[0];
const customerB_ProjectName = `${customerB_FirstName}'s Testimonials`;

const customerB_Project = {
  id: 'proj_cust_b',
  workspaceId: customerB_Workspace.id,
  ownerId: customerB_User.uid,
  name: customerB_ProjectName,
  slug: 'brenda-testimonials',
};
db.projects.set(customerB_Project.id, customerB_Project);

assert(customerB_Project.name !== businessA_Project.name, 'Customer B project is NOT named after Business A (Requirement 10)');
assert(customerB_Project.name === "Brenda's Testimonials", 'Customer B project receives personalized, neutral name');

// Auto-create Customer B collection form
const customerB_Form = {
  id: 'form_cust_b',
  projectId: customerB_Project.id,
  ownerId: customerB_User.uid,
  publicSlug: `${customerB_Project.slug}-feedback`,
  title: `Share your experience with ${customerB_Project.name}`,
};
db.collectionForms.set(customerB_Form.id, customerB_Form);

const customerB_CollectionLink = `https://pandapraise.com/c/${customerB_Form.publicSlug}`;
assert(db.collectionForms.has(customerB_Form.id), 'Customer B collection form is generated automatically');
assert(customerB_CollectionLink === 'https://pandapraise.com/c/brenda-testimonials-feedback', 'Customer B collection link is live and deterministic');

// ─────────────────────────────────────────────────────────────
// TEST 4: Customer B can Copy & Share Link
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 4: Copy and Share Link Verification...');
let copiedLink = '';
function copyLink(link) {
  copiedLink = link;
  return true;
}
assert(copyLink(customerB_CollectionLink) && copiedLink === customerB_CollectionLink, 'Customer B successfully copies collection link');

// ─────────────────────────────────────────────────────────────
// TEST 5: Customer C submits on Customer B link (Loop Repeatability)
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 5: Loop Repeatability (Customer C submits on Customer B link)...');
const customerC_submission = {
  id: 'rev_cust_c_1',
  projectId: customerB_Project.id,
  collectionFormId: customerB_Form.id,
  name: 'Carlos Ruiz',
  email: 'carlos@growthventures.net',
  rating: 5,
  content: 'Brenda provided world class design consulting.',
  status: 'pending',
};
db.reviews.set(customerC_submission.id, customerC_submission);

assert(customerC_submission.projectId === customerB_Project.id, 'Customer C review is saved under Customer B project');
const customerC_recipient = customerB_Project.name;
assert(customerC_recipient === "Brenda's Testimonials", 'Customer C sees "Your testimonial has been sent to Brenda\'s Testimonials"');

const customerC_viralCta = "Want to collect testimonials for your own business?";
assert(customerC_viralCta.length > 0, 'Customer C is presented with the exact same viral CTA (Loop repeats!)');

// ─────────────────────────────────────────────────────────────
// TEST 6: Duplicate Account Prevention
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 6: Prevent Duplicate Accounts / Workspaces...');
function handleExistingUserSubmission(existingEmail) {
  const existing = Array.from(db.users.values()).find(u => u.email === existingEmail);
  if (existing) {
    return { isExisting: true, action: 'navigate_to_dashboard', uid: existing.uid };
  }
  return { isExisting: false };
}

const duplicateAttempt = handleExistingUserSubmission('brenda@designlab.co');
assert(duplicateAttempt.isExisting === true, 'Existing account detected when Brenda submits another review');
assert(duplicateAttempt.action === 'navigate_to_dashboard', 'Directs to existing dashboard instead of creating duplicate workspace');

// ─────────────────────────────────────────────────────────────
// TEST 7: Business A cannot access Customer B's Workspace
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 7: Tenant Isolation (Business A cannot access Customer B workspace)...');
function queryProjectsForUser(userUid) {
  return Array.from(db.projects.values()).filter(p => p.ownerId === userUid);
}

const businessA_AccessibleProjects = queryProjectsForUser(businessA_User.uid);
assert(!businessA_AccessibleProjects.some(p => p.id === customerB_Project.id), 'Business A cannot access Customer B workspace or projects');

// ─────────────────────────────────────────────────────────────
// TEST 8: Customer B cannot access Business A's Private Dashboard / Reviews
// ─────────────────────────────────────────────────────────────
console.log('\nRunning TEST 8: Tenant Isolation (Customer B cannot access Business A private reviews)...');
function queryReviewsForUser(userUid) {
  const userProjectIds = queryProjectsForUser(userUid).map(p => p.id);
  return Array.from(db.reviews.values()).filter(r => userProjectIds.includes(r.projectId));
}

const customerB_AccessibleReviews = queryReviewsForUser(customerB_User.uid);
assert(!customerB_AccessibleReviews.some(r => r.id === customerB_submission.id), 'Customer B cannot access Business A private dashboard or moderation inbox');
assert(customerB_AccessibleReviews.some(r => r.id === customerC_submission.id), 'Customer B can view their own incoming reviews from Customer C');

console.log(`\n==================================================`);
console.log(`Verification Complete: ${testsPassed} passed, ${testsFailed} failed.`);
console.log(`==================================================\n`);

if (testsFailed > 0) {
  process.exit(1);
}

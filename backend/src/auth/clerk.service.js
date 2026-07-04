const { getAuth, clerkClient } = require('@clerk/express');

function getClerkAuthUserId(req) {
  const { userId } = getAuth(req);
  return userId;
}

async function getClerkUser(clerkUserId) {
  return clerkClient.users.getUser(clerkUserId);
}

function getPrimaryEmail(clerkUser) {
  const primaryId = clerkUser.primaryEmailAddressId;
  const primary = clerkUser.emailAddresses?.find((email) => email.id === primaryId);
  return primary?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || null;
}

function clerkUserHasPassword(clerkUser) {
  if (clerkUser?.passwordEnabled === false) return false;
  if (clerkUser?.password_enabled === false) return false;
  return true;
}

async function updateClerkPassword(clerkUserId, password) {
  return clerkClient.users.updateUser(clerkUserId, { password });
}

module.exports = {
  getClerkAuthUserId,
  getClerkUser,
  getPrimaryEmail,
  clerkUserHasPassword,
  updateClerkPassword,
};

const pool = require('../../config/database');
const { checkColumnExists, selectUserProfile, selectActiveMentor } = require('../../modules/users/users.queries');

async function getProfileSnippet(userId) {
  const hasCabin = await checkColumnExists('users', 'cabin');
  const hasAvailability = await checkColumnExists('users', 'availability');
  const row = await selectUserProfile(userId, { hasCabin, hasAvailability });
  if (!row) return null;
  if (!hasCabin) row.cabin = null;
  if (!hasAvailability) row.availability = null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    registration_number: row.registration_number,
    user_type: row.user_type,
  };
}

async function getMentorForMentee(menteeId) {
  const hasCabin = await checkColumnExists('users', 'cabin');
  const hasAvailability = await checkColumnExists('users', 'availability');
  const row = await selectActiveMentor(menteeId, { hasCabin, hasAvailability });
  if (!row) return null;
  if (!hasCabin) row.cabin = null;
  if (!hasAvailability) row.availability = null;
  return row;
}

module.exports = {
  checkColumnExists,
  selectUserProfile,
  selectActiveMentor,
  getProfileSnippet,
  getMentorForMentee,
};

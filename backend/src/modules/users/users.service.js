const queries = require('./users.queries');

async function getColumnFlags() {
  const hasCabin = await queries.checkColumnExists('users', 'cabin');
  const hasAvailability = await queries.checkColumnExists('users', 'availability');
  return { hasCabin, hasAvailability };
}

function ensureOptionalColumns(record, { hasCabin, hasAvailability }) {
  if (!hasCabin) record.cabin = null;
  if (!hasAvailability) record.availability = null;
  return record;
}

async function getProfile(userId) {
  const columnFlags = await getColumnFlags();
  const profile = await queries.selectUserProfile(userId, columnFlags);

  if (!profile) {
    return { status: 404, body: { message: 'User not found' } };
  }

  return { status: 200, body: ensureOptionalColumns(profile, columnFlags) };
}

async function updateProfile(userId, { phone, cabin, availability, bio }) {
  const columnFlags = await getColumnFlags();
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (phone !== undefined) {
    updates.push(`phone = $${paramCount++}`);
    values.push(phone);
  }
  if (cabin !== undefined && columnFlags.hasCabin) {
    updates.push(`cabin = $${paramCount++}`);
    values.push(cabin);
  } else if (cabin !== undefined && !columnFlags.hasCabin) {
    // Column doesn't exist, but user tried to update it
    // We could add the column here, but it's better to return an error or ignore
  }
  if (availability !== undefined && columnFlags.hasAvailability) {
    updates.push(`availability = $${paramCount++}`);
    values.push(availability);
  } else if (availability !== undefined && !columnFlags.hasAvailability) {
    // Column doesn't exist, skipping update
  }
  if (bio !== undefined) {
    updates.push(`bio = $${paramCount++}`);
    values.push(bio);
  }

  if (updates.length === 0) {
    return {
      status: 400,
      body: {
        message: 'No fields to update or columns do not exist. Please run the migration script to add cabin and availability columns.',
      },
    };
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const profile = await queries.updateUserProfile(
    userId,
    updates,
    values,
    paramCount,
    columnFlags
  );

  if (!profile) {
    return { status: 404, body: { message: 'User not found' } };
  }

  return { status: 200, body: ensureOptionalColumns(profile, columnFlags) };
}

async function getMyMentor(userId, userType) {
  if (userType !== 'mentee') {
    return { status: 403, body: { message: 'Access denied' } };
  }

  const columnFlags = await getColumnFlags();
  const mentor = await queries.selectActiveMentor(userId, columnFlags);

  if (!mentor) {
    return { status: 404, body: { message: 'No active mentor found' } };
  }

  return { status: 200, body: ensureOptionalColumns(mentor, columnFlags) };
}

async function getMentees(userId, userType) {
  if (userType !== 'mentor') {
    return { status: 403, body: { message: 'Access denied' } };
  }

  const mentees = await queries.selectMenteesByMentor(userId);
  return { status: 200, body: mentees };
}

module.exports = {
  getProfile,
  updateProfile,
  getMyMentor,
  getMentees,
};

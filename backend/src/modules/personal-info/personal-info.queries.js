const pool = require('../../config/database');

async function selectPersonalInfoByUserId(userId) {
  const query = `
    SELECT * FROM personal_information 
    WHERE user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

async function selectPersonalInfoIdByUserId(userId) {
  const query = 'SELECT id FROM personal_information WHERE user_id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows;
}

async function updatePersonalInfo(userId, fields) {
  const {
    section, roll_no, branch, blood_group, hostel_block, room_no, date_of_birth,
    has_muj_alumni, alumni_details,
    father_name, father_mobile, father_email, father_occupation, father_organization, father_designation,
    mother_name, mother_mobile, mother_email, mother_occupation, mother_organization, mother_designation,
    communication_address, communication_pincode, permanent_address, permanent_pincode,
    business_card_url,
  } = fields;

  const updateQuery = `
    UPDATE personal_information SET
      section = $2, roll_no = $3, branch = $4, blood_group = $5, hostel_block = $6, room_no = $7, date_of_birth = $8,
      has_muj_alumni = $9, alumni_details = $10,
      father_name = $11, father_mobile = $12, father_email = $13, father_occupation = $14, father_organization = $15, father_designation = $16,
      mother_name = $17, mother_mobile = $18, mother_email = $19, mother_occupation = $20, mother_organization = $21, mother_designation = $22,
      communication_address = $23, communication_pincode = $24, permanent_address = $25, permanent_pincode = $26,
      business_card_url = $27, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    RETURNING *
  `;

  const result = await pool.query(updateQuery, [
    userId, section, roll_no, branch, blood_group, hostel_block, room_no, date_of_birth,
    has_muj_alumni, alumni_details,
    father_name, father_mobile, father_email, father_occupation, father_organization, father_designation,
    mother_name, mother_mobile, mother_email, mother_occupation, mother_organization, mother_designation,
    communication_address, communication_pincode, permanent_address, permanent_pincode,
    business_card_url,
  ]);

  return result.rows[0];
}

async function insertPersonalInfo(userId, fields) {
  const {
    section, roll_no, branch, blood_group, hostel_block, room_no, date_of_birth,
    has_muj_alumni, alumni_details,
    father_name, father_mobile, father_email, father_occupation, father_organization, father_designation,
    mother_name, mother_mobile, mother_email, mother_occupation, mother_organization, mother_designation,
    communication_address, communication_pincode, permanent_address, permanent_pincode,
    business_card_url,
  } = fields;

  const insertQuery = `
    INSERT INTO personal_information (
      user_id, section, roll_no, branch, blood_group, hostel_block, room_no, date_of_birth,
      has_muj_alumni, alumni_details,
      father_name, father_mobile, father_email, father_occupation, father_organization, father_designation,
      mother_name, mother_mobile, mother_email, mother_occupation, mother_organization, mother_designation,
      communication_address, communication_pincode, permanent_address, permanent_pincode,
      business_card_url
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
    ) RETURNING *
  `;

  const result = await pool.query(insertQuery, [
    userId, section, roll_no, branch, blood_group, hostel_block, room_no, date_of_birth,
    has_muj_alumni, alumni_details,
    father_name, father_mobile, father_email, father_occupation, father_organization, father_designation,
    mother_name, mother_mobile, mother_email, mother_occupation, mother_organization, mother_designation,
    communication_address, communication_pincode, permanent_address, permanent_pincode,
    business_card_url,
  ]);

  return result.rows[0];
}

async function updateUserPhoneEmail(userId, phone, email) {
  const updateUsersQuery = 'UPDATE users SET phone = $1, email = $2 WHERE id = $3';
  await pool.query(updateUsersQuery, [phone || null, email || null, userId]);
}

async function selectMenteeUserById(menteeId) {
  const userQuery = `
    SELECT id, name, email, registration_number, department, phone, bio, profile_image_url, created_at
    FROM users WHERE id = $1 AND user_type = 'mentee'
  `;
  const result = await pool.query(userQuery, [menteeId]);
  return result.rows[0] || null;
}

async function selectMenteesForExport(mentorId) {
  const query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.registration_number,
      u.department,
      u.phone,
      pi.section,
      pi.roll_no,
      pi.branch,
      pi.blood_group,
      pi.hostel_block,
      pi.room_no,
      pi.date_of_birth,
      pi.has_muj_alumni,
      pi.alumni_details,
      pi.father_name,
      pi.father_mobile,
      pi.father_email,
      pi.father_occupation,
      pi.father_organization,
      pi.father_designation,
      pi.mother_name,
      pi.mother_mobile,
      pi.mother_email,
      pi.mother_occupation,
      pi.mother_organization,
      pi.mother_designation,
      pi.communication_address,
      pi.communication_pincode,
      pi.permanent_address,
      pi.permanent_pincode,
      pi.business_card_url
    FROM users u
    JOIN mentorship_relationships mr ON u.id = mr.mentee_id
    LEFT JOIN personal_information pi ON u.id = pi.user_id
    WHERE mr.mentor_id = $1 AND u.is_active = true AND mr.status = 'active'
    ORDER BY u.name
  `;

  const result = await pool.query(query, [mentorId]);
  return result.rows;
}

async function selectActiveMentorship(mentorId, menteeId) {
  const relationshipQuery = `
    SELECT id FROM mentorship_relationships 
    WHERE mentor_id = $1 AND mentee_id = $2 AND status = 'active'
  `;
  const result = await pool.query(relationshipQuery, [mentorId, menteeId]);
  return result.rows;
}

module.exports = {
  selectPersonalInfoByUserId,
  selectPersonalInfoIdByUserId,
  updatePersonalInfo,
  insertPersonalInfo,
  updateUserPhoneEmail,
  selectMenteeUserById,
  selectMenteesForExport,
  selectActiveMentorship,
};

const PDFDocument = require('pdfkit');
const queries = require('./personal-info.queries');

async function getPersonalInfo(userId) {
  const rows = await queries.selectPersonalInfoByUserId(userId);

  if (rows.length === 0) {
    return { status: 200, body: { message: 'No personal information found' } };
  }

  return { status: 200, body: rows[0] };
}

async function savePersonalInfo(userId, data) {
  const {
    section, roll_no, branch, blood_group, hostel_block, room_no, date_of_birth,
    has_muj_alumni, alumni_details,
    father_name, father_mobile, father_email, father_occupation, father_organization, father_designation,
    mother_name, mother_mobile, mother_email, mother_occupation, mother_organization, mother_designation,
    communication_address, communication_pincode, permanent_address, permanent_pincode,
    business_card_url, phone, email,
  } = data;

  const fields = {
    section, roll_no, branch, blood_group, hostel_block, room_no, date_of_birth,
    has_muj_alumni, alumni_details,
    father_name, father_mobile, father_email, father_occupation, father_organization, father_designation,
    mother_name, mother_mobile, mother_email, mother_occupation, mother_organization, mother_designation,
    communication_address, communication_pincode, permanent_address, permanent_pincode,
    business_card_url,
  };

  const existingRows = await queries.selectPersonalInfoIdByUserId(userId);

  if (existingRows.length > 0) {
    const updated = await queries.updatePersonalInfo(userId, fields);

    if (phone !== undefined || email !== undefined) {
      await queries.updateUserPhoneEmail(userId, phone, email);
    }

    return {
      status: 200,
      body: {
        message: 'Personal information updated successfully',
        data: updated,
      },
    };
  }

  const inserted = await queries.insertPersonalInfo(userId, fields);

  if (phone !== undefined || email !== undefined) {
    await queries.updateUserPhoneEmail(userId, phone, email);
  }

  return {
    status: 201,
    body: {
      message: 'Personal information saved successfully',
      data: inserted,
    },
  };
}

async function getMenteeProfile(userType, menteeId) {
  if (userType !== 'mentor') {
    return { status: 403, body: { message: 'Access denied' } };
  }

  const mentee = await queries.selectMenteeUserById(menteeId);

  if (!mentee) {
    return { status: 404, body: { message: 'Mentee not found' } };
  }

  const personalInfoRows = await queries.selectPersonalInfoByUserId(menteeId);

  return {
    status: 200,
    body: {
      ...mentee,
      personal_info: personalInfoRows[0] || null,
    },
  };
}

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function buildMenteesCsv(mentees) {
  const headers = [
    'ID',
    'Name',
    'Email',
    'Registration Number',
    'Department',
    'Phone',
    'Section',
    'Roll No',
    'Branch',
    'Blood Group',
    'Hostel Block',
    'Room No',
    'Date of Birth',
    'Has MUJ Alumni',
    'Alumni Details',
    'Father Name',
    'Father Mobile',
    'Father Email',
    'Father Occupation',
    'Father Organization',
    'Father Designation',
    'Mother Name',
    'Mother Mobile',
    'Mother Email',
    'Mother Occupation',
    'Mother Organization',
    'Mother Designation',
    'Communication Address',
    'Communication Pincode',
    'Permanent Address',
    'Permanent Pincode',
    'Business Card URL',
  ];

  let csvContent = headers.join(',') + '\n';

  mentees.forEach((mentee) => {
    const row = [
      escapeCSV(mentee.id),
      escapeCSV(mentee.name),
      escapeCSV(mentee.email),
      escapeCSV(mentee.registration_number),
      escapeCSV(mentee.department),
      escapeCSV(mentee.phone),
      escapeCSV(mentee.section),
      escapeCSV(mentee.roll_no),
      escapeCSV(mentee.branch),
      escapeCSV(mentee.blood_group),
      escapeCSV(mentee.hostel_block),
      escapeCSV(mentee.room_no),
      escapeCSV(mentee.date_of_birth),
      escapeCSV(mentee.has_muj_alumni ? 'Yes' : 'No'),
      escapeCSV(mentee.alumni_details),
      escapeCSV(mentee.father_name),
      escapeCSV(mentee.father_mobile),
      escapeCSV(mentee.father_email),
      escapeCSV(mentee.father_occupation),
      escapeCSV(mentee.father_organization),
      escapeCSV(mentee.father_designation),
      escapeCSV(mentee.mother_name),
      escapeCSV(mentee.mother_mobile),
      escapeCSV(mentee.mother_email),
      escapeCSV(mentee.mother_occupation),
      escapeCSV(mentee.mother_organization),
      escapeCSV(mentee.mother_designation),
      escapeCSV(mentee.communication_address),
      escapeCSV(mentee.communication_pincode),
      escapeCSV(mentee.permanent_address),
      escapeCSV(mentee.permanent_pincode),
      escapeCSV(mentee.business_card_url),
    ];
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
}

async function exportMenteesCsv(userType, mentorId) {
  if (userType !== 'mentor') {
    return { status: 403, body: { message: 'Access denied' } };
  }

  const mentees = await queries.selectMenteesForExport(mentorId);
  const csvContent = buildMenteesCsv(mentees);
  const filename = `mentees_personal_info_${new Date().toISOString().split('T')[0]}.csv`;

  return {
    status: 200,
    isFile: true,
    contentType: 'text/csv',
    contentDisposition: `attachment; filename="${filename}"`,
    body: csvContent,
  };
}

function addSection(doc, title, data, startY) {
  if (startY > doc.page.height - 150) {
    doc.addPage();
    startY = 50;
  }

  doc.fontSize(14).font('Helvetica-Bold').text(title, 50, startY, { underline: true });
  let y = startY + 25;

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 50;
      }

      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);

      doc.fontSize(10)
        .font('Helvetica-Bold')
        .text(`${label}:`, 60, y);
      doc.font('Helvetica')
        .text(displayValue, 200, y, { width: 300 });
      y += 20;
    }
  });

  return y + 10;
}

function generateMenteePdf(mentee, personalInfo, res) {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `mentee_personal_info_${mentee.registration_number}_${new Date().toISOString().split('T')[0]}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(20).font('Helvetica-Bold').text('MENTEE PERSONAL INFORMATION', 50, 50, { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80, { align: 'center' });

  let y = 120;

  doc.fontSize(16).font('Helvetica-Bold').text('BASIC INFORMATION', 50, y, { underline: true });
  y += 25;

  const basicInfo = {
    'Name': mentee.name,
    'Registration Number': mentee.registration_number,
    'Email': mentee.email,
    'Phone': mentee.phone || 'Not provided',
    'Department': mentee.department,
  };

  Object.entries(basicInfo).forEach(([key, value]) => {
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .text(`${key}:`, 60, y);
    doc.font('Helvetica')
      .text(value || 'Not provided', 200, y, { width: 300 });
    y += 20;
  });

  y += 10;

  if (personalInfo) {
    y = addSection(doc, 'ACADEMIC INFORMATION', {
      'Section': personalInfo.section,
      'Roll Number': personalInfo.roll_no,
      'Branch': personalInfo.branch,
      'Blood Group': personalInfo.blood_group,
      'Date of Birth': personalInfo.date_of_birth ? new Date(personalInfo.date_of_birth).toLocaleDateString() : null,
      'Hostel Block': personalInfo.hostel_block,
      'Room Number': personalInfo.room_no,
    }, y);

    if (personalInfo.has_muj_alumni) {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
      doc.fontSize(14).font('Helvetica-Bold').text('MUJ ALUMNI INFORMATION', 50, y, { underline: true });
      y += 25;
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('Alumni Details:', 60, y);
      doc.font('Helvetica')
        .text(personalInfo.alumni_details || 'Not provided', 200, y, { width: 300 });
      y += 40;
    }

    y = addSection(doc, 'FATHER\'S INFORMATION', {
      'Name': personalInfo.father_name,
      'Mobile': personalInfo.father_mobile,
      'Email': personalInfo.father_email,
      'Occupation': personalInfo.father_occupation,
      'Organization': personalInfo.father_organization,
      'Designation': personalInfo.father_designation,
    }, y);

    y = addSection(doc, 'MOTHER\'S INFORMATION', {
      'Name': personalInfo.mother_name,
      'Mobile': personalInfo.mother_mobile,
      'Email': personalInfo.mother_email,
      'Occupation': personalInfo.mother_occupation,
      'Organization': personalInfo.mother_organization,
      'Designation': personalInfo.mother_designation,
    }, y);

    if (y > doc.page.height - 150) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(14).font('Helvetica-Bold').text('ADDRESS INFORMATION', 50, y, { underline: true });
    y += 25;

    doc.fontSize(12).font('Helvetica-Bold').text('Communication Address:', 60, y);
    y += 20;
    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 50;
      doc.fontSize(12).font('Helvetica-Bold').text('Communication Address:', 60, y);
      y += 20;
    }
    doc.fontSize(10).font('Helvetica').text(personalInfo.communication_address || 'Not provided', 60, y, { width: 450 });
    const commAddrLines = Math.max(1, Math.ceil((personalInfo.communication_address || 'Not provided').length / 60));
    y += (commAddrLines * 15) + 10;

    if (y > doc.page.height - 50) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(10).font('Helvetica-Bold').text('Pin Code:', 60, y);
    doc.font('Helvetica').text(personalInfo.communication_pincode || 'Not provided', 200, y);
    y += 30;

    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(12).font('Helvetica-Bold').text('Permanent Address:', 60, y);
    y += 20;
    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 50;
      doc.fontSize(12).font('Helvetica-Bold').text('Permanent Address:', 60, y);
      y += 20;
    }
    doc.fontSize(10).font('Helvetica').text(personalInfo.permanent_address || 'Not provided', 60, y, { width: 450 });
    const permAddrLines = Math.max(1, Math.ceil((personalInfo.permanent_address || 'Not provided').length / 60));
    y += (permAddrLines * 15) + 10;

    if (y > doc.page.height - 50) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(10).font('Helvetica-Bold').text('Pin Code:', 60, y);
    doc.font('Helvetica').text(personalInfo.permanent_pincode || 'Not provided', 200, y);
    y += 30;
  } else {
    doc.fontSize(12).font('Helvetica').text('No personal information available for this mentee.', 60, y);
  }

  const pageHeight = doc.page.height;
  doc.fontSize(8)
    .font('Helvetica')
    .text(`This document was generated on ${new Date().toLocaleString()}`, 50, pageHeight - 50, { align: 'center' });

  doc.end();
}

async function exportMenteePdf(userType, mentorId, menteeId, res) {
  if (userType !== 'mentor') {
    return { status: 403, body: { message: 'Access denied' } };
  }

  const mentee = await queries.selectMenteeUserById(menteeId);

  if (!mentee) {
    return { status: 404, body: { message: 'Mentee not found' } };
  }

  const personalInfoRows = await queries.selectPersonalInfoByUserId(menteeId);
  const personalInfo = personalInfoRows[0];

  const relationshipRows = await queries.selectActiveMentorship(mentorId, menteeId);

  if (relationshipRows.length === 0) {
    return { status: 403, body: { message: 'Access denied. This mentee is not assigned to you.' } };
  }

  generateMenteePdf(mentee, personalInfo, res);
  return { status: 200, isFile: true };
}

module.exports = {
  getPersonalInfo,
  savePersonalInfo,
  getMenteeProfile,
  exportMenteesCsv,
  exportMenteePdf,
};

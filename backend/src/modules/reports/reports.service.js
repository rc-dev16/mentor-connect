const queries = require('./reports.queries');

async function getReports(mentorId, userType) {
  if (userType !== 'mentor') {
    return { status: 403, body: { message: 'Access denied' } };
  }

  const reports = await queries.getReportsByMentorId(mentorId);
  return { status: 200, body: reports };
}

module.exports = {
  getReports,
};

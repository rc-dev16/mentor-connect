// @ts-check
const queries = require('./reports.queries');

/**
 * @typedef {import('@shared/contracts/common').ApiMessage} ApiMessage
 * @typedef {import('@shared/contracts/common').UserType} UserType
 * @typedef {import('@shared/contracts/reports').Report} Report
 */

/**
 * @param {string} mentorId
 * @param {UserType} userType
 * @returns {Promise<import('@shared/contracts/common').ApiResult<Report[] | ApiMessage>>}
 */
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

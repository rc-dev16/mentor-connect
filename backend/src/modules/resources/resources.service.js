const multer = require('multer');
const path = require('path');
const fs = require('fs');
const queries = require('./resources.queries');

const UPLOAD_DIR = path.join(__dirname, '../../../uploads/resources');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents (.pdf, .doc, .docx) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

function getFilePath(filename) {
  return path.join(UPLOAD_DIR, filename);
}

function deleteUploadedFile(filename) {
  const filePath = getFilePath(filename);
  fs.unlink(filePath, (err) => {
    if (err) console.error('Error deleting file:', err);
  });
}

function getContentTypeForFilename(filename) {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return contentTypes[ext] || null;
}

async function getResources(userId) {
  const userType = await queries.selectUserType(userId);

  if (userType === 'mentor') {
    return queries.selectResourcesByUploader(userId);
  }

  const mentorId = await queries.selectActiveMentorIdForMentee(userId);

  if (mentorId) {
    return queries.selectResourcesByUploader(mentorId);
  }

  return queries.selectNoResources();
}

async function createResource(userId, body, file) {
  const { title, description, resource_type, is_public } = body;

  if (!title) {
    return { status: 400, body: { message: 'Title is required' } };
  }

  let finalResourceType = resource_type || 'link';
  let fileUrl = null;
  let fileSize = null;
  let mimeType = null;

  if (file) {
    finalResourceType = 'file';
    fileUrl = `/api/resources/files/${file.filename}`;
    fileSize = file.size;
    mimeType = file.mimetype;
  } else if (body.url) {
    finalResourceType = 'link';
    fileUrl = body.url;
  } else {
    return { status: 400, body: { message: 'Either a file or URL is required' } };
  }

  const newResource = await queries.insertResource({
    title,
    description: description || null,
    resourceType: finalResourceType,
    fileUrl,
    fileSize,
    mimeType,
    uploadedBy: userId,
    isPublic: is_public === 'true' || is_public === true,
  });

  try {
    const mentees = await queries.selectMenteeIdsByMentor(userId);

    if (mentees.length > 0) {
      const resourceTypeText = finalResourceType === 'file' ? 'a file' : 'a link';
      const notificationTitle = 'New Resource Available';
      const notificationMessage = `Your mentor has added ${resourceTypeText}: "${title}"${description ? ` - ${description}` : ''}`;

      for (const row of mentees) {
        await queries.insertResourceNotification({
          userId: row.mentee_id,
          title: notificationTitle,
          message: notificationMessage,
          relatedEntityId: newResource.id,
        });
      }
    }
  } catch (notifError) {
    console.error('Error creating notifications:', notifError);
  }

  return {
    status: 201,
    body: {
      message: 'Resource created successfully',
      resource: newResource,
    },
  };
}

function getFileForServing(filename) {
  const filePath = getFilePath(filename);

  if (!fs.existsSync(filePath)) {
    return { status: 404, body: { message: 'File not found' } };
  }

  return {
    status: 200,
    filePath: path.resolve(filePath),
    contentType: getContentTypeForFilename(filename),
    filename,
  };
}

module.exports = {
  upload,
  getResources,
  createResource,
  getFileForServing,
  deleteUploadedFile,
};

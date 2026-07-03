const express = require('express');
const authenticateRequest = require('../../auth/auth.middleware');
const {
  upload,
  getResources,
  createResource,
  getFileForServing,
  deleteUploadedFile,
} = require('./resources.service');

const router = express.Router();

router.use(authenticateRequest);

router.get('/', async (req, res) => {
  try {
    const resources = await getResources(req.user.userId);
    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const result = await createResource(req.user.userId, req.body, req.file);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Create resource error:', error);
    if (req.file) {
      deleteUploadedFile(req.file.filename);
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/files/:filename', (req, res) => {
  try {
    const result = getFileForServing(req.params.filename);

    if (result.status === 404) {
      return res.status(404).json(result.body);
    }

    res.setHeader('Content-Disposition', `inline; filename="${result.filename}"`);

    if (result.contentType) {
      res.setHeader('Content-Type', result.contentType);
    }

    res.sendFile(result.filePath);
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

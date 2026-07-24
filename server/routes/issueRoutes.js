const express = require('express');
const router = express.Router();

const {
    getAllIssues,
    createIssue,
    getMyIssues,
    getIssueById,
    updateIssue,
    toggleUpvote,
    updateStatus,
    deleteIssue,
} = require('../controllers/issueController');

const { protect, adminOnly } = require('../middleware/authMiddleware')
const upload = require('../config/cloudinary');

router.get('/', getAllIssues);
router.get('/my', protect, getMyIssues);
router.get('/:id', getIssueById);
router.post('/', protect, upload.single('photo'), createIssue);
router.put('/:id', protect, upload.single('photo'), updateIssue);
router.put('/:id/upvote', protect, toggleUpvote);
router.put('/:id/status', protect, adminOnly, updateStatus);
router.delete('/:id', protect, deleteIssue);

module.exports = router;
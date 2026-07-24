const Issue = require('../models/Issue');
const { getIO } = require('../config/socket');
//ISSUES
// POST   /api/issues                    → protected, citizen
// GET    /api/issues                    → public, supports ?category=&status=
// GET    /api/issues/my                 → protected, citizen (their own)
// GET    /api/issues/:id                → public
// PUT    /api/issues/:id                → protected, author only
// PUT    /api/issues/:id/upvote         → protected, any logged in user
// PUT    /api/issues/:id/status         → protected, admin only
// DELETE /api/issues/:id                → protected, author or admin


//GET    /api/issues 
const getAllIssues = async (req, res) => {

    try {

        const { category, status } = req.query;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const filter = {};

        if (category) filter.category = category;
        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (status && validStatuses.includes(status)) filter.status = status;

        const issues = await Issue.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Issue.countDocuments(filter);


        res.json({
            issues,
            page,
            totalPages: Math.ceil(total / limit),
            total,

        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

//POST   /api/issues
const createIssue = async (req, res) => {
    try {
        const { title, description, location, category, } = req.body;

        const issue = await Issue.create({
            title,
            description,
            location: JSON.parse(location),
            category,
            photo: req.file ? req.file.path : '',
            author: req.user._id,
        });
        await issue.populate('author', 'name email');

        const io = getIO();
        io.to('admins').emit('new-issue', issue);

        res.status(201).json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//GET    /api/issues/:id 

const getIssueById = async (req, res) => {
    try {
        const post = await Issue.findById(req.params.id)
            .populate('author', 'name email')


        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post)
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
};

//GET  /api/issuse/my

const getMyIssues = async (req, res) => {
    try {
        const ownIssues = await Issue.find({
            author: req.user._id
        });

        res.status(200).json({
            count: ownIssues.length,
            data: ownIssues
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

//PUT  /api/issues/:id 
const updateIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
        if (!issue) {
            return res.status(404).json({ message: 'issue not found' })
        }
        if (issue.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Unauthorized!'
            })
        }
        issue.title = req.body.title || issue.title;
        issue.description = req.body.description || issue.description;
        if (req.body.location !== undefined) {
            issue.location =
                typeof req.body.location === "string"
                    ? JSON.parse(req.body.location)
                    : req.body.location;
        }
        issue.category = req.body.category || issue.category;
        if (req.file) {
            issue.photo = req.file.path;
        }

        const updatedPost = await issue.save();
        res.json(updatedPost)


    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


//  PUT    /api/issues/:id/upvote

const toggleUpvote = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found!' })
        }

        const hasUpvoted = issue.upvotes.some(
            id => id.equals(req.user._id)
        );

        if (hasUpvoted) {
            await Issue.findByIdAndUpdate(
                req.params.id,
                { $pull: { upvotes: req.user._id } }
            );
        } else {
            await Issue.findByIdAndUpdate(
                req.params.id,
                { $addToSet: { upvotes: req.user._id } }
            );
        }
        const updatedIssue = await Issue.findById(req.params.id);
        res.json({
            upvotes: updatedIssue.upvotes.length,
            upvoted: !hasUpvoted,
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}


// PUT    /api/issues/:id/status
const updateStatus = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found!' });
        }

        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        issue.status = req.body.status || issue.status;

        const updated = await issue.save();

        const io = getIO();
        io.to(`user-${issue.author}`).emit('issue-status-updated', {
            issueId: issue._id,
            status: issue.status,
        });
        
        res.json(updated)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}


// DELETE /api/issues/:id 

const deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                message: 'Issue not found!'
            });
        }

        if (
            issue.author.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message: 'Not authorized to delete this issue!'
            });
        }

        await issue.deleteOne();

        res.json({
            message: 'Issue deleted'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    getAllIssues,
    createIssue,
    getMyIssues,
    getIssueById,
    updateIssue,
    toggleUpvote,
    updateStatus,
    deleteIssue,
};
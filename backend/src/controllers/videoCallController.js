const crypto = require('node:crypto');
const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const VideoCallRequest = require('../models/VideoCallRequest');

const populateRequest = (query) => query
  .populate({ path: 'beneficiaryId', populate: { path: 'userId', select: 'name email phone' } })
  .populate('acceptedBy', 'name role')
  .populate('declinedBy', 'name role');

const createVideoCallRequest = async (req, res, next) => {
  try {
    const profile = await BeneficiaryProfile.findOne({ userId: req.user._id }).select('_id');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Complete your beneficiary profile before requesting a call.' });
    }

    const activeRequest = await VideoCallRequest.findOne({
      requesterId: req.user._id,
      status: { $in: ['PENDING', 'ACCEPTED'] },
    }).sort({ createdAt: -1 });
    if (activeRequest) {
      return res.status(200).json({ success: true, data: activeRequest, alreadyRequested: true });
    }

    const topic = String(req.body.topic || '').trim();
    if (topic.length > 500) {
      return res.status(400).json({ success: false, message: 'Call request details must be 500 characters or fewer.' });
    }

    const callRequest = await VideoCallRequest.create({
      beneficiaryId: profile._id,
      requesterId: req.user._id,
      topic,
    });
    return res.status(201).json({ success: true, data: callRequest });
  } catch (error) {
    return next(error);
  }
};

const getMyVideoCallRequest = async (req, res, next) => {
  try {
    const callRequest = await populateRequest(VideoCallRequest.findOne({
      requesterId: req.user._id,
    }).sort({ createdAt: -1 }));
    return res.status(200).json({ success: true, data: callRequest });
  } catch (error) {
    return next(error);
  }
};

const getPendingVideoCallRequests = async (req, res, next) => {
  try {
    const callRequests = await populateRequest(VideoCallRequest.find({ status: 'PENDING' }).sort({ createdAt: 1 }));
    return res.status(200).json({ success: true, data: callRequests });
  } catch (error) {
    return next(error);
  }
};

const getVideoCallRequest = async (req, res, next) => {
  try {
    const callRequest = await populateRequest(VideoCallRequest.findById(req.params.id));
    if (!callRequest) return res.status(404).json({ success: false, message: 'Video call request not found.' });

    const isStaff = ['OFFICER', 'ADMIN'].includes(req.user.role);
    if (!isStaff && String(callRequest.requesterId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You cannot access this video call request.' });
    }
    if (callRequest.status !== 'ACCEPTED' || !callRequest.roomName) {
      return res.status(409).json({ success: false, message: 'This video call has not been accepted yet.' });
    }
    return res.status(200).json({ success: true, data: callRequest });
  } catch (error) {
    return next(error);
  }
};

const acceptVideoCallRequest = async (req, res, next) => {
  try {
    const callRequest = await populateRequest(VideoCallRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'PENDING' },
      {
        $set: {
          status: 'ACCEPTED',
          roomName: `livelihood-${crypto.randomBytes(18).toString('hex')}`,
          acceptedBy: req.user._id,
          acceptedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    ));
    if (callRequest) return res.status(200).json({ success: true, data: callRequest });

    const existing = await VideoCallRequest.findById(req.params.id).select('_id status');
    if (!existing) return res.status(404).json({ success: false, message: 'Video call request not found.' });
    return res.status(409).json({ success: false, message: 'This request is no longer pending.' });
  } catch (error) {
    return next(error);
  }
};

const declineVideoCallRequest = async (req, res, next) => {
  try {
    const declineReason = String(req.body.reason || '').trim();
    if (declineReason.length > 500) {
      return res.status(400).json({ success: false, message: 'Decline reason must be 500 characters or fewer.' });
    }
    const callRequest = await populateRequest(VideoCallRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'PENDING' },
      { $set: { status: 'DECLINED', declinedBy: req.user._id, declinedAt: new Date(), declineReason } },
      { new: true, runValidators: true },
    ));
    if (callRequest) return res.status(200).json({ success: true, data: callRequest });

    const existing = await VideoCallRequest.findById(req.params.id).select('_id');
    if (!existing) return res.status(404).json({ success: false, message: 'Video call request not found.' });
    return res.status(409).json({ success: false, message: 'This request is no longer pending.' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createVideoCallRequest,
  getMyVideoCallRequest,
  getPendingVideoCallRequests,
  getVideoCallRequest,
  acceptVideoCallRequest,
  declineVideoCallRequest,
};
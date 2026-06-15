import express from 'express';
import {
  getRooms,
  getRoom,
  addRoom,
  updateRoom,
  deleteRoom,
  completeRoom,
  getStatsSummary,
  getRecommendedRoom,
} from '../controllers/roomController.js';

const router = express.Router();

// Stats and recommendation routes must be before /:id to avoid param conflicts
router.get('/stats/summary', getStatsSummary);
router.get('/recommend', getRecommendedRoom);

router.route('/').get(getRooms).post(addRoom);
router.route('/:id').get(getRoom).put(updateRoom).delete(deleteRoom);
router.put('/:id/complete', completeRoom);

export default router;

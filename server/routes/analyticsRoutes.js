import express from 'express';
import { getReadinessScore, getCategoryStats, getActivityFeed } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/readiness', getReadinessScore);
router.get('/categories', getCategoryStats);
router.get('/activity', getActivityFeed);

export default router;

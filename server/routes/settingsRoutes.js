import express from 'express';
import { getSettings, updateSettings, resetProgress } from '../controllers/settingsController.js';

const router = express.Router();

router.route('/').get(getSettings).put(updateSettings);
router.post('/reset', resetProgress);

export default router;

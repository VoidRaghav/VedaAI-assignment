import { Router } from 'express';
import {
  createAssignment,
  generateQuestions,
  getAssignment,
  getJobStatus,
  regenerateQuestions,
  downloadPDF,
  getAllAssignments
} from '../controllers/assignmentController';

const router = Router();

router.post('/', createAssignment);
router.get('/', getAllAssignments);
router.get('/:id', getAssignment);
router.post('/:id/generate', generateQuestions);
router.get('/:id/status', getJobStatus);
router.post('/:id/regenerate', regenerateQuestions);
router.get('/:id/download', downloadPDF);

export default router;

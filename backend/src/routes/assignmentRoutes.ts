import express from 'express';
import {
  createAssignment,
  generateQuestions,
  getAssignment,
  getJobStatus,
  regenerateQuestions,
  downloadPDF,
  getAllAssignments,
  deleteAssignment,
  uploadDocument
} from '../controllers/assignmentController';
import { upload } from '../config/upload';

const router = express.Router();

router.post('/', createAssignment);
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getAllAssignments);
router.get('/:id', getAssignment);
router.post('/:id/generate', generateQuestions);
router.get('/:id/status', getJobStatus);
router.post('/:id/regenerate', regenerateQuestions);
router.get('/:id/download', downloadPDF);
router.delete('/:id', deleteAssignment);

export default router;

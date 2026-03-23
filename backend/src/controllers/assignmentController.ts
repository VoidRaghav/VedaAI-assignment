import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import { assignmentSchema } from '../utils/validation';
import { questionGenerationQueue, pdfGenerationQueue } from '../config/queue';
import pdfService from '../services/pdfService';
import { redisClient } from '../config/redis';
import ocrService from '../services/ocrService';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    let extractedText = '';

    if (fileType.startsWith('image/')) {
      extractedText = await ocrService.extractTextFromImage(filePath);
    } else if (fileType === 'application/pdf') {
      extractedText = await ocrService.extractTextFromPDF(filePath);
    }

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.originalname,
        extractedText: extractedText,
        fileUrl: `/uploads/${req.file.filename}`
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process uploaded file'
    });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete assignment'
    });
  }
};

export const createAssignment = async (req: Request, res: Response) => {
  try {
    console.log('Received assignment data:', JSON.stringify(req.body, null, 2));
    const validatedData = assignmentSchema.parse(req.body);
    console.log('Validation passed');

    const assignment = new Assignment({
      ...validatedData,
      dueDate: new Date(validatedData.dueDate),
      jobStatus: 'pending'
    });

    await assignment.save();
    console.log('Assignment saved:', assignment._id);

    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error: any) {
    console.error('Assignment creation error:', error);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create assignment',
      details: error.errors || error.issues || undefined
    });
  }
};

export const generateQuestions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    const job = await questionGenerationQueue.add('generate', {
      assignmentId: id
    });

    assignment.jobId = job.id;
    assignment.jobStatus = 'pending';
    await assignment.save();

    res.status(200).json({
      success: true,
      jobId: job.id,
      message: 'Question generation started'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start generation'
    });
  }
};

export const getAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cacheKey = `assignment:${id}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cached),
        cached: true
      });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(assignment));

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch assignment'
    });
  }
};

export const getJobStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    res.status(200).json({
      success: true,
      status: assignment.jobStatus,
      hasResult: !!assignment.generatedPaper
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch status'
    });
  }
};

export const regenerateQuestions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    const job = await questionGenerationQueue.add('generate', {
      assignmentId: id
    });

    assignment.jobId = job.id;
    assignment.jobStatus = 'pending';
    assignment.generatedPaper = undefined;
    await assignment.save();

    await redisClient.del(`assignment:${id}`);

    res.status(200).json({
      success: true,
      jobId: job.id,
      message: 'Regeneration started'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to regenerate'
    });
  }
};

export const downloadPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('PDF download requested for assignment:', id);

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      console.log('Assignment not found:', id);
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    if (!assignment.generatedPaper) {
      console.log('No generated paper for assignment:', id);
      return res.status(400).json({
        success: false,
        error: 'No generated paper available'
      });
    }

    console.log('Generating PDF for assignment:', id);
    const pdfBuffer = await pdfService.generatePDF(assignment);
    console.log('PDF generated successfully, size:', pdfBuffer.length);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${assignment.title}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('PDF generation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate PDF'
    });
  }
};

export const getAllAssignments = async (req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select('-generatedPaper');

    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch assignments'
    });
  }
};

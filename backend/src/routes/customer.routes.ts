import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply auth to all customer routes
router.use(authenticateToken);

// GET /api/customers
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, status, type, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status as string;
    }

    if (type) {
      where.type = type as string;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { businessName: { contains: q } },
        { mobile: { contains: q } },
        { email: { contains: q } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: {
          createdBy: { select: { name: true, role: true } },
          _count: { select: { followUps: true, challans: true } }
        }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      success: true,
      customers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, role: true } },
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { name: true, role: true } } }
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { name: true } } }
        }
      }
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    res.json({
      success: true,
      customer
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/customers
router.post('/', requireRole(['ADMIN', 'SALES']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      type,
      address,
      status,
      followUpDate,
      notes
    } = req.body;

    if (!name || !mobile || !email || !businessName || !address) {
      throw new AppError('Missing required customer fields: name, mobile, email, businessName, address', 400);
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber: gstNumber || null,
        type: type || 'RETAIL',
        address,
        status: status || 'LEAD',
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes: notes || null,
        createdById: req.user!.id
      },
      include: {
        createdBy: { select: { name: true, role: true } }
      }
    });

    // If initial follow up note is provided, record it
    if (notes) {
      await prisma.followUp.create({
        data: {
          customerId: newCustomer.id,
          note: `Initial Note: ${notes}`,
          followUpDate: followUpDate ? new Date(followUpDate) : null,
          createdById: req.user!.id
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer: newCustomer
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/customers/:id
router.put('/:id', requireRole(['ADMIN', 'SALES']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      type,
      address,
      status,
      followUpDate,
      notes
    } = req.body;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Customer not found', 404);
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber: gstNumber !== undefined ? gstNumber : existing.gstNumber,
        type,
        address,
        status,
        followUpDate: followUpDate ? new Date(followUpDate) : existing.followUpDate,
        notes: notes !== undefined ? notes : existing.notes
      },
      include: {
        createdBy: { select: { name: true, role: true } }
      }
    });

    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/customers/:id/followups
router.post('/:id/followups', requireRole(['ADMIN', 'SALES']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { note, followUpDate, nextStatus } = req.body;

    if (!note) {
      throw new AppError('Follow-up note is required', 400);
    }

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const parsedDate = followUpDate ? new Date(followUpDate) : null;

    const [newFollowUp, updatedCustomer] = await prisma.$transaction([
      prisma.followUp.create({
        data: {
          customerId: id,
          note,
          followUpDate: parsedDate,
          createdById: req.user!.id
        },
        include: {
          createdBy: { select: { name: true, role: true } }
        }
      }),
      prisma.customer.update({
        where: { id },
        data: {
          followUpDate: parsedDate,
          status: nextStatus ? nextStatus : customer.status
        }
      })
    ]);

    res.status(201).json({
      success: true,
      message: 'Follow-up note recorded',
      followUp: newFollowUp,
      customer: updatedCustomer
    });
  } catch (err) {
    next(err);
  }
});

export default router;

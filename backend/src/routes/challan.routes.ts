import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Helper function to auto-generate unique Challan number (e.g., CH-20260901-0001)
const generateChallanNumber = async (): Promise<string> => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `CH-${dateStr}-`;

  const lastChallan = await prisma.salesChallan.findFirst({
    where: { challanNumber: { startsWith: prefix } },
    orderBy: { challanNumber: 'desc' }
  });

  let nextSeq = 1;
  if (lastChallan) {
    const parts = lastChallan.challanNumber.split('-');
    if (parts.length === 3) {
      nextSeq = parseInt(parts[2], 10) + 1;
    }
  }

  return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
};

// GET /api/challans
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, customerId, search } = req.query;

    const where: any = {};
    if (status) where.status = status as string;
    if (customerId) where.customerId = customerId as string;
    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { challanNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerPhone: { contains: q } }
      ];
    }

    const challans = await prisma.salesChallan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, businessName: true, email: true, mobile: true, gstNumber: true, address: true } },
        createdBy: { select: { name: true, role: true } },
        items: true
      }
    });

    res.json({
      success: true,
      count: challans.length,
      challans
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/challans/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, businessName: true, email: true, mobile: true, gstNumber: true, address: true } },
        createdBy: { select: { name: true, role: true } },
        items: true
      }
    });

    if (!challan) {
      throw new AppError('Sales Challan not found', 404);
    }

    res.json({
      success: true,
      challan
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/challans
router.post('/', requireRole(['ADMIN', 'SALES']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId, items, status = 'DRAFT' } = req.body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Customer ID and at least one item are required to create a sales challan', 400);
    }

    if (!['DRAFT', 'CONFIRMED'].includes(status)) {
      throw new AppError('Initial status must be DRAFT or CONFIRMED', 400);
    }

    // Verify Customer
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Process & Validate Items
    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    let totalQuantity = 0;
    let totalAmount = 0;
    const preparedItems: Array<{
      productId: string;
      productName: string;
      productSku: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }> = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new AppError(`Product with ID '${item.productId}' not found`, 404);
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        throw new AppError(`Invalid quantity for product ${product.name}. Must be positive integer.`, 400);
      }

      // Check stock if attempting to CONFIRM directly
      if (status === 'CONFIRMED' && product.currentStock < qty) {
        throw new AppError(
          `Insufficient stock for '${product.name}' (SKU: ${product.sku}). Available stock: ${product.currentStock}, requested: ${qty}`,
          400
        );
      }

      const unitPrice = parseFloat(item.unitPrice !== undefined ? item.unitPrice : product.unitPrice);
      const subtotal = unitPrice * qty;

      totalQuantity += qty;
      totalAmount += subtotal;

      preparedItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        unitPrice,
        quantity: qty,
        subtotal
      });
    }

    const challanNumber = await generateChallanNumber();

    // Execute in Database Transaction
    const challan = await prisma.$transaction(async (tx) => {
      // 1. Create Sales Challan with Snapshots
      const createdChallan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId: customer.id,
          customerName: customer.businessName ? `${customer.name} (${customer.businessName})` : customer.name,
          customerEmail: customer.email,
          customerPhone: customer.mobile,
          status: status as 'DRAFT' | 'CONFIRMED',
          totalQuantity,
          totalAmount,
          createdById: req.user!.id,
          items: {
            create: preparedItems
          }
        },
        include: {
          items: true,
          createdBy: { select: { name: true, role: true } }
        }
      });

      // 2. If CONFIRMED immediately, reduce product stock & record Stock Movement OUT
      if (status === 'CONFIRMED') {
        for (const item of preparedItems) {
          const prod = productMap.get(item.productId)!;
          
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'OUT',
              reason: `Sales Challan #${challanNumber} Confirmation`,
              createdById: req.user!.id
            }
          });
        }
      }

      return createdChallan;
    });

    res.status(201).json({
      success: true,
      message: `Sales Challan created successfully (${status})`,
      challan
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/challans/:id/status (Confirm or Cancel Challan)
router.patch('/:id/status', requireRole(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
      throw new AppError('Target status must be CONFIRMED or CANCELLED', 400);
    }

    const updatedChallan = await prisma.$transaction(async (tx) => {
      const existing = await tx.salesChallan.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!existing) {
        throw new AppError('Sales Challan not found', 404);
      }

      if (existing.status === status) {
        throw new AppError(`Challan is already in status '${status}'`, 400);
      }

      if (existing.status === 'CANCELLED') {
        throw new AppError('Cannot update status of a CANCELLED challan', 400);
      }

      // Handle DRAFT -> CONFIRMED transition
      if (existing.status === 'DRAFT' && status === 'CONFIRMED') {
        for (const item of existing.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          
          if (!product) {
            throw new AppError(`Product '${item.productName}' no longer exists`, 404);
          }

          if (product.currentStock < item.quantity) {
            throw new AppError(
              `Cannot confirm challan. Insufficient stock for '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Required: ${item.quantity}`,
              400
            );
          }

          // Decrement Stock
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
          });

          // Log Stock Movement OUT
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'OUT',
              reason: `Sales Challan #${existing.challanNumber} Confirmation`,
              createdById: req.user!.id
            }
          });
        }
      }

      // Handle CONFIRMED -> CANCELLED transition (Restore stock)
      if (existing.status === 'CONFIRMED' && status === 'CANCELLED') {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } }
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'IN',
              reason: `Sales Challan #${existing.challanNumber} Cancellation Reversal`,
              createdById: req.user!.id
            }
          });
        }
      }

      return tx.salesChallan.update({
        where: { id },
        data: { status: status as 'CONFIRMED' | 'CANCELLED' },
        include: { items: true, customer: true, createdBy: { select: { name: true } } }
      });
    });

    res.json({
      success: true,
      message: `Sales Challan #${updatedChallan.challanNumber} updated to ${status}`,
      challan: updatedChallan
    });
  } catch (err) {
    next(err);
  }
});

export default router;

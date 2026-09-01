import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// GET /api/products/movements (Must be placed before GET /:id to avoid ID route conflict)
router.get('/movements', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, type, limit = '100' } = req.query;

    const where: any = {};
    if (productId) where.productId = productId as string;
    if (type) where.type = type as string;

    const movements = await prisma.stockMovement.findMany({
      where,
      take: parseInt(limit as string, 10) || 100,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        createdBy: { select: { name: true, role: true } }
      }
    });

    res.json({
      success: true,
      movements
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, category, lowStockOnly } = req.query;

    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { category: { contains: q } },
        { location: { contains: q } }
      ];
    }

    let products = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        createdBy: { select: { name: true, role: true } }
      }
    });

    if (lowStockOnly === 'true') {
      products = products.filter(p => p.currentStock <= p.minStockAlert);
    }

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } },
        movements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { name: true, role: true } } }
        }
      }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      product
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/products
router.post('/', requireRole(['ADMIN', 'WAREHOUSE']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      sku,
      category,
      unitPrice,
      currentStock = 0,
      minStockAlert = 5,
      location
    } = req.body;

    if (!name || !sku || !category || unitPrice === undefined || !location) {
      throw new AppError('Missing required product fields: name, sku, category, unitPrice, location', 400);
    }

    const existingSku = await prisma.product.findUnique({
      where: { sku: sku.trim().toUpperCase() }
    });

    if (existingSku) {
      throw new AppError(`SKU '${sku}' already exists. Please use a unique SKU code.`, 400);
    }

    const stockQty = parseInt(currentStock, 10) || 0;
    const minAlert = parseInt(minStockAlert, 10) || 5;
    const price = parseFloat(unitPrice);

    if (isNaN(price) || price < 0) {
      throw new AppError('Unit price must be a non-negative number', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          category: category.trim(),
          unitPrice: price,
          currentStock: stockQty,
          minStockAlert: minAlert,
          location: location.trim(),
          createdById: req.user!.id
        }
      });

      // If initial stock > 0, log an initial IN stock movement
      if (stockQty > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: stockQty,
            type: 'IN',
            reason: 'Initial Product Stock Setup',
            createdById: req.user!.id
          }
        });
      }

      return product;
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: result
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id
router.put('/:id', requireRole(['ADMIN', 'WAREHOUSE']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, category, unitPrice, minStockAlert, location } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name ? name.trim() : existing.name,
        category: category ? category.trim() : existing.category,
        unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : existing.unitPrice,
        minStockAlert: minStockAlert !== undefined ? parseInt(minStockAlert, 10) : existing.minStockAlert,
        location: location ? location.trim() : existing.location
      }
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updated
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/adjust-stock
router.post('/:id/adjust-stock', requireRole(['ADMIN', 'WAREHOUSE']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { quantity, type, reason } = req.body;

    if (!quantity || !type || !reason) {
      throw new AppError('Missing required stock adjustment fields: quantity, type (IN/OUT), reason', 400);
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new AppError('Quantity must be a positive integer', 400);
    }

    if (!['IN', 'OUT'].includes(type)) {
      throw new AppError('Movement type must be IN or OUT', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      if (type === 'OUT' && product.currentStock < qty) {
        throw new AppError(
          `Insufficient stock for '${product.name}' (SKU: ${product.sku}). Current stock: ${product.currentStock}, requested reduction: ${qty}`,
          400
        );
      }

      const newStock = type === 'IN' ? product.currentStock + qty : product.currentStock - qty;

      const updatedProduct = await tx.product.update({
        where: { id },
        data: { currentStock: newStock }
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: id,
          quantity: qty,
          type: type as 'IN' | 'OUT',
          reason: reason.trim(),
          createdById: req.user!.id
        },
        include: { createdBy: { select: { name: true, role: true } } }
      });

      return { product: updatedProduct, movement };
    });

    res.json({
      success: true,
      message: `Stock successfully adjusted (${type} ${qty})`,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// GET /api/dashboard/stats
router.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalCustomers,
      leadCustomers,
      activeCustomers,
      totalProducts,
      products,
      totalChallans,
      confirmedChallans,
      recentChallans,
      upcomingFollowUps
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'LEAD' } }),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count(),
      prisma.product.findMany(),
      prisma.salesChallan.count(),
      prisma.salesChallan.findMany({
        where: { status: 'CONFIRMED' },
        select: { totalAmount: true, totalQuantity: true }
      }),
      prisma.salesChallan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true, businessName: true } } }
      }),
      prisma.customer.findMany({
        where: {
          followUpDate: { not: null }
        },
        take: 5,
        orderBy: { followUpDate: 'asc' },
        select: {
          id: true,
          name: true,
          businessName: true,
          mobile: true,
          status: true,
          followUpDate: true,
          notes: true
        }
      })
    ]);

    const lowStockProducts = products.filter(p => p.currentStock <= p.minStockAlert);
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.currentStock * p.unitPrice), 0);
    const totalRevenue = confirmedChallans.reduce((acc, c) => acc + c.totalAmount, 0);

    res.json({
      success: true,
      stats: {
        customers: {
          total: totalCustomers,
          leads: leadCustomers,
          active: activeCustomers
        },
        inventory: {
          totalProducts,
          lowStockCount: lowStockProducts.length,
          totalStockValue: totalRevenue > 0 ? totalInventoryValue : totalInventoryValue,
          lowStockProducts: lowStockProducts.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            currentStock: p.currentStock,
            minStockAlert: p.minStockAlert,
            location: p.location
          }))
        },
        challans: {
          total: totalChallans,
          confirmedCount: confirmedChallans.length,
          totalRevenue,
          recent: recentChallans
        },
        followUps: {
          upcoming: upcomingFollowUps
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;

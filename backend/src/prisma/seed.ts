import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Clear existing records
  await prisma.salesChallanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Demo Users for all 4 Roles
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@minierp.com',
      password: passwordHash,
      role: 'ADMIN'
    }
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sarah Sales Manager',
      email: 'sales@minierp.com',
      password: passwordHash,
      role: 'SALES'
    }
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Wally Warehouse Supervisor',
      email: 'warehouse@minierp.com',
      password: passwordHash,
      role: 'WAREHOUSE'
    }
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Arthur Accounts Lead',
      email: 'accounts@minierp.com',
      password: passwordHash,
      role: 'ACCOUNTS'
    }
  });

  console.log('✅ Demo Users Created (Admin, Sales, Warehouse, Accounts)');

  // 3. Create Sample Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rajesh Sharma',
      businessName: 'Apex Industrial Tools & Hardware',
      email: 'rajesh@apexindustrial.com',
      mobile: '+91 98765 43210',
      gstNumber: '27AAAAA0000A1Z5',
      type: 'DISTRIBUTOR',
      status: 'ACTIVE',
      address: 'Plot 42, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093',
      followUpDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      notes: 'Key distributor in Western region. Negotiating Q4 volume pricing discount.',
      createdById: salesUser.id
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Vikram Mehta',
      businessName: 'Sunlight Electrical Wholesale',
      email: 'contact@sunlightwholesale.in',
      mobile: '+91 91234 56789',
      gstNumber: '07BBBBB1111B2Z8',
      type: 'WHOLESALE',
      status: 'LEAD',
      address: 'Shop 14, Chandni Chowk Electrical Market, Delhi 110006',
      followUpDate: new Date(Date.now() + 86400000 * 1), // tomorrow
      notes: 'Interested in buying bulk LED fixtures. Requested official quotation.',
      createdById: salesUser.id
    }
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Ananya Roy',
      businessName: 'Metro Hardware Stores',
      email: 'ananya@metrohardware.com',
      mobile: '+91 99887 76655',
      gstNumber: '19CCCCC2222C3Z1',
      type: 'RETAIL',
      status: 'ACTIVE',
      address: '88 Salt Lake Sector V, Kolkata, West Bengal 700091',
      notes: 'Regular retail store customer. Prefers net 30 payment terms.',
      createdById: salesUser.id
    }
  });

  // Add FollowUp log entries
  await prisma.followUp.create({
    data: {
      customerId: customer1.id,
      note: 'Initial phone call to confirm catalog receipt. Client expressed high interest in SKU: PRD-HDW-001.',
      createdById: salesUser.id
    }
  });

  await prisma.followUp.create({
    data: {
      customerId: customer2.id,
      note: 'Sent product price matrix via email. Follow-up call scheduled for tomorrow.',
      followUpDate: new Date(Date.now() + 86400000 * 1),
      createdById: salesUser.id
    }
  });

  console.log('✅ Sample Customers & Follow-Ups Created');

  // 4. Create Sample Products
  const p1 = await prisma.product.create({
    data: {
      name: 'Heavy Duty Electric Drill 800W',
      sku: 'PRD-HDW-001',
      category: 'Power Tools',
      unitPrice: 3450.00,
      currentStock: 45,
      minStockAlert: 10,
      location: 'Rack A-12',
      createdById: warehouseUser.id
    }
  });

  const p2 = await prisma.product.create({
    data: {
      name: 'Industrial Safety Helmet - High Vis Yellow',
      sku: 'PRD-SAF-002',
      category: 'Safety Equipment',
      unitPrice: 420.00,
      currentStock: 120,
      minStockAlert: 25,
      location: 'Bin S-04',
      createdById: warehouseUser.id
    }
  });

  const p3 = await prisma.product.create({
    data: {
      name: 'Precision Socket Wrench Set 40-Piece',
      sku: 'PRD-HDW-003',
      category: 'Hand Tools',
      unitPrice: 1890.00,
      currentStock: 4, // LOW STOCK TRIGGER!
      minStockAlert: 15,
      location: 'Rack B-08',
      createdById: warehouseUser.id
    }
  });

  const p4 = await prisma.product.create({
    data: {
      name: 'Digital Multimeter AC/DC Pro 6000',
      sku: 'PRD-ELE-004',
      category: 'Electronics',
      unitPrice: 2750.00,
      currentStock: 3, // LOW STOCK TRIGGER!
      minStockAlert: 8,
      location: 'Shelf E-02',
      createdById: warehouseUser.id
    }
  });

  const p5 = await prisma.product.create({
    data: {
      name: 'Heavy Duty LED Floodlight 100W IP66',
      sku: 'PRD-ELE-005',
      category: 'Lighting',
      unitPrice: 1650.00,
      currentStock: 80,
      minStockAlert: 20,
      location: 'Rack C-05',
      createdById: warehouseUser.id
    }
  });

  console.log('✅ Sample Products Created (including low-stock items)');

  // 5. Initial Stock Movement IN records
  const productsList = [
    { prod: p1, qty: 50 },
    { prod: p2, qty: 150 },
    { prod: p3, qty: 20 },
    { prod: p4, qty: 15 },
    { prod: p5, qty: 100 }
  ];

  for (const item of productsList) {
    await prisma.stockMovement.create({
      data: {
        productId: item.prod.id,
        quantity: item.qty,
        type: 'IN',
        reason: 'Initial Inward Shipment from Supplier',
        createdById: warehouseUser.id
      }
    });
  }

  // 6. Create Demo Sales Challans
  // Challan 1: CONFIRMED
  const challan1 = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-20260901-0001',
      customerId: customer1.id,
      customerName: 'Rajesh Sharma (Apex Industrial Tools & Hardware)',
      customerEmail: customer1.email,
      customerPhone: customer1.mobile,
      status: 'CONFIRMED',
      totalQuantity: 10,
      totalAmount: 34500.00,
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: p1.id,
            productName: p1.name,
            productSku: p1.sku,
            unitPrice: p1.unitPrice,
            quantity: 10,
            subtotal: 34500.00
          }
        ]
      }
    }
  });

  // Log stock movement OUT for confirmed challan 1
  await prisma.stockMovement.create({
    data: {
      productId: p1.id,
      quantity: 5,
      type: 'OUT',
      reason: `Sales Challan #${challan1.challanNumber} Delivery Dispatch`,
      createdById: salesUser.id
    }
  });

  // Challan 2: DRAFT
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-20260901-0002',
      customerId: customer3.id,
      customerName: 'Ananya Roy (Metro Hardware Stores)',
      customerEmail: customer3.email,
      customerPhone: customer3.mobile,
      status: 'DRAFT',
      totalQuantity: 30,
      totalAmount: 12600.00,
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: p2.id,
            productName: p2.name,
            productSku: p2.sku,
            unitPrice: p2.unitPrice,
            quantity: 30,
            subtotal: 12600.00
          }
        ]
      }
    }
  });

  console.log('✅ Demo Sales Challans Created');
  console.log('🚀 Database Seeding Complete successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

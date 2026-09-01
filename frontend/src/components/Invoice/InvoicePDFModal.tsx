import React from 'react';
import { X, Printer, Download, Building2, Calendar, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalesChallan } from '../../types';

interface InvoicePDFModalProps {
  challan: SalesChallan;
  onClose: () => void;
}

export const InvoicePDFModal: React.FC<InvoicePDFModalProps> = ({ challan, onClose }) => {

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Company Header
    doc.setFillColor(30, 41, 59); // Slate-900
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('APEX DISTRIBUTORS ERP', 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('TAX INVOICE & DELIVERY CHALLAN', 14, 30);
    doc.text(`Challan No: ${challan.challanNumber}`, 145, 22);
    doc.text(`Date: ${new Date(challan.createdAt).toLocaleDateString()}`, 145, 30);

    // Customer & Vendor Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER / BILL TO:', 14, 52);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${challan.customerName}`, 14, 60);
    doc.text(`Email: ${challan.customerEmail}`, 14, 66);
    doc.text(`Phone: ${challan.customerPhone}`, 14, 72);
    if (challan.customer?.address) {
      doc.text(`Address: ${challan.customer.address}`, 14, 78);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('STATUS & SUMMARY:', 130, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status: ${challan.status}`, 130, 60);
    doc.text(`Total Quantity: ${challan.totalQuantity} Units`, 130, 66);
    doc.text(`Issued By: ${challan.createdBy?.name || 'Sales Staff'}`, 130, 72);

    // Items Table
    const tableData = challan.items.map((item, idx) => [
      (idx + 1).toString(),
      item.productName,
      item.productSku,
      `INR ${item.unitPrice.toLocaleString('en-IN')}`,
      item.quantity.toString(),
      `INR ${item.subtotal.toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: 88,
      head: [['#', 'Product Item', 'SKU', 'Unit Price', 'Qty', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });

    const finalY = (doc as any).lastAutoTable.previous.finalY + 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`GRAND TOTAL: INR ${challan.totalAmount.toLocaleString('en-IN')}`, 130, finalY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('This is a computer-generated tax invoice & delivery challan. Stock dispatch subject to confirmation.', 14, finalY + 20);

    doc.save(`Invoice_${challan.challanNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Toolbar */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Invoice Preview: {challan.challanNumber}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadPDF}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-8 bg-white text-slate-900 space-y-6 overflow-y-auto flex-1 font-sans">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-6 border-slate-200">
            <div>
              <h2 className="text-2xl font-extrabold text-indigo-900">APEX DISTRIBUTORS ERP</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tax Invoice & Delivery Challan</p>
              <p className="text-xs text-slate-600 mt-1">Plot 42, MIDC Industrial Hub, Mumbai 400093</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-indigo-600 uppercase">Challan Number</span>
              <h3 className="text-lg font-mono font-bold text-slate-900">{challan.challanNumber}</h3>
              <p className="text-xs text-slate-500">Date: {new Date(challan.createdAt).toLocaleDateString()}</p>
              <span className={`inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                challan.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {challan.status}
              </span>
            </div>
          </div>

          {/* Customer & Order Metadata */}
          <div className="grid grid-cols-2 gap-6 text-xs border-b pb-6 border-slate-200">
            <div>
              <span className="font-bold text-slate-500 uppercase block mb-1">Customer / Consignee:</span>
              <p className="font-bold text-sm text-slate-900">{challan.customerName}</p>
              <p className="text-slate-600">Mobile: {challan.customerPhone}</p>
              <p className="text-slate-600">Email: {challan.customerEmail}</p>
              {challan.customer?.address && <p className="text-slate-600 mt-1">Address: {challan.customer.address}</p>}
            </div>
            <div className="text-right space-y-1">
              <span className="font-bold text-slate-500 uppercase block mb-1">Logistics & Issue Info:</span>
              <p className="text-slate-700">Issued By: <strong>{challan.createdBy?.name || 'Sales Staff'}</strong></p>
              <p className="text-slate-700">Total Line Items: <strong>{challan.items.length}</strong></p>
              <p className="text-slate-700">Total Dispatched Units: <strong>{challan.totalQuantity} Pcs</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {challan.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.productName}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{item.productSku}</td>
                  <td className="py-2.5 px-3 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right font-bold">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{item.subtotal.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Invoice Footer & Total */}
          <div className="flex justify-between items-end border-t pt-4 border-slate-300">
            <div className="text-[11px] text-slate-500 max-w-sm">
              <p className="font-semibold text-slate-700">Terms & Conditions:</p>
              <p>Goods once dispatched cannot be returned without authorized stock reversal log.</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs text-slate-500">Subtotal Amount: ₹{challan.totalAmount.toLocaleString('en-IN')}</p>
              <h4 className="text-lg font-extrabold text-indigo-900">Total Invoice: ₹{challan.totalAmount.toLocaleString('en-IN')}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

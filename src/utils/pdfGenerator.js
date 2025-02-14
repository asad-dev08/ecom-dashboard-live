import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';

export const generateInvoicePDF = async (order) => {
  const doc = new jsPDF();

  // Add company logo/header
  doc.setFontSize(20);
  doc.text('INVOICE', 105, 20, { align: 'center' });
  
  // Add invoice details
  doc.setFontSize(10);
  doc.text(`Invoice Number: INV-${order.id.slice(0, 8)}`, 15, 40);
  doc.text(`Date: ${dayjs(order.created_at).format('YYYY-MM-DD')}`, 15, 45);
  doc.text(`Status: ${order.status.toUpperCase()}`, 15, 50);

  // Add customer details
  doc.text('Bill To:', 15, 60);
  doc.text(order.customer_name, 15, 65);
  doc.text(order.shipping_address || '', 15, 70);

  // Add order items table
  const tableColumns = [
    { 
      header: 'Product', 
      dataKey: 'product_name',
      width: 80 
    },
    { 
      header: 'Quantity', 
      dataKey: 'quantity',
      halign: 'right',
      align: 'right',
      width: 30 
    },
    { 
      header: 'Unit Price', 
      dataKey: 'unit_price',
      halign: 'right',
      align: 'right',
      width: 40 
    },
    { 
      header: 'Total', 
      dataKey: 'total',
      halign: 'right',
      align: 'right',
      width: 40 
    },
  ];

  const tableRows = order.items.map(item => ({
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: `$${item.unit_price.toFixed(2)}`,
    total: `$${(item.quantity * item.unit_price).toFixed(2)}`,
  }));

  doc.autoTable({
    startY: 80,
    head: [tableColumns.map(col => col.header)],
    body: tableRows.map(row => tableColumns.map(col => row[col.dataKey])),
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 80 }, // Product name
      1: { cellWidth: 30, halign: 'right' }, // Quantity
      2: { cellWidth: 40, halign: 'right' }, // Unit Price
      3: { cellWidth: 40, halign: 'right' }, // Total
    },
    headStyles: {
      fillColor: [51, 51, 51],
      textColor: [255, 255, 255],
      halign: 'center',
      fontSize: 10,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4,
    },
    margin: { left: 15 },
  });

  // Add totals with right alignment
  const finalY = doc.lastAutoTable.finalY || 150;
  const rightColumnX = 150;

  // Add totals section with right alignment
  doc.text('Subtotal:', rightColumnX, finalY + 10, { align: 'right' });
  doc.text(`$${order.subtotal?.toFixed(2) || '0.00'}`, 190, finalY + 10, { align: 'right' });

  doc.text('Shipping:', rightColumnX, finalY + 15, { align: 'right' });
  doc.text(`$${order.shipping_fee?.toFixed(2) || '0.00'}`, 190, finalY + 15, { align: 'right' });

  doc.text('Tax:', rightColumnX, finalY + 20, { align: 'right' });
  doc.text(`$${order.tax?.toFixed(2) || '0.00'}`, 190, finalY + 20, { align: 'right' });

  // Total in bold
  doc.setFont(undefined, 'bold');
  doc.text('Total:', rightColumnX, finalY + 25, { align: 'right' });
  doc.text(`$${order.total_amount.toFixed(2)}`, 190, finalY + 25, { align: 'right' });

  // Add footer
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for your business!', 105, finalY + 40, { align: 'center' });

  // Save the PDF
  doc.save(`invoice-${order.id}.pdf`);
}; 
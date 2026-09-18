import PDFDocument from "pdfkit";
import { INDIAN_STATES_AND_CODES } from "@repo/types";
import { PrismaClient, Prisma } from "../generated/prisma/client.js";
import { NotFoundError, ValidationError } from "../lib/error.js";

const STATE_CODES = INDIAN_STATES_AND_CODES;

export const SUPPLIER_CONFIG = {
  companyName: "Pinak Beauty & Care Pvt. Ltd.",
  brandName: "Pinak",
  gstin: "27AAACP1234A1Z5", // 15-digit GSTIN for Maharashtra
  pan: "AAACP1234A",
  state: "Maharashtra",
  stateCode: "27",
  addressLine1: "Building A, Tech Park, BKC",
  addressLine2: "Bandra East",
  city: "Mumbai",
  pincode: "400051",
  email: "support@pinak.com",
  phone: "+91-22-4000-1000",
};

export function convertNumberToIndianWords(amountInPaise: number): string {
  const rupees = Math.floor(amountInPaise / 100);
  const paise = amountInPaise % 100;

  const singleDigits = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tensDigits = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function numToWords(n: number): string {
    if (n === 0) return "";
    if (n < 20) return singleDigits[n] + " ";
    if (n < 100) return tensDigits[Math.floor(n / 10)] + " " + singleDigits[n % 10] + " ";
    if (n < 1000) return singleDigits[Math.floor(n / 100)] + " Hundred " + numToWords(n % 100);
    if (n < 100000)
      return numToWords(Math.floor(n / 1000)) + "Thousand " + numToWords(n % 1000);
    if (n < 10000000)
      return numToWords(Math.floor(n / 100000)) + "Lakh " + numToWords(n % 100000);
    return numToWords(Math.floor(n / 10000000)) + "Crore " + numToWords(n % 10000000);
  }

  let words = rupees === 0 ? "Zero Rupees" : "Rupees " + numToWords(rupees).trim();
  if (paise > 0) {
    words += " and " + numToWords(paise).trim() + " Paise";
  }
  return words + " Only";
}

export function getStateCode(stateName: string): string {
  const normalized = stateName.trim().toUpperCase();
  return STATE_CODES[normalized] || "27";
}

export class InvoiceService {
  constructor(private prisma: PrismaClient) {}

  async generateInvoiceNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const db = tx || this.prisma;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed: 0 = Jan, 3 = Apr

    let startYear = currentYear;
    let endYear = currentYear + 1;

    if (currentMonth < 3) {
      startYear = currentYear - 1;
      endYear = currentYear;
    }

    const endYearShort = endYear.toString().slice(-2);
    const prefix = `INV/${startYear}-${endYearShort}/`;

    const latestOrder = await db.order.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    });

    let lastSeq = 0;
    if (latestOrder?.invoiceNumber) {
      const parts = latestOrder.invoiceNumber.split("/");
      const lastSeqStr = parts[parts.length - 1];
      const parsed = parseInt(lastSeqStr || "0", 10);
      if (!isNaN(parsed)) {
        lastSeq = parsed;
      }
    }

    const sequence = (lastSeq + 1).toString().padStart(5, "0");
    return `${prefix}${sequence}`;
  }

  async getInvoiceData(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Ensure invoice number & invoice date exist
    let invoiceNumber = order.invoiceNumber;
    let invoiceDate = order.invoiceDate;

    if (!invoiceNumber || !invoiceDate) {
      invoiceNumber = await this.generateInvoiceNumber();
      invoiceDate = new Date();

      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          invoiceNumber,
          invoiceDate,
        },
      });
    }

    const breakup = (typeof order.getBreakup === "object" && order.getBreakup !== null)
      ? (order.getBreakup as Record<string, any>)
      : {};

    const shippingAddress = breakup.shippingAddress || {};
    const billingAddress = breakup.billingAddress || shippingAddress;
    const taxBreakdown = Array.isArray(breakup.taxBreakdown) ? breakup.taxBreakdown : [];

    const customerState = shippingAddress.state || billingAddress.state || "Maharashtra";
    const customerStateCode = getStateCode(customerState);
    const isSameState = customerStateCode === SUPPLIER_CONFIG.stateCode;

    // Format line items with CGST/SGST or IGST bifurcation
    const formattedItems = order.items.map((item, idx) => {
      const lineBreakdown = taxBreakdown[idx] || {
        rate: order.gstPercentage,
        taxableValue: item.price * item.quantity,
        discountAmount: 0,
        amount: Math.round((item.price * item.quantity * order.gstPercentage) / 100),
      };

      const lineSubtotal = item.price * item.quantity;
      const discount = lineBreakdown.discountAmount || 0;
      const taxableValue = lineBreakdown.taxableValue ?? (lineSubtotal - discount);
      const totalTax = lineBreakdown.amount || 0;
      const totalLineAmount = taxableValue + totalTax;

      const rate = lineBreakdown.rate || 0;
      let cgstRate = 0;
      let sgstRate = 0;
      let igstRate = 0;
      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (isSameState) {
        cgstRate = rate / 2;
        sgstRate = rate / 2;
        cgstAmount = Math.round(totalTax / 2);
        sgstAmount = totalTax - cgstAmount;
      } else {
        igstRate = rate;
        igstAmount = totalTax;
      }

      return {
        itemNo: idx + 1,
        description: item.productName,
        hsnCode: "3304", // Standard HSN code for cosmetics/skincare
        quantity: item.quantity,
        unitPrice: item.price,
        lineSubtotal,
        discount,
        taxableValue,
        gstRate: rate,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        igstRate,
        igstAmount,
        totalTax,
        totalLineAmount,
      };
    });

    const totalCgst = formattedItems.reduce((sum, i) => sum + i.cgstAmount, 0);
    const totalSgst = formattedItems.reduce((sum, i) => sum + i.sgstAmount, 0);
    const totalIgst = formattedItems.reduce((sum, i) => sum + i.igstAmount, 0);

    const netTaxableAmount = formattedItems.reduce((sum, i) => sum + i.taxableValue, 0);
    const amountInWords = convertNumberToIndianWords(order.totalAmount);

    return {
      supplier: SUPPLIER_CONFIG,
      customer: {
        name: shippingAddress.fullName || order.user.name || "Valued Customer",
        email: order.user.email,
        phone: shippingAddress.phone || "",
        shippingAddress: `${shippingAddress.addressLine1}${shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
        billingAddress: `${billingAddress.addressLine1}${billingAddress.addressLine2 ? `, ${billingAddress.addressLine2}` : ""}, ${billingAddress.city}, ${billingAddress.state} - ${billingAddress.pincode}`,
        state: customerState,
        stateCode: customerStateCode,
        gstin: order.gstNumber || "N/A (B2C)",
      },
      invoice: {
        number: invoiceNumber,
        date: invoiceDate,
        orderId: order.id,
        orderDate: order.createdAt,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod || "ONLINE",
        gatewayPaymentId: order.gatewayPaymentId || "N/A",
      },
      pricing: {
        grossSubtotal: order.subtotalAmount,
        discountAmount: order.discountAmount,
        netTaxableAmount,
        totalCgst,
        totalSgst,
        totalIgst,
        totalTaxAmount: order.taxAmount,
        shippingAmount: order.shippingAmount,
        totalAmount: order.totalAmount,
        amountInWords,
        isSameState,
      },
      items: formattedItems,
    };
  }

  async renderInvoiceHtml(orderId: string, userId: string): Promise<string> {
    const data = await this.getInvoiceData(orderId, userId);

    const formatINR = (paise: number) => (paise / 100).toFixed(2);

    const itemRowsHtml = data.items
      .map(
        (item) => `
      <tr>
        <td style="text-align: center;">${item.itemNo}</td>
        <td><strong>${item.description}</strong></td>
        <td style="text-align: center;">${item.hsnCode}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">₹${formatINR(item.unitPrice)}</td>
        <td style="text-align: right;">₹${formatINR(item.lineSubtotal)}</td>
        <td style="text-align: right;">₹${formatINR(item.discount)}</td>
        <td style="text-align: right;"><strong>₹${formatINR(item.taxableValue)}</strong></td>
        ${
          data.pricing.isSameState
            ? `
          <td style="text-align: right;">${item.cgstRate}%<br/><small>₹${formatINR(item.cgstAmount)}</small></td>
          <td style="text-align: right;">${item.sgstRate}%<br/><small>₹${formatINR(item.sgstAmount)}</small></td>
        `
            : `
          <td style="text-align: right;">${item.igstRate}%<br/><small>₹${formatINR(item.igstAmount)}</small></td>
        `
        }
        <td style="text-align: right;"><strong>₹${formatINR(item.totalLineAmount)}</strong></td>
      </tr>
    `,
      )
      .join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tax Invoice - ${data.invoice.number}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #333; margin: 0; padding: 20px; background: #fff; }
    .invoice-card { max-width: 850px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header-table { width: 100%; border-bottom: 2px solid #222; padding-bottom: 15px; margin-bottom: 20px; }
    .title { font-size: 24px; font-weight: bold; color: #111; text-transform: uppercase; letter-spacing: 1px; }
    .badge { display: inline-block; padding: 4px 8px; background: #eef2ff; color: #3730a3; font-weight: bold; border-radius: 4px; font-size: 11px; }
    .meta-table { width: 100%; margin-bottom: 25px; }
    .meta-box { width: 48%; vertical-align: top; background: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #f3f4f6; }
    .meta-title { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold; margin-bottom: 8px; }
    table.data-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
    table.data-table th { background: #1f2937; color: #fff; padding: 8px 10px; text-align: left; font-weight: 600; }
    table.data-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    table.data-table tr:nth-child(even) { background-color: #f9fafb; }
    .summary-table { width: 350px; float: right; margin-top: 20px; border-collapse: collapse; }
    .summary-table td { padding: 6px 12px; }
    .summary-table tr.total-row { font-size: 15px; font-weight: bold; background: #111827; color: #fff; }
    .words-box { margin-top: 20px; padding: 12px; background: #f3f4f6; border-left: 4px solid #4f46e5; font-style: italic; font-weight: 500; }
    .footer { margin-top: 50px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <table class="header-table">
      <tr>
        <td>
          <div class="title">Tax Invoice</div>
          <span class="badge">Rule 46 CGST Rules, 2017</span>
        </td>
        <td style="text-align: right;">
          <h2 style="margin: 0; color: #4f46e5;">${data.supplier.brandName}</h2>
          <div style="font-size: 11px; color: #666; margin-top: 4px;">${data.supplier.companyName}</div>
          <div style="font-size: 11px; color: #666;">GSTIN: <strong>${data.supplier.gstin}</strong></div>
        </td>
      </tr>
    </table>

    <table class="meta-table">
      <tr>
        <td class="meta-box">
          <div class="meta-title">Supplier Details</div>
          <strong>${data.supplier.companyName}</strong><br/>
          ${data.supplier.addressLine1}, ${data.supplier.addressLine2}<br/>
          ${data.supplier.city}, ${data.supplier.state} - ${data.supplier.pincode}<br/>
          State Code: <strong>${data.supplier.stateCode}</strong> | PAN: <strong>${data.supplier.pan}</strong><br/>
          Email: ${data.supplier.email} | Phone: ${data.supplier.phone}
        </td>
        <td style="width: 4%;"></td>
        <td class="meta-box">
          <div class="meta-title">Invoice & Order Info</div>
          Invoice No: <strong>${data.invoice.number}</strong><br/>
          Invoice Date: <strong>${new Date(data.invoice.date).toLocaleDateString("en-IN")}</strong><br/>
          Order ID: <strong>#${data.invoice.orderId}</strong><br/>
          Order Date: ${new Date(data.invoice.orderDate).toLocaleDateString("en-IN")}<br/>
          Payment Status: <span style="color: #059669; font-weight: bold;">${data.invoice.paymentStatus}</span> (${data.invoice.paymentMethod})
        </td>
      </tr>
    </table>

    <table class="meta-table">
      <tr>
        <td class="meta-box">
          <div class="meta-title">Billed To (Customer)</div>
          <strong>${data.customer.name}</strong><br/>
          ${data.customer.billingAddress}<br/>
          State: ${data.customer.state} (State Code: ${data.customer.stateCode})<br/>
          GSTIN: <strong>${data.customer.gstin}</strong><br/>
          Email: ${data.customer.email}
        </td>
        <td style="width: 4%;"></td>
        <td class="meta-box">
          <div class="meta-title">Shipped To (Place of Supply)</div>
          <strong>${data.customer.name}</strong><br/>
          ${data.customer.shippingAddress}<br/>
          State of Supply: <strong>${data.customer.state}</strong> (Code: ${data.customer.stateCode})<br/>
          Phone: ${data.customer.phone}
        </td>
      </tr>
    </table>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Description of Goods</th>
          <th style="text-align: center;">HSN</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Subtotal</th>
          <th style="text-align: right;">Discount</th>
          <th style="text-align: right;">Taxable Val</th>
          ${
            data.pricing.isSameState
              ? `<th style="text-align: right;">CGST</th><th style="text-align: right;">SGST</th>`
              : `<th style="text-align: right;">IGST</th>`
          }
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHtml}
      </tbody>
    </table>

    <div style="overflow: hidden; margin-top: 15px;">
      <table class="summary-table">
        <tr>
          <td>Gross Subtotal:</td>
          <td style="text-align: right;">₹${formatINR(data.pricing.grossSubtotal)}</td>
        </tr>
        <tr>
          <td>Less: Coupon Discount:</td>
          <td style="text-align: right; color: #dc2626;">- ₹${formatINR(data.pricing.discountAmount)}</td>
        </tr>
        <tr>
          <td><strong>Net Taxable Value:</strong></td>
          <td style="text-align: right;"><strong>₹${formatINR(data.pricing.netTaxableAmount)}</strong></td>
        </tr>
        ${
          data.pricing.isSameState
            ? `
          <tr>
            <td>Central GST (CGST):</td>
            <td style="text-align: right;">₹${formatINR(data.pricing.totalCgst)}</td>
          </tr>
          <tr>
            <td>State GST (SGST):</td>
            <td style="text-align: right;">₹${formatINR(data.pricing.totalSgst)}</td>
          </tr>
        `
            : `
          <tr>
            <td>Integrated GST (IGST):</td>
            <td style="text-align: right;">₹${formatINR(data.pricing.totalIgst)}</td>
          </tr>
        `
        }
        <tr>
          <td>Shipping Charge:</td>
          <td style="text-align: right;">₹${formatINR(data.pricing.shippingAmount)}</td>
        </tr>
        <tr class="total-row">
          <td>Grand Total:</td>
          <td style="text-align: right;">₹${formatINR(data.pricing.totalAmount)}</td>
        </tr>
      </table>
    </div>

    <div style="clear: both;"></div>

    <div class="words-box">
      <strong>Amount in Words:</strong> ${data.pricing.amountInWords}
    </div>

    <div class="footer">
      This is a computer-generated GST Tax Invoice issued under Rule 46 of CGST Rules, 2017.<br/>
      Thank you for shopping with <strong>${data.supplier.brandName}</strong>!
    </div>
  </div>
</body>
</html>
    `;
  }

  async generateInvoicePdfBuffer(orderId: string, userId: string): Promise<Buffer> {
    const data = await this.getInvoiceData(orderId, userId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const formatINR = (paise: number) => (paise / 100).toFixed(2);

      // Header
      doc.fontSize(20).fillColor("#111827").text("TAX INVOICE", 40, 40);
      doc.fontSize(9).fillColor("#6b7280").text("Rule 46 CGST Rules, 2017", 40, 65);

      doc.fontSize(16).fillColor("#4f46e5").text(data.supplier.brandName, 400, 40, { align: "right" });
      doc.fontSize(9).fillColor("#374151").text(data.supplier.companyName, 300, 60, { align: "right" });
      doc.text(`GSTIN: ${data.supplier.gstin}`, 300, 72, { align: "right" });

      doc.moveTo(40, 90).lineTo(550, 90).strokeColor("#e5e7eb").stroke();

      // Info Grid
      let y = 100;
      doc.fontSize(10).fillColor("#111827").text("Supplier Details:", 40, y);
      doc.fontSize(9).fillColor("#4b5563")
        .text(`${data.supplier.companyName}`, 40, y + 15)
        .text(`${data.supplier.addressLine1}, ${data.supplier.city}, ${data.supplier.state} - ${data.supplier.pincode}`)
        .text(`State Code: ${data.supplier.stateCode} | PAN: ${data.supplier.pan}`)
        .text(`Email: ${data.supplier.email}`);

      doc.fontSize(10).fillColor("#111827").text("Invoice Details:", 320, y);
      doc.fontSize(9).fillColor("#4b5563")
        .text(`Invoice No: ${data.invoice.number}`, 320, y + 15)
        .text(`Invoice Date: ${new Date(data.invoice.date).toLocaleDateString("en-IN")}`)
        .text(`Order ID: #${data.invoice.orderId}`)
        .text(`Payment: ${data.invoice.paymentStatus} (${data.invoice.paymentMethod})`);

      y += 75;
      doc.moveTo(40, y).lineTo(550, y).strokeColor("#e5e7eb").stroke();

      y += 10;
      doc.fontSize(10).fillColor("#111827").text("Billed & Shipped To:", 40, y);
      doc.fontSize(9).fillColor("#4b5563")
        .text(`Customer: ${data.customer.name}`, 40, y + 15)
        .text(`Address: ${data.customer.shippingAddress}`)
        .text(`Place of Supply: ${data.customer.state} (State Code: ${data.customer.stateCode})`)
        .text(`GSTIN: ${data.customer.gstin}`);

      y += 65;

      // Table Headers
      doc.rect(40, y, 510, 20).fill("#1f2937");
      doc.fontSize(8).fillColor("#ffffff")
        .text("#", 45, y + 5)
        .text("Description", 65, y + 5)
        .text("HSN", 210, y + 5)
        .text("Qty", 250, y + 5)
        .text("Price", 280, y + 5)
        .text("Disc", 330, y + 5)
        .text("Taxable", 380, y + 5)
        .text(data.pricing.isSameState ? "CGST+SGST" : "IGST", 440, y + 5)
        .text("Total", 505, y + 5);

      y += 20;

      // Items
      data.items.forEach((item, index) => {
        if (index % 2 === 1) {
          doc.rect(40, y, 510, 18).fill("#f9fafb");
        }
        const taxStr = data.pricing.isSameState
          ? `${item.cgstRate + item.sgstRate}%`
          : `${item.igstRate}%`;

        doc.fontSize(8).fillColor("#111827")
          .text(`${item.itemNo}`, 45, y + 4)
          .text(`${item.description.slice(0, 28)}`, 65, y + 4)
          .text(`${item.hsnCode}`, 210, y + 4)
          .text(`${item.quantity}`, 250, y + 4)
          .text(`₹${formatINR(item.unitPrice)}`, 280, y + 4)
          .text(`₹${formatINR(item.discount)}`, 330, y + 4)
          .text(`₹${formatINR(item.taxableValue)}`, 380, y + 4)
          .text(taxStr, 440, y + 4)
          .text(`₹${formatINR(item.totalLineAmount)}`, 505, y + 4);

        y += 18;
      });

      y += 15;
      doc.moveTo(40, y).lineTo(550, y).strokeColor("#e5e7eb").stroke();

      y += 10;
      // Summary
      doc.fontSize(9).fillColor("#374151")
        .text(`Gross Subtotal: ₹${formatINR(data.pricing.grossSubtotal)}`, 350, y, { align: "right" })
        .text(`Discount: - ₹${formatINR(data.pricing.discountAmount)}`, 350, y + 14, { align: "right" })
        .text(`Net Taxable Value: ₹${formatINR(data.pricing.netTaxableAmount)}`, 350, y + 28, { align: "right" });

      if (data.pricing.isSameState) {
        doc.text(`CGST: ₹${formatINR(data.pricing.totalCgst)}`, 350, y + 42, { align: "right" })
           .text(`SGST: ₹${formatINR(data.pricing.totalSgst)}`, 350, y + 56, { align: "right" })
           .text(`Shipping: ₹${formatINR(data.pricing.shippingAmount)}`, 350, y + 70, { align: "right" });
        y += 84;
      } else {
        doc.text(`IGST: ₹${formatINR(data.pricing.totalIgst)}`, 350, y + 42, { align: "right" })
           .text(`Shipping: ₹${formatINR(data.pricing.shippingAmount)}`, 350, y + 56, { align: "right" });
        y += 70;
      }

      doc.rect(340, y, 210, 22).fill("#111827");
      doc.fontSize(10).fillColor("#ffffff").text(`Grand Total: ₹${formatINR(data.pricing.totalAmount)}`, 350, y + 6, { align: "right" });

      y += 35;
      doc.fontSize(9).fillColor("#111827").text(`Amount in Words: ${data.pricing.amountInWords}`, 40, y);

      doc.fontSize(8).fillColor("#9ca3af").text("Computer generated GST Tax Invoice under Rule 46 of CGST Rules, 2017.", 40, 780, { align: "center" });

      doc.end();
    });
  }
}

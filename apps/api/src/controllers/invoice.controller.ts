import { Request, Response } from "express";
import { InvoiceService } from "../services/invoice.service.js";
import { ResponseHandler } from "../lib/response.js";

export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  getInvoiceData = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const orderId = req.params.orderId as string;
    const data = await this.invoiceService.getInvoiceData(orderId, userId);
    return ResponseHandler.success(res, data, "Invoice data fetched successfully");
  };

  getInvoiceHtml = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const orderId = req.params.orderId as string;
    const html = await this.invoiceService.renderInvoiceHtml(orderId, userId);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  };

  getInvoicePdf = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const orderId = req.params.orderId as string;
    const pdfBuffer = await this.invoiceService.generateInvoicePdfBuffer(orderId, userId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Tax-Invoice-${orderId}.pdf"`,
    );
    return res.status(200).send(pdfBuffer);
  };
}

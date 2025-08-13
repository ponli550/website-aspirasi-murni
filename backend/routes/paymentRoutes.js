const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const puppeteer = require('puppeteer');

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('studentId', 'name')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get payments by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.params.studentId })
      .populate('studentId', 'name')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get payments by month and year
router.get('/month/:month/year/:year', async (req, res) => {
  try {
    const payments = await Payment.find({
      month: req.params.month,
      year: parseInt(req.params.year)
    })
      .populate('studentId', 'name')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export e-invoice as PDF
router.get('/export/einvoice/pdf', async (req, res) => {
  console.log('PDF route reached!');
  try {
    const { month, year, studentId } = req.query;
    console.log('PDF Export Request:', { month, year, studentId });
    
    // Validate required parameters
    if (!month || !year) {
      console.log('Validation failed: Missing month or year');
      return res.status(400).json({ message: 'Month and year are required for PDF export' });
    }
    
    // Convert month name to number if needed
    const monthNames = {
      'January': 1, 'February': 2, 'March': 3, 'April': 4,
      'May': 5, 'June': 6, 'July': 7, 'August': 8,
      'September': 9, 'October': 10, 'November': 11, 'December': 12
    };
    
    let monthNumber = month;
    if (isNaN(month)) {
      monthNumber = monthNames[month];
      if (!monthNumber) {
        return res.status(400).json({ message: 'Invalid month name provided' });
      }
    } else {
      monthNumber = parseInt(month);
    }
    
    // Build query based on filters
    let query = {};
    if (monthNumber && year) {
      query.month = monthNumber;
      query.year = parseInt(year);
    }
    if (studentId) {
      query.studentId = studentId;
    }
    
    const payments = await Payment.find(query)
      .populate('studentId', 'name phone email')
      .sort({ paymentDate: -1 });
    
    // Company information
    const companyInfo = {
      name: 'Pusat Tuisyen Aspirasi Murni',
      registrationNumber: '202403330624 (003678967-P)',
      email: 'puterizamrud@gmail.com',
      address: 'NO 56-1, JALAN SERI IMPIAN 8/1B,BANDAR SERI IMPIAN,86000 KLUANG,JOHOR',
      currency: 'RM'
    };
    
    // Generate HTML content for PDF
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>E-Invoice Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
        .company-info { margin-bottom: 30px; background: #f8f9fa; padding: 15px; border-radius: 5px; }
        .invoice-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .invoice-table th { background-color: #007bff; color: white; }
        .invoice-table tr:nth-child(even) { background-color: #f2f2f2; }
        .total-row { font-weight: bold; background-color: #e9ecef !important; }
        .page-break { page-break-before: always; }
        h1 { color: #007bff; margin: 0; }
        h2 { color: #495057; border-bottom: 1px solid #dee2e6; padding-bottom: 10px; }
        .info-row { margin: 5px 0; }
        .label { font-weight: bold; display: inline-block; width: 200px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>E-INVOICE REPORT</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-MY')}</p>
      </div>
      
      <div class="company-info">
        <h2>Company Information</h2>
        <div class="info-row"><span class="label">Nama Pusat Tuisyen:</span> ${companyInfo.name}</div>
        <div class="info-row"><span class="label">Nombor Pendaftaran:</span> ${companyInfo.registrationNumber}</div>
        <div class="info-row"><span class="label">Email:</span> ${companyInfo.email}</div>
        <div class="info-row"><span class="label">Alamat:</span> ${companyInfo.address}</div>
        <div class="info-row"><span class="label">Kod Mata Wang:</span> ${companyInfo.currency}</div>
      </div>
      
      <h2>Invoice Details</h2>
      <table class="invoice-table">
        <thead>
          <tr>
            <th>Nombor e-Invois</th>
            <th>Tarikh e-Invois</th>
            <th>Nama Pembeli</th>
            <th>Keterangan Perkhidmatan</th>
            <th>Harga Unit (${companyInfo.currency})</th>
            <th>Jenis Cukai</th>
            <th>Jumlah Cukai (${companyInfo.currency})</th>
            <th>Jumlah Termasuk Cukai (${companyInfo.currency})</th>
          </tr>
        </thead>
        <tbody>`;
    
    let totalAmount = 0;
    payments.forEach((payment) => {
      const invoiceNumber = `INV-${payment._id.toString().slice(-8).toUpperCase()}`;
      const buyerName = payment.studentId.name || payment.studentId.recordedName || 'N/A';
      const serviceDescription = `Tuition fees for ${payment.month} ${payment.year}`;
      totalAmount += payment.amount;
      
      htmlContent += `
          <tr>
            <td>${invoiceNumber}</td>
            <td>${payment.paymentDate.toLocaleDateString('en-MY')}</td>
            <td>${buyerName}</td>
            <td>${serviceDescription}</td>
            <td>${payment.amount.toFixed(2)}</td>
            <td>Standard Rate</td>
            <td>0.00</td>
            <td>${payment.amount.toFixed(2)}</td>
          </tr>`;
    });
    
    htmlContent += `
          <tr class="total-row">
            <td colspan="7"><strong>JUMLAH KESELURUHAN</strong></td>
            <td><strong>${totalAmount.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
      
      <div style="margin-top: 30px; font-size: 12px; color: #666;">
        <p><strong>Pengelasan:</strong> Perbelanjaan Am</p>
        <p><strong>Jenis e-Invois:</strong> Invois</p>
        <p><strong>Total Invoices:</strong> ${payments.length}</p>
        <p><strong>Report Generated:</strong> ${new Date().toLocaleString('en-MY')}</p>
      </div>
    </body>
    </html>`;
    
    // Generate PDF using Puppeteer
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });
      
      await browser.close();
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="einvoice-report-${Date.now()}.pdf"`);
      res.end(pdfBuffer, 'binary');
      
    } catch (puppeteerError) {
       if (browser) {
         await browser.close();
       }
       throw new Error(`PDF generation failed: ${puppeteerError.message}`);
     }
    
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ message: 'Error generating PDF', error: err.message });
  }
});

// Export e-invoice for payments
router.get('/export/einvoice/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { month, year, studentId } = req.query;
    
    // Build query based on filters
    let query = {};
    if (month && year) {
      query.month = month;
      query.year = parseInt(year);
    }
    if (studentId) {
      query.student = studentId;
    }
    
    const payments = await Payment.find(query)
      .populate('studentId', 'name phone email')
      .sort({ paymentDate: -1 });
    
    // Company information
    const companyInfo = {
      name: 'Pusat Tuisyen Aspirasi Murni',
      registrationNumber: '202403330624 (003678967-P)',
      email: 'puterizamrud@gmail.com',
      address: 'NO 56-1, JALAN SERI IMPIAN 8/1B,BANDAR SERI IMPIAN,86000 KLUANG,JOHOR',
      currency: 'RM'
    };
    
    if (format === 'json') {
      const einvoiceData = {
        companyInfo,
        invoices: payments.map((payment, index) => ({
          invoiceNumber: `INV-${payment._id.toString().slice(-8).toUpperCase()}`,
          invoiceDate: payment.paymentDate.toISOString(),
          buyer: {
            name: payment.student.name || payment.student.recordedName || '',
            contactNumber: payment.student.contactNumber || '',
            email: payment.student.email || ''
          },
          serviceDescription: `Tuition fees for ${payment.month} ${payment.year}`,
          unitPrice: payment.amount,
          taxType: 'Standard Rate',
          taxAmount: 0,
          totalExcludingTax: payment.amount,
          totalIncludingTax: payment.amount,
          totalAmountPayable: payment.amount,
          paymentMethod: payment.paymentMethod,
          classification: 'General Expenses'
        }))
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="einvoice-${Date.now()}.json"`);
      res.json(einvoiceData);
    } else if (format === 'xml') {
      let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xmlContent += '<EInvoices>\n';
      xmlContent += '  <CompanyInfo>\n';
      xmlContent += `    <Name>${companyInfo.name}</Name>\n`;
      xmlContent += `    <RegistrationNumber>${companyInfo.registrationNumber}</RegistrationNumber>\n`;
      xmlContent += `    <Email>${companyInfo.email}</Email>\n`;
      xmlContent += `    <Address>${companyInfo.address}</Address>\n`;
      xmlContent += `    <Currency>${companyInfo.currency}</Currency>\n`;
      xmlContent += '  </CompanyInfo>\n';
      xmlContent += '  <Invoices>\n';
      
      payments.forEach((payment) => {
        const invoiceNumber = `INV-${payment._id.toString().slice(-8).toUpperCase()}`;
        xmlContent += '    <Invoice>\n';
        xmlContent += `      <InvoiceNumber>${invoiceNumber}</InvoiceNumber>\n`;
        xmlContent += `      <InvoiceDate>${payment.paymentDate.toISOString()}</InvoiceDate>\n`;
        xmlContent += '      <Buyer>\n';
        xmlContent += `        <Name>${payment.student.name || payment.student.recordedName || ''}</Name>\n`;
        xmlContent += `        <ContactNumber>${payment.student.contactNumber || ''}</ContactNumber>\n`;
        xmlContent += `        <Email>${payment.student.email || ''}</Email>\n`;
        xmlContent += '      </Buyer>\n';
        xmlContent += `      <ServiceDescription>Tuition fees for ${payment.month} ${payment.year}</ServiceDescription>\n`;
        xmlContent += `      <UnitPrice>${payment.amount}</UnitPrice>\n`;
        xmlContent += `      <TaxType>Standard Rate</TaxType>\n`;
        xmlContent += `      <TaxAmount>0</TaxAmount>\n`;
        xmlContent += `      <TotalExcludingTax>${payment.amount}</TotalExcludingTax>\n`;
        xmlContent += `      <TotalIncludingTax>${payment.amount}</TotalIncludingTax>\n`;
        xmlContent += `      <TotalAmountPayable>${payment.amount}</TotalAmountPayable>\n`;
        xmlContent += `      <PaymentMethod>${payment.paymentMethod}</PaymentMethod>\n`;
        xmlContent += `      <Classification>General Expenses</Classification>\n`;
        xmlContent += '    </Invoice>\n';
      });
      
      xmlContent += '  </Invoices>\n';
      xmlContent += '</EInvoices>';
      
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="einvoice-${Date.now()}.xml"`);
      res.send(xmlContent);
    } else {
      res.status(400).json({ message: 'Invalid format. Use json or xml.' });
    }
  } catch (err) {
    console.error('Error exporting e-invoice:', err);
    res.status(500).json({ message: 'Error exporting e-invoice', error: err.message });
  }
});



// Get a single payment
router.get('/:id', getPayment, (req, res) => {
  res.json(res.payment);
});

// Create a new payment
router.post('/', async (req, res) => {
  // Check if student exists
  try {
    const studentId = req.body.student || req.body.studentId;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();
    const month = paymentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1 for 1-12
    const year = paymentDate.getFullYear();

    const payment = new Payment({
      studentId: studentId,
      amount: req.body.amount,
      paymentMethod: req.body.paymentMethod,
      paymentDate: paymentDate,
      description: req.body.description,
      receiptNumber: req.body.receiptNumber,
      month: month,
      year: year
    });

    const newPayment = await payment.save();
    res.status(201).json(newPayment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a payment
router.patch('/:id', getPayment, async (req, res) => {
  if (req.body.amount != null) {
    res.payment.amount = req.body.amount;
  }
  if (req.body.paymentMethod != null) {
    res.payment.paymentMethod = req.body.paymentMethod;
  }
  if (req.body.paymentDate != null) {
    res.payment.paymentDate = new Date(req.body.paymentDate);
    res.payment.month = res.payment.paymentDate.toLocaleString('default', { month: 'long' });
    res.payment.year = res.payment.paymentDate.getFullYear();
  }
  if (req.body.description != null) {
    res.payment.description = req.body.description;
  }
  if (req.body.receiptNumber != null) {
    res.payment.receiptNumber = req.body.receiptNumber;
  }
  res.payment.updatedAt = Date.now();

  try {
    const updatedPayment = await res.payment.save();
    res.json(updatedPayment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a payment
router.delete('/:id', getPayment, async (req, res) => {
  try {
    await Payment.deleteOne({ _id: req.params.id });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get payment by ID
async function getPayment(req, res, next) {
  let payment;
  try {
    payment = await Payment.findById(req.params.id).populate('studentId', 'name');
    if (payment == null) {
      return res.status(404).json({ message: 'Payment not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.payment = payment;
  next();
}

module.exports = router;
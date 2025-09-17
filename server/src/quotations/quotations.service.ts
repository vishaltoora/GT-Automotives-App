import { Injectable, NotFoundException } from '@nestjs/common';
import { QuotationRepository } from './repositories/quotation.repository';
import { CreateQuoteDto } from '@gt-automotive/shared-dto';
import { UpdateQuoteDto } from '@gt-automotive/shared-dto';
import { Quotation, QuotationItem, Tire } from '@prisma/client';
import { PrismaService } from '@gt-automotive/database';

type QuotationWithItems = Quotation & {
  items: (QuotationItem & {
    tire: Tire;
  })[];
};

@Injectable()
export class QuotationsService {
  constructor(
    private quotationRepository: QuotationRepository,
    private prisma: PrismaService
  ) {}

  async create(createQuoteDto: CreateQuoteDto, userId: string): Promise<Quotation> {
    console.log('Service: Starting quotation creation...');
    console.log('Service: Received data:', JSON.stringify(createQuoteDto, null, 2));

    try {
      const { items, ...quoteData } = createQuoteDto;

      // Get customer information
      const customer = await this.prisma.customer.findUnique({
        where: { id: createQuoteDto.customerId }
      });

      if (!customer) {
        throw new Error(`Customer not found: ${createQuoteDto.customerId}`);
      }

      const customerName = `${customer.firstName} ${customer.lastName}`.trim();

      // Generate quotation number
      const quotationNumber = `Q${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      console.log('Service: Generated quotation number:', quotationNumber);

      // Calculate totals
      let subtotal = 0;
      const processedItems = items.map(item => {
        const total = item.quantity * item.unitPrice;
        subtotal += total;
        return {
          ...item,
          total,
        };
      });
      console.log('Service: Processed items count:', processedItems.length);

      // Calculate taxes
      const gstRate = quoteData.gstRate ?? 0.05; // Default 5% GST
      const pstRate = quoteData.pstRate ?? 0.07; // Default 7% PST
      const gstAmount = subtotal * gstRate;
      const pstAmount = subtotal * pstRate;
      const taxRate = gstRate + pstRate;
      const taxAmount = gstAmount + pstAmount;
      const total = subtotal + taxAmount;

      console.log('Service: Calculated totals - subtotal:', subtotal, 'total:', total);

      // Set valid until date if not provided (30 days from now)
      const validUntil = quoteData.validUntil 
        ? new Date(quoteData.validUntil)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      console.log('Service: About to call repository create...');
      
      const result = await this.quotationRepository.create({
        ...quoteData,
        quotationNumber,
        customerName,
        businessName: customer.businessName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        subtotal,
        gstRate,
        gstAmount,
        pstRate,
        pstAmount,
        taxRate,
        taxAmount,
        total,
        validUntil,
        status: quoteData.status || 'DRAFT',
        createdBy: userId,
        items: {
          create: processedItems,
        },
      });
      
      console.log('Service: Successfully created quotation:', result.id);
      return result;
    } catch (error) {
      console.error('Service: Error creating quotation:', error);
      throw error;
    }
  }

  async findAll(): Promise<Quotation[]> {
    return this.quotationRepository.findAll();
  }

  async findOne(id: string): Promise<Quotation> {
    const quotation = await this.quotationRepository.findOne(id);
    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }
    return quotation;
  }

  async update(
    id: string,
    updateQuoteDto: UpdateQuoteDto
  ): Promise<Quotation> {
    const existingQuotation = await this.findOne(id);

    const { items, ...quoteData } = updateQuoteDto;

    // If items are being updated, recalculate totals
    if (items) {
      // Delete existing items
      await this.quotationRepository.deleteItems(id);

      // Calculate new totals
      let subtotal = 0;
      const processedItems = items.map(item => {
        const total = item.quantity * item.unitPrice;
        subtotal += total;
        return {
          ...item,
          quotationId: id,
          total,
        };
      });

      // Calculate taxes
      const gstRate = quoteData.gstRate ?? existingQuotation.gstRate ?? 0.05;
      const pstRate = quoteData.pstRate ?? existingQuotation.pstRate ?? 0.07;
      const gstAmount = subtotal * Number(gstRate);
      const pstAmount = subtotal * Number(pstRate);
      const taxRate = Number(gstRate) + Number(pstRate);
      const taxAmount = gstAmount + pstAmount;
      const total = subtotal + taxAmount;

      // Create new items
      await this.quotationRepository.createItems(processedItems);

      // Update quotation with new totals
      return this.quotationRepository.update(id, {
        ...quoteData,
        subtotal,
        gstRate,
        gstAmount,
        pstRate,
        pstAmount,
        taxRate,
        taxAmount,
        total,
      });
    }

    // If no items update, just update the quotation data
    return this.quotationRepository.update(id, quoteData);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists
    await this.quotationRepository.delete(id);
  }

  async search(params: {
    customerName?: string;
    quotationNumber?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Quotation[]> {
    return this.quotationRepository.search(params);
  }

  async convertToInvoice(quotationId: string, customerId: string, vehicleId?: string): Promise<any> {
    const quotation = await this.quotationRepository.findOne(quotationId) as QuotationWithItems;
    
    if (quotation.status === 'CONVERTED') {
      throw new Error('Quotation has already been converted to an invoice');
    }

    // Create invoice from quotation
    const invoice = await this.prisma.invoice.create({
      data: {
        customerId,
        vehicleId,
        subtotal: quotation.subtotal,
        taxRate: quotation.taxRate,
        taxAmount: quotation.taxAmount,
        gstRate: quotation.gstRate,
        gstAmount: quotation.gstAmount,
        pstRate: quotation.pstRate,
        pstAmount: quotation.pstAmount,
        total: quotation.total,
        status: 'PENDING',
        notes: quotation.notes,
        createdBy: quotation.createdBy,
        items: {
          create: quotation.items.map(item => ({
            tireId: item.tireId,
            itemType: item.itemType,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: {
        customer: true,
        vehicle: true,
        items: {
          include: {
            tire: true,
          },
        },
      },
    });

    // Update quotation status
    await this.quotationRepository.convertToInvoice(quotationId, invoice.id);

    return invoice;
  }
}
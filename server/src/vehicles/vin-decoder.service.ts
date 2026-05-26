import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { DecodeVinResponseDto } from '../common/dto/vehicle.dto';

interface NhtsaDecodeResponse {
  Count?: number;
  Message?: string;
  Results?: NhtsaDecodeResult[];
}

interface NhtsaDecodeResult {
  VIN?: string;
  Make?: string;
  Model?: string;
  ModelYear?: string;
  Trim?: string;
  BodyClass?: string;
  VehicleType?: string;
  EngineModel?: string;
  DisplacementL?: string;
  FuelTypePrimary?: string;
  ErrorCode?: string;
  ErrorText?: string;
}

interface NhtsaModelsResponse {
  Count?: number;
  Message?: string;
  Results?: NhtsaModelResult[];
}

interface NhtsaModelResult {
  Model_Name?: string;
}

const NHTSA_VPIC_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

@Injectable()
export class VinDecoderService {
  async decode(vin: string, modelYear?: number): Promise<DecodeVinResponseDto> {
    const normalizedVin = this.normalizeVin(vin);

    if (!VIN_PATTERN.test(normalizedVin)) {
      throw new BadRequestException(
        'VIN must be 17 characters and cannot contain I, O, or Q',
      );
    }

    const params = new URLSearchParams({ format: 'json' });
    if (modelYear) {
      params.set('modelyear', String(modelYear));
    }

    const url = `${NHTSA_VPIC_BASE_URL}/DecodeVinValues/${encodeURIComponent(normalizedVin)}?${params.toString()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new BadGatewayException('VIN decoder provider returned an error');
      }

      const payload = (await response.json()) as NhtsaDecodeResponse;
      const decoded = payload.Results?.[0];

      if (!decoded) {
        throw new BadGatewayException('VIN decoder provider returned no results');
      }

      return this.mapDecodedVin(normalizedVin, decoded);
    } catch (error: any) {
      if (
        error instanceof BadGatewayException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error?.name === 'AbortError') {
        throw new RequestTimeoutException('VIN decoder request timed out');
      }

      throw new BadGatewayException('Unable to decode VIN at this time');
    } finally {
      clearTimeout(timeout);
    }
  }

  async getModelsForMake(make: string): Promise<string[]> {
    const normalizedMake = make.trim();

    if (!normalizedMake) {
      throw new BadRequestException('Make is required');
    }

    const url = `${NHTSA_VPIC_BASE_URL}/GetModelsForMake/${encodeURIComponent(normalizedMake)}?format=json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new BadGatewayException('Vehicle model provider returned an error');
      }

      const payload = (await response.json()) as NhtsaModelsResponse;
      const models = (payload.Results || [])
        .map((result) => this.cleanValue(result.Model_Name))
        .filter((model): model is string => Boolean(model));

      return [...new Set(models)].sort((a, b) => a.localeCompare(b));
    } catch (error: any) {
      if (
        error instanceof BadGatewayException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error?.name === 'AbortError') {
        throw new RequestTimeoutException('Vehicle model request timed out');
      }

      throw new BadGatewayException('Unable to load vehicle models at this time');
    } finally {
      clearTimeout(timeout);
    }
  }

  private normalizeVin(vin: string): string {
    return String(vin || '')
      .trim()
      .toUpperCase()
      .replace(/\s/g, '');
  }

  private mapDecodedVin(
    vin: string,
    decoded: NhtsaDecodeResult,
  ): DecodeVinResponseDto {
    const year = decoded.ModelYear ? Number(decoded.ModelYear) : undefined;
    const warnings = this.extractWarnings(decoded);
    const engine = [decoded.EngineModel, decoded.DisplacementL && `${decoded.DisplacementL}L`]
      .filter(Boolean)
      .join(' ');

    return {
      vin,
      make: this.cleanValue(decoded.Make),
      model: this.cleanValue(decoded.Model),
      year: Number.isInteger(year) ? year : undefined,
      trim: this.cleanValue(decoded.Trim),
      bodyClass: this.cleanValue(decoded.BodyClass),
      vehicleType: this.cleanValue(decoded.VehicleType),
      engine: this.cleanValue(engine),
      fuelType: this.cleanValue(decoded.FuelTypePrimary),
      warnings,
      rawProvider: 'NHTSA_VPIC',
    };
  }

  private extractWarnings(decoded: NhtsaDecodeResult): string[] {
    const warnings: string[] = [];

    if (decoded.ErrorCode && decoded.ErrorCode !== '0') {
      warnings.push(`NHTSA code ${decoded.ErrorCode}`);
    }

    const errorText = this.cleanValue(decoded.ErrorText);
    if (errorText && errorText.toLowerCase() !== '0 - vin decoded clean. check digit (9th position) is correct') {
      warnings.push(errorText);
    }

    return warnings;
  }

  private cleanValue(value?: string): string | undefined {
    const cleaned = value?.trim();
    return cleaned || undefined;
  }
}

import { PartialType, OmitType } from '@gt-automotive/data';
import { CreateVehicleDto } from './create-vehicle.dto';

export class UpdateVehicleDto extends PartialType(
  OmitType(CreateVehicleDto, ['customerId'] as const)
) {}
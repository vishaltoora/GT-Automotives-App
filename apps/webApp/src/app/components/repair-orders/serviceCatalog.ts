import { ROServiceType } from '../../requests/repair-order.requests';

/**
 * Service catalog for GT Automotives repair orders.
 *
 * Grouped into categories. Each item pre-fills the "Add Service" form with a
 * description, type, and a suggested unit price (advisor can adjust per job).
 * A unitPrice of 0 means "quote required".
 */

export interface CatalogService {
  description: string;
  type: ROServiceType;
  /** Suggested starting price; 0 means "quote required". */
  unitPrice: number;
}

export interface CatalogCategory {
  name: string;
  services: CatalogService[];
}

/**
 * Raw catalog: category name -> list of service descriptions (or
 * [description, price] tuples to set a suggested price). Defaults to LABOR
 * type with a "quote" price of 0.
 */
const RAW_CATALOG: Record<string, Array<string | [string, number]>> = {
  'Maintenance Services': [
    '80,000 Mile Service',
    '85 POINT INSPECTION 0104',
    '85,000 Mile Service',
    '90,000 Mile Service',
    '95,000 Mile Service',
    'CHANGE OIL AND FILTER, 27 POINT INSPECTION & LUBRICATION 101',
  ],
  'A/C Services': [
    'A/C COMPRESSOR & EVAPORATOR SERVICE & ODOUR CONTROL 2430',
    'A/C Evacuate and Recharge',
    'A/C Expansion Block/Orifice Tube',
    'A/C Stepper Motor',
    'A/C Suction Line',
  ],
  'Transmission (A/T)': [
    'A/T - Accumulator',
    'A/T - Band',
    'A/T - Band Apply Servo',
    'A/T - Band Apply Servo Switch',
    'A/T - Band Control Solenoid Valve',
    'A/T - Barometric Pressure Sensor',
  ],
  'AdBlue': [
    'AdBlue Tank',
    'AdBlue® Service',
  ],
  'Brakes': [
    'Adjust and lubricate parking brake',
  ],
  'Air Bag System': [
    'Air Bag - Clockspring Assembly / Spiral Cable',
    'Air Bag - Control Module',
    'Air Bag - Diagnostic Connector',
    'Air Bag - Harness',
  ],
  'Cooling System': [
    'After-Run Coolant Pump',
    'After-Run Coolant Solenoid Valve',
  ],
  'Lighting / Headlamp': [
    'AIM HEADLIGHTS 2330',
    'Headlamp - High Beam Relay',
    'Headlamp Adjusting Screw',
    'Headlamp Alignment Actuator',
    'Headlamp Alignment Control Module',
    'Headlamp Alignment Sensor',
    'Headlamp Alignment Switch',
    'Headlamp Control Module',
    'Headlamp Cover',
    'Headlamp Dimmer Relay',
    'Headlamp Dimmer Sensor',
    'Headlamp Dimmer Switch',
    'Headlamp Unit',
    'Headlamp Washer Ambient Temperature Sensor',
    'Headlamp Washer Hose',
    'Headlamp Washer Motor',
    'Headlamp Washer Motor Relay',
    'Headlamp Washer Pump',
    'Headlamp Washer Reservoir',
    'Headlamp Washer Switch',
    'Headlamp Wiper Arm',
    'Headlamp Wiper Blade',
    'Headlamp Wiper Gear Box',
  ],
  'Axle / Suspension': [
    'Axle Beam Bushing',
    'Axle Nut',
    'Axle Replace - Front',
    'Axle Seal',
    'Ball Joint Replacement - Lower',
    'Ball Joint Replacement - Upper',
  ],
  'Electrical': [
    'Backup Lamp Pigtail Assembly',
    'Backup Lamp Pigtail Socket',
    'Backup Lamp Relay',
    'Battery Cable End Replacement',
    'Battery Cable Replacement',
    'Battery Control Module',
    'Battery Current Sensor',
    'Battery fails performance test',
    'Battery Heater',
    'Battery New - Hybrid',
    'BATTERY SERVICE - HIDDEN/SECONDARY BATTERY INSTALL BG ANTI CORROSION PADS 0831',
    'Battery Switch',
    'Battery Temperature Sensor',
  ],
  'Sensors': [
    'BARO / MAP Sensor Switching Valve',
    'Barometric Pressure Sensor',
    'Barometric Pressure Switch',
  ],
  'Exhaust / Emissions': [
    'Catalytic Converter Gaskets',
    'Catalytic Converter Heat Shield',
    'Catalytic Converter Heat Shield Clamp',
    'Catalytic Converter Mounting Gasket',
    'Charcoal Canister',
    'EVAP - Check Valve',
    'EVAP - Evaporative Vapor Pressure Sensor',
    'EVAP - Leak Detection Pump',
    'EVAP - Leak Detection Valve',
    'EVAP - Thermal Vacuum Valve',
    'Evap Canister Vent Valve',
    'Evap System Hose',
    'Evap System Vapor Line',
    'Exhaust',
    'Exhaust - Clamp',
    'Exhaust - Crossover Pipe',
    'Exhaust - Flange Gasket',
    'Exhaust - Pipe/Muffler Hanger',
    'ENVIRONMENTAL LEVY 1111',
  ],
  'Engine': [
    'Crankcase Vent',
    'Crankcase Vent Valves',
    'Crankshaft',
    'Crankshaft Fluctuation Sensor',
    'Crankshaft Main Bearing Seal',
    'Crankshaft Sensor',
    'Engine Accessory Bracket',
    'ENGINE BAY CLEAN 2319',
    'Engine Control Module',
    'Engine Coolant',
    'Engine Coolant Temperature Sensor',
    'Engine Cooling - Thermostat Gasket',
    'Engine Guide Pulley',
    'ENGINE HOT OIL FLUSH DIESEL SERVICE INCLUDES PREMIUM OIL SERVICE AND FILTER CHANGE',
    'ENGINE HOT OIL FLUSH SERVICE INCLUDES PREMIUM OIL SERVICE AND FILTER CHANGE',
    'Engine Mechanical Diagnostics 0901',
    'ENGINE MIL LIGHT ON - NO DRIVABILITY CONCERNS',
    'Engine Rebuild/Replace',
    'ENGINE SHAMPOO 2342',
    'Engine Tune Up',
    'Engine Wire Harness',
  ],
  'Fuel System': [
    'Fuel Pressure Check Valve',
    'Fuel Pressure Control Module',
    'Fuel Pressure Pulsation Damper',
    'Fuel Pressure Regulator',
    'Fuel Pressure Regulator Seal',
    'Fuel Pressure Release Valve',
    'Fuel Pressure Relief Valve',
    'Fuel Pressure Sensor',
    'Fuel Pump - Oil Pressure Switch',
    'Fuel Pump Access Cover',
    'Fuel Pump Ballast Resistor Relay',
  ],
  'Cruise Control': [
    'Cruise Control - Distance Sensor',
    'Cruise Control - Module',
    'Cruise Control - Relay',
    'Cruise Control - Servo',
    'Cruise Control - Servo Cable',
    'Cruise Control - Switch',
  ],
  'Cooling Fan': [
    'Fan Clutch',
    'Fan Control module',
    'Fan Shroud',
    'Fan/Drive Belt Replacement',
  ],
  'Interior / Body': [
    'Center Console',
    'Center Console Lid',
    'Center Console Wood Grain',
    'Center Door Roller',
    'Exterior View Display Monitor',
    'Fender Liner',
    'Flex Disk',
    'Flex Plate',
    'Floor Mats',
    'Floor Shifter Assembly',
  ],
  'Stability / Electronics': [
    'ESC Light',
    'ESP Control Module',
  ],
};

export const SERVICE_CATALOG: CatalogCategory[] = Object.entries(RAW_CATALOG).map(
  ([name, items]) => ({
    name,
    services: items.map((item) => {
      const [description, unitPrice] = Array.isArray(item) ? item : [item, 0];
      return { description, type: 'LABOR' as ROServiceType, unitPrice };
    }),
  })
);

/** Flattened list of all catalog services with their category, for search. */
export const ALL_CATALOG_SERVICES: Array<CatalogService & { category: string }> =
  SERVICE_CATALOG.flatMap((cat) =>
    cat.services.map((s) => ({ ...s, category: cat.name }))
  );

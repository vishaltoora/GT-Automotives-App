import { InspectionItemKind, InspectionPositionGroup, InspectionType, Prisma } from '@prisma/client';

export const PEACE_OF_MIND_TEMPLATE_SLUG = 'peace-of-mind-inspection';
export const OUT_OF_PROVINCE_TEMPLATE_SLUG = 'bc-out-of-province-inspection';

export interface InspectionTemplateItemSeed {
  label: string;
  kind: InspectionItemKind;
  isRequired?: boolean;
  positionGroup?: InspectionPositionGroup;
  unit?: string;
  options?: Prisma.InputJsonValue;
}

export interface InspectionTemplateSectionSeed {
  title: string;
  items: InspectionTemplateItemSeed[];
}

export interface InspectionTemplateSeed {
  name: string;
  slug: string;
  type: InspectionType;
  description: string;
  sections: InspectionTemplateSectionSeed[];
}

const conditionItem = (label: string, affectedParts: string[] = []): InspectionTemplateItemSeed => ({
  label,
  kind: InspectionItemKind.CONDITION,
  options: affectedParts.length ? { affectedParts } : undefined,
});

export const peaceOfMindTemplate: InspectionTemplateSeed = {
  name: 'Peace of Mind Inspection',
  slug: PEACE_OF_MIND_TEMPLATE_SLUG,
  type: InspectionType.PEACE_OF_MIND,
  description: 'General customer-friendly multi-point vehicle inspection.',
  sections: [
    {
      title: 'Interior / Exterior',
      items: [
        conditionItem('Bulbs and Lights', [
          'Low beam headlight',
          'High beam headlight',
          'Daytime running light',
          'Front turn signal bulb',
          'Rear turn signal bulb',
          'Brake light bulb',
          'Tail light bulb',
          'Reverse light bulb',
          'License plate light',
          'Fog light',
          'Marker light',
          'Interior dome light',
          'Dashboard warning light',
        ]),
        conditionItem('Windshield Washer Spray / Wiper Operation / Wiper Blades / Including Rear (if applicable)', [
          'Front wiper blade',
          'Rear wiper blade',
          'Washer nozzle',
          'Washer pump',
          'Washer hose',
          'Washer fluid reservoir',
          'Wiper arm',
          'Wiper motor',
        ]),
        conditionItem('Windshield / Window Condition', [
          'Windshield',
          'Rear window',
          'Driver front window',
          'Passenger front window',
          'Driver rear window',
          'Passenger rear window',
          'Window tint',
          'Stone chip',
          'Crack',
        ]),
        conditionItem('Upholstery / Carpet / Floor Mats / Mirrors / Trim', [
          'Driver seat',
          'Passenger seat',
          'Rear seat',
          'Carpet',
          'Floor mat',
          'Rear view mirror',
          'Driver side mirror',
          'Passenger side mirror',
          'Interior trim',
          'Door panel',
        ]),
        conditionItem('Emergency Brake Adjustment', [
          'Parking brake lever',
          'Parking brake pedal',
          'Parking brake cable',
          'Parking brake shoes',
          'Electronic parking brake',
        ]),
        conditionItem('Horn Operation', [
          'Horn switch',
          'Horn assembly',
          'Horn relay',
          'Clock spring',
        ]),
        conditionItem('Fuel Tank Cap Gasket', [
          'Fuel cap',
          'Fuel cap gasket',
          'Fuel filler neck',
          'Fuel door',
        ]),
        conditionItem('Clutch Operation (if equipped)', [
          'Clutch pedal',
          'Clutch hydraulic fluid',
          'Clutch master cylinder',
          'Clutch slave cylinder',
          'Clutch engagement',
        ]),
      ],
    },
    {
      title: 'Battery Performance',
      items: [
        conditionItem('Battery Terminals / Cables / Mountings', [
          'Positive battery terminal',
          'Negative battery terminal',
          'Battery cable',
          'Battery hold-down',
          'Battery tray',
          'Ground strap',
        ]),
        conditionItem('Check Condition of Battery (Storage Capacity Test if Applicable)', [
          'Battery state of charge',
          'Battery cold cranking amps',
          'Battery case',
          'Battery age',
          'Charging system',
          'Alternator output',
        ]),
      ],
    },
    {
      title: 'Under Hood',
      items: [
        conditionItem('Fluids: Oil / Coolant / Power Steering / Brake Fluid / Washer', [
          'Engine oil',
          'Coolant',
          'Brake fluid',
          'Power steering fluid',
          'Washer fluid',
          'Transmission fluid',
          'Fluid leak',
          'Fluid contamination',
        ]),
        conditionItem('Engine Air Filter', [
          'Engine air filter',
          'Air filter housing',
          'Intake duct',
          'Cabin air filter',
        ]),
        conditionItem('Belts / Tensioners (condition and adjustment)', [
          'Serpentine belt',
          'Drive belt',
          'A/C belt',
          'Alternator belt',
          'Belt tensioner',
          'Idler pulley',
          'Cracking',
          'Fraying',
          'Glazing',
        ]),
        conditionItem('Cooling System Hoses / Heater Hoses / Air Conditioning Hoses and Connections', [
          'Upper radiator hose',
          'Lower radiator hose',
          'Heater hose',
          'Coolant bypass hose',
          'A/C hose',
          'Hose clamp',
          'Coolant reservoir',
          'Water pump',
          'Thermostat housing',
        ]),
        conditionItem('Radiator Core / Air Conditioning Condenser (if equipped)', [
          'Radiator core',
          'Radiator fins',
          'A/C condenser',
          'Cooling fan',
          'Fan shroud',
          'Radiator cap',
        ]),
      ],
    },
    {
      title: 'Under Vehicle',
      items: [
        conditionItem('Shock Absorbers / Suspension', [
          'Front strut',
          'Rear shock absorber',
          'Coil spring',
          'Control arm',
          'Sway bar link',
          'Sway bar bushing',
          'Suspension bushing',
          'Wheel bearing',
        ]),
        conditionItem('Steering Gear Box / Linkage and Boots / Ball Joints / Dust Covers', [
          'Steering rack',
          'Steering gear box',
          'Inner tie rod',
          'Outer tie rod',
          'Ball joint',
          'Dust boot',
          'Power steering line',
          'Steering linkage',
        ]),
        conditionItem('Muffler / Exhaust Pipes / Mountings', [
          'Muffler',
          'Exhaust pipe',
          'Resonator',
          'Catalytic converter',
          'Exhaust hanger',
          'Exhaust clamp',
          'Flex pipe',
          'Heat shield',
        ]),
        conditionItem('Engine Oil and/or Fluid Leaks', [
          'Engine oil leak',
          'Coolant leak',
          'Transmission fluid leak',
          'Power steering leak',
          'Brake fluid leak',
          'Differential fluid leak',
          'Transfer case leak',
        ]),
        conditionItem('Drive Shaft Boots / Constant Velocity Boots / U-joints / Transmission Linkage (if equipped)', [
          'CV boot',
          'CV axle',
          'U-joint',
          'Drive shaft',
          'Transmission linkage',
          'Shift cable',
          'Axle seal',
        ]),
        conditionItem('Transmission / Differential / Transfer Case (Check Fluid Level, Fluid Condition and Fluid Leaks)', [
          'Transmission pan',
          'Transmission cooler line',
          'Front differential',
          'Rear differential',
          'Transfer case',
          'Drain plug',
          'Fill plug',
          'Axle seal',
        ]),
        conditionItem('Fuel Lines and Connections / Fuel Tank Band / Fuel Tank Vapor Vent System Hoses', [
          'Fuel line',
          'Fuel filter',
          'Fuel tank strap',
          'Fuel tank',
          'EVAP hose',
          'Vapor line',
          'Charcoal canister',
          'Fuel filler hose',
        ]),
        conditionItem('Inspect Nuts and Bolts on Body Chassis', [
          'Subframe bolt',
          'Body mount',
          'Crossmember',
          'Splash shield fastener',
          'Underbody panel',
          'Chassis bracket',
        ]),
      ],
    },
    {
      title: 'Tires',
      items: [
        {
          label: 'Tread Depth (measured in 1/32")',
          kind: InspectionItemKind.MEASUREMENT,
          isRequired: true,
          positionGroup: InspectionPositionGroup.TIRE_SET,
          unit: '1/32"',
          options: { values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], positions: ['LF', 'RF', 'LR', 'RR', 'Spare'] },
        },
        {
          label: 'Tire Pressure',
          kind: InspectionItemKind.MEASUREMENT,
          isRequired: true,
          unit: 'PSI',
          options: { values: ['26', '29', '30', '32', '33', '34', '35', '36', '38', '40', '42'] },
        },
        {
          label: 'Abnormal Wear Pattern of Tires',
          kind: InspectionItemKind.MULTI_SELECT,
          positionGroup: InspectionPositionGroup.TIRE_SET,
          options: { values: ['Inner Wear', 'Outer Wear', 'Cupping', 'Feathering'], positions: ['LF', 'RF', 'LR', 'RR'] },
        },
      ],
    },
    {
      title: 'Brakes',
      items: [
        {
          label: 'Check Brake Linings (measured in millimeters)',
          kind: InspectionItemKind.MEASUREMENT,
          isRequired: true,
          positionGroup: InspectionPositionGroup.BRAKE_SET,
          unit: 'mm',
          options: { values: ['DNI', 'VI', 'Drum', '1', '2', '3', '4', '5', '6', '7', '8'] },
        },
      ],
    },
  ],
};

export const outOfProvinceTemplate: InspectionTemplateSeed = {
  name: 'BC Out of Province Inspection',
  slug: OUT_OF_PROVINCE_TEMPLATE_SLUG,
  type: InspectionType.OUT_OF_PROVINCE,
  description: 'BC compliance-oriented inspection template for private vehicles registering from another jurisdiction.',
  sections: [
    {
      title: 'Vehicle Identification & Required Records',
      items: [
        conditionItem('VIN / public VIN / compliance label / odometer recording', [
          'Public VIN plate',
          'Federal compliance label',
          'Odometer',
          'Registration document',
          'Licence plate',
          'Vehicle description mismatch',
        ]),
        conditionItem('Modifications / non-OEM equipment / unsafe alterations', [
          'Suspension modification',
          'Lighting modification',
          'Exhaust modification',
          'Body modification',
          'Wheel/tire modification',
          'Aftermarket electrical accessory',
        ]),
      ],
    },
    {
      title: 'Power Train & Fuel System',
      items: [
        conditionItem('Throttle / accelerator pedal / linkage / return springs', [
          'Accelerator pedal',
          'Throttle cable',
          'Throttle body',
          'Return spring',
          'Linkage',
          'Pedal mount',
        ]),
        conditionItem('Engine / transmission mounts and driveline security', [
          'Engine mount',
          'Transmission mount',
          'Drive shaft',
          'CV axle',
          'U-joint',
          'Axle seal',
          'Transmission linkage',
        ]),
        conditionItem('Fuel tank / filler / cap / fuel and vapor lines', [
          'Fuel tank',
          'Fuel tank strap',
          'Fuel filler neck',
          'Fuel cap',
          'Fuel line',
          'EVAP hose',
          'Charcoal canister',
          'Fuel leak',
        ]),
        conditionItem('Exhaust / emission control components', [
          'Exhaust manifold',
          'Exhaust pipe',
          'Flex pipe',
          'Catalytic converter',
          'Muffler',
          'Exhaust hanger',
          'Oxygen sensor',
          'EGR system',
        ]),
      ],
    },
    {
      title: 'Suspension',
      items: [
        conditionItem('Axles / control arms / suspension attachment points', [
          'Front axle',
          'Rear axle',
          'Control arm',
          'Trailing arm',
          'Subframe',
          'Mounting bracket',
          'Bushing',
        ]),
        conditionItem('Springs / struts / shocks / torsion bars', [
          'Coil spring',
          'Leaf spring',
          'Torsion bar',
          'Front strut',
          'Rear shock',
          'Spring seat',
          'Strut mount',
        ]),
        conditionItem('Sway bar / links / bushings / wheel bearings', [
          'Sway bar',
          'Sway bar link',
          'Sway bar bushing',
          'Wheel bearing',
          'Hub assembly',
        ]),
      ],
    },
    {
      title: 'Hydraulic Brakes',
      items: [
        conditionItem('Brake pedal / booster / master cylinder / warning lamp', [
          'Brake pedal',
          'Brake booster',
          'Master cylinder',
          'Brake warning lamp',
          'ABS warning lamp',
          'Brake fluid reservoir',
        ]),
        conditionItem('Brake lines / hoses / fittings / leaks', [
          'Metal brake line',
          'Flexible brake hose',
          'Brake fitting',
          'Caliper hose',
          'Wheel cylinder line',
          'Brake fluid leak',
          'Corrosion',
        ]),
        conditionItem('Disc brakes / drum brakes / parking brake', [
          'Brake pad',
          'Brake rotor',
          'Brake caliper',
          'Brake shoe',
          'Brake drum',
          'Wheel cylinder',
          'Parking brake cable',
          'Parking brake actuator',
        ]),
      ],
    },
    {
      title: 'Steering',
      items: [
        conditionItem('Steering wheel / column / coupling / power assist', [
          'Steering wheel',
          'Steering column',
          'Steering coupler',
          'Power steering pump',
          'Power steering hose',
          'Power steering leak',
        ]),
        conditionItem('Steering rack / gear box / linkage / tie rods', [
          'Steering rack',
          'Steering gear box',
          'Inner tie rod',
          'Outer tie rod',
          'Center link',
          'Idler arm',
          'Pitman arm',
          'Steering boot',
        ]),
        conditionItem('Ball joints / king pins / steering movement', [
          'Upper ball joint',
          'Lower ball joint',
          'King pin',
          'Knuckle',
          'Binding',
          'Excessive play',
        ]),
      ],
    },
    {
      title: 'Instruments & Auxiliary Equipment',
      items: [
        conditionItem('Speedometer / odometer / required indicator lamps', [
          'Speedometer',
          'Odometer',
          'High beam indicator',
          'Turn signal indicator',
          'Brake warning indicator',
          'ABS indicator',
          'Airbag indicator',
        ]),
        conditionItem('Windshield wiper / washer / defroster / horn', [
          'Wiper blade',
          'Wiper arm',
          'Wiper motor',
          'Washer nozzle',
          'Washer pump',
          'Defroster',
          'Horn',
        ]),
        conditionItem('Seat belts / seats / mirrors / sun visor', [
          'Driver seat belt',
          'Passenger seat belt',
          'Rear seat belt',
          'Seat mounting',
          'Rear view mirror',
          'Side mirror',
          'Driver sun visor',
        ]),
      ],
    },
    {
      title: 'Lamps & Electrical System',
      items: [
        conditionItem('Headlamps / tail lamps / stop lamps / signal lamps', [
          'Low beam headlamp',
          'High beam headlamp',
          'Tail lamp',
          'Brake lamp',
          'Front turn signal',
          'Rear turn signal',
          'Hazard lamp',
          'Daytime running lamp',
        ]),
        conditionItem('Licence plate / reverse / marker / fog lamps / reflectors', [
          'Licence plate lamp',
          'Reverse lamp',
          'Side marker lamp',
          'Fog lamp',
          'Reflex reflector',
          'Lamp lens',
          'Lamp housing',
        ]),
        conditionItem('Wiring / connectors / battery securement / circuit protection', [
          'Wiring insulation',
          'Electrical connector',
          'Ground connection',
          'Battery terminal',
          'Battery hold-down',
          'Fuse',
          'Relay',
          'Aftermarket wiring',
        ]),
      ],
    },
    {
      title: 'Frame, Body, Glazing & Occupant Area',
      items: [
        conditionItem('Frame / unibody / body mounts / corrosion / structural damage', [
          'Frame rail',
          'Unibody structure',
          'Rocker panel',
          'Floor pan',
          'Body mount',
          'Crossmember',
          'Rust perforation',
          'Collision damage',
        ]),
        conditionItem('Doors / hood / trunk / latches / hinges', [
          'Driver door',
          'Passenger door',
          'Rear door',
          'Hood latch',
          'Trunk latch',
          'Door hinge',
          'Door handle',
          'Weatherstrip',
        ]),
        conditionItem('Windshield / windows / tint / mirrors / bumpers / mudflaps', [
          'Windshield',
          'Side glass',
          'Rear glass',
          'Window tint',
          'Mirror',
          'Front bumper',
          'Rear bumper',
          'Mudflap',
        ]),
      ],
    },
    {
      title: 'Tires & Wheels',
      items: [
        {
          label: 'Tire tread depth and condition',
          kind: InspectionItemKind.MEASUREMENT,
          isRequired: true,
          positionGroup: InspectionPositionGroup.TIRE_SET,
          unit: '1/32"',
          options: {
            values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            positions: ['LF', 'RF', 'LR', 'RR', 'Spare'],
            affectedParts: ['Tread depth', 'Sidewall', 'Tread separation', 'Cord exposure', 'Uneven wear', 'Tire size mismatch', 'Load rating'],
          },
        },
        conditionItem('Wheels / rims / studs / nuts / hubcaps', [
          'Wheel rim',
          'Wheel stud',
          'Lug nut',
          'Hubcap',
          'Wheel spacer',
          'Cracked wheel',
          'Bent wheel',
          'Missing fastener',
        ]),
      ],
    },
    {
      title: 'Road Test & Final Compliance',
      items: [
        conditionItem('Service brake operation / parking brake hold / steering response', [
          'Brake pull',
          'Brake vibration',
          'Parking brake hold',
          'Steering pull',
          'Steering wander',
          'Abnormal noise',
        ]),
        conditionItem('Warning lamps / drivability / roadworthiness confirmation', [
          'Check engine light',
          'ABS light',
          'Airbag light',
          'Traction control light',
          'Transmission operation',
          'Road test concern',
        ]),
      ],
    },
  ],
};

export const defaultInspectionTemplates: InspectionTemplateSeed[] = [
  peaceOfMindTemplate,
  outOfProvinceTemplate,
];

export enum BeamType {
  SimplySupported = 'Simply Supported',
  Cantilever = 'Cantilever',
}

export enum SectionStandard {
  AISC = 'American (AISC)',
  EN = 'European (EN)',
  BS = 'British (BS)',
  CSA = 'Canadian (CSA)',
}

export interface DesignParameters {
  lbMinor: number;
  lbMajor: number;
  lbLtb: number;
  beamType: BeamType;
  span: number;
}

export interface Loads {
  deadLoad: number;
  liveLoad: number;
  snowLoad: number;
  windLoad: number;
  otherLoad: number;
}

export interface MaterialProperties {
  fy: number; // Yield Strength in MPa
  fu: number; // Ultimate Strength in MPa
}

export interface DesignInputs {
  parameters: DesignParameters;
  loads: Loads;
  material: MaterialProperties;
  sectionStandard: SectionStandard;
  sectionFamily: string;
  includeNotionalLoads: boolean;
}

// --- Report Types ---

export interface LoadCombination {
  name: string;
  formula: string;
  factoredLoad: number;
}

export interface InternalForces {
  moment: number; // kNm
  shear: number; // kN
}

export interface DesignCheck {
  checkName: string;
  demand: number;
  capacity: number;
  ratio: number;
  status: 'Pass' | 'Fail';
  formula: string;
}

export interface ServiceabilityCheck {
    checkName: string;
    calculated: string;
    limit: string;
    status: 'Pass' | 'Fail' | 'N/A';
    details: string;
}

export interface CamberingInfo {
    isRequired: boolean;
    recommendation: string;
}

export interface AnalysisReport {
  selectedSection: {
    name: string;
    standard: string;
    properties: Record<string, string>;
  };
  loadCombinations: LoadCombination[];
  governingCombination: {
    name: string;
    factoredLoad: number;
  };
  internalForces: InternalForces;
  designChecks: DesignCheck[];
  serviceabilityChecks: ServiceabilityCheck[];
  camberingInfo: CamberingInfo;
  summary: {
    isAdequate: boolean;
    message: string;
  };
}
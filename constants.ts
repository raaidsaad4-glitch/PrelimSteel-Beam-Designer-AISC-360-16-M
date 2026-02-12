
import { BeamType, SectionStandard } from './types';

export const BEAM_TYPE_OPTIONS = Object.values(BeamType);
export const SECTION_STANDARD_OPTIONS = Object.values(SectionStandard);

export const SECTION_FAMILY_MAP: Record<SectionStandard, string[]> = {
  [SectionStandard.AISC]: ['W-Shapes', 'HSS-Rectangular', 'C-Shapes', 'MC-Shapes'],
  [SectionStandard.EN]: ['IPE', 'HEA', 'HEB', 'HEM', 'UPE'],
  [SectionStandard.BS]: ['UB (Universal Beams)', 'UC (Universal Columns)', 'PFC (Parallel Flange Channels)'],
  [SectionStandard.CSA]: ['W-Shapes (CISI)', 'HSS (CISI Class H)'],
};

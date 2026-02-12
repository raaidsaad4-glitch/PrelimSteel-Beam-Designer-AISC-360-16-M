import React from 'react';
import { DesignInputs, BeamType, SectionStandard } from '../types';
import { BEAM_TYPE_OPTIONS, SECTION_STANDARD_OPTIONS, SECTION_FAMILY_MAP } from '../constants';
import Card from './common/Card';
import Input from './common/Input';
import Select from './common/Select';
import Button from './common/Button';
import Checkbox from './common/Checkbox';

interface InputFormProps {
  onAnalysis: (inputs: DesignInputs) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onAnalysis, isLoading }) => {
  const [inputs, setInputs] = React.useState<DesignInputs>({
    parameters: {
      lbMinor: 3,
      lbMajor: 6,
      lbLtb: 6,
      beamType: BeamType.SimplySupported,
      span: 6,
    },
    loads: {
      deadLoad: 10,
      liveLoad: 15,
      snowLoad: 5,
      windLoad: 0,
      otherLoad: 0,
    },
    material: {
      fy: 345, // Default common yield strength (e.g., A992 steel)
      fu: 450, // Default common ultimate strength (e.g., A992 steel)
    },
    sectionStandard: SectionStandard.AISC,
    sectionFamily: SECTION_FAMILY_MAP[SectionStandard.AISC][0],
    includeNotionalLoads: true,
  });

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      parameters: { ...prev.parameters, [name]: parseFloat(value) || 0 },
    }));
  };
  
  const handleMaterialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      material: { ...prev.material, [name]: parseFloat(value) || 0 },
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleLoadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      loads: { ...prev.loads, [name]: parseFloat(value) || 0 },
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'beamType') {
        setInputs((prev) => ({ ...prev, parameters: { ...prev.parameters, beamType: value as BeamType } }));
    } else if (name === 'sectionStandard') {
        const newStandard = value as SectionStandard;
        setInputs((prev) => ({
            ...prev,
            sectionStandard: newStandard,
            sectionFamily: SECTION_FAMILY_MAP[newStandard][0], // Reset family to default for the new standard
        }));
    } else if (name === 'sectionFamily') {
        setInputs((prev) => ({ ...prev, sectionFamily: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalysis(inputs);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card title="Design Parameters">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Beam Span Length" name="span" type="number" unit="m" value={inputs.parameters.span} onChange={handleParamChange} min="0" step="0.1" required />
            <Select label="Beam Type" name="beamType" value={inputs.parameters.beamType} options={BEAM_TYPE_OPTIONS} onChange={handleSelectChange} required />
            <Input label="Unbraced Length (Major Axis, Lb-major)" name="lbMajor" type="number" unit="m" value={inputs.parameters.lbMajor} onChange={handleParamChange} min="0" step="0.1" required />
            <Input label="Unbraced Length (Minor Axis, Lb-minor)" name="lbMinor" type="number" unit="m" value={inputs.parameters.lbMinor} onChange={handleParamChange} min="0" step="0.1" required />
            <Input label="Lateral-Torsional Buckling Length (Lb-LTB)" name="lbLtb" type="number" unit="m" value={inputs.parameters.lbLtb} onChange={handleParamChange} min="0" step="0.1" required />
             <div className="md:col-span-2 flex items-center justify-center pt-2">
                <Checkbox
                    id="includeNotionalLoads"
                    name="includeNotionalLoads"
                    label="Include Notional Loads"
                    description="As per AISC Direct Analysis Method"
                    checked={inputs.includeNotionalLoads}
                    onChange={handleCheckboxChange}
                />
            </div>
          </div>
        </Card>

        <Card title="Material Properties">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Steel Yield Strength (Fy)" name="fy" type="number" unit="MPa" value={inputs.material.fy} onChange={handleMaterialChange} min="0" step="1" required />
            <Input label="Steel Ultimate Strength (Fu)" name="fu" type="number" unit="MPa" value={inputs.material.fu} onChange={handleMaterialChange} min="0" step="1" required />
          </div>
        </Card>

        <Card title="Service Loads">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Dead Load (D)" name="deadLoad" type="number" unit="kN/m" value={inputs.loads.deadLoad} onChange={handleLoadChange} min="0" step="0.1" required />
            <Input label="Live Load (L)" name="liveLoad" type="number" unit="kN/m" value={inputs.loads.liveLoad} onChange={handleLoadChange} min="0" step="0.1" required />
            <Input label="Snow Load (S)" name="snowLoad" type="number" unit="kN/m" value={inputs.loads.snowLoad} onChange={handleLoadChange} min="0" step="0.1" />
            <Input label="Wind Load (W)" name="windLoad" type="number" unit="kN/m" value={inputs.loads.windLoad} onChange={handleLoadChange} min="0" step="0.1" />
            <Input label="Other Load" name="otherLoad" type="number" unit="kN/m" value={inputs.loads.otherLoad} onChange={handleLoadChange} min="0" step="0.1" />
          </div>
        </Card>
        
        <Card title="Section & Code">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Section Standard / Database" name="sectionStandard" value={inputs.sectionStandard} options={SECTION_STANDARD_OPTIONS} onChange={handleSelectChange} required />
            <Select label="Section Family" name="sectionFamily" value={inputs.sectionFamily} options={SECTION_FAMILY_MAP[inputs.sectionStandard]} onChange={handleSelectChange} required />
          </div>
        </Card>

        <Button type="submit" isLoading={isLoading}>
          {isLoading ? 'Analyzing...' : 'Run Design & Analysis'}
        </Button>
      </div>
    </form>
  );
};

export default InputForm;
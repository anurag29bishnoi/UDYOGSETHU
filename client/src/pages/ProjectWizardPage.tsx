import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import {
  Building2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Layers,
  ShieldAlert,
  Zap,
  Droplets,
  AlertCircle
} from 'lucide-react';

export const ProjectWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1
    name: 'ABC High-Tech Textile & Technical Fabrics Facility',
    projectType: 'New',
    // Step 2
    sector: 'Textile',
    // Step 3
    state: 'Maharashtra',
    district: 'Pune',
    taluka: 'Baramati',
    industrialArea: 'Additional Baramati MIDC',
    midcPlot: 'Plot C-14',
    // Step 4
    landCost: 4.5,
    buildingCost: 8.0,
    machineryCost: 11.5,
    otherCost: 1.0,
    // Step 5
    productionType: 'Automated Shuttleless Weaving & Technical Fabric Processing',
    productionCapacity: '15,000 meters / day',
    employeeCount: 300,
    waterReq: 60,
    powerReq: 500,
    // Step 6
    waterConsumption: 60,
    wastewater: 35,
    airEmissions: 'Boiler flue gas with baghouse filter assembly',
    hazardousMaterials: true,
    solidWaste: 1.5,
    hazardousWaste: true,
    // Step 7
    buildingRequired: true,
    factoryRequired: true,
    fireRisk: 'High',
    buildingArea: 4800
  });

  const totalInvestment =
    parseFloat(String(formData.landCost || 0)) +
    parseFloat(String(formData.buildingCost || 0)) +
    parseFloat(String(formData.machineryCost || 0)) +
    parseFloat(String(formData.otherCost || 0));

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setError(null);
    if (currentStep < 8) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAnalyzeProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const created = await api.post('/projects', {
        ...formData,
        totalInvestment
      });

      // Run Analysis
      await api.post(`/projects/${created.id}/analyze`);
      navigate('/approvals');
    } catch (err: any) {
      setError(err.message || 'Failed to submit project analysis');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    'Basic Information',
    'Industry Sector',
    'Location & MIDC',
    'Capital Investment',
    'Operations & Utility',
    'Environmental Impact',
    'Construction & Fire',
    'Generate Analysis'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Create New Industrial Project</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete the 8-step wizard to determine statutory clearances, required document checklists, and government subsidies.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="bg-white p-4 rounded border border-slate-200">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-slate-800">
            Step {currentStep} of 8: {stepTitles[currentStep - 1]}
          </span>
          <span className="text-blue-700 font-semibold text-[11px]">
            {Math.round((currentStep / 8) * 100)}% Completed
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-700 transition-all duration-300"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Contents */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-2xs space-y-4">
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900 text-sm border-b pb-2">
              Step 1: Project Information
            </h2>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project / Facility Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project Category *
              </label>
              <select
                value={formData.projectType}
                onChange={e => handleChange('projectType', e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="New">New Greenfield Facility</option>
                <option value="Expansion">Expansion of Existing Unit (25%+ Outlay)</option>
                <option value="Modernization">Modernization &amp; Technology Upgradation</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: Industry Sector */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900 text-sm border-b pb-2">
              Step 2: Manufacturing Sector
            </h2>
            <p className="text-slate-500">
              Clearance rules and scheme benefits vary significantly based on your declared industrial sector.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                'Textile',
                'Food Processing',
                'Automobile',
                'Electronics',
                'Pharmaceutical',
                'Chemical',
                'General Manufacturing'
              ].map(sec => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => handleChange('sector', sec)}
                  className={`p-3 rounded border text-left font-semibold transition ${
                    formData.sector === sec
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Location */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900 text-sm border-b pb-2">
              Step 3: Location &amp; Industrial Area
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  disabled
                  value={formData.state}
                  className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-2 text-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">District *</label>
                <select
                  value={formData.district}
                  onChange={e => handleChange('district', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                >
                  <option value="Pune">Pune</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar (Aurangabad)</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Thane">Thane</option>
                  <option value="Kolhapur">Kolhapur</option>
                  <option value="Solapur">Solapur</option>
                  <option value="Amravati">Amravati</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Taluka</label>
                <input
                  type="text"
                  value={formData.taluka}
                  onChange={e => handleChange('taluka', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Industrial Area / MIDC *</label>
                <input
                  type="text"
                  value={formData.industrialArea}
                  onChange={e => handleChange('industrialArea', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">MIDC Plot / Survey Number</label>
                <input
                  type="text"
                  value={formData.midcPlot}
                  onChange={e => handleChange('midcPlot', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Capital Investment */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900 text-sm border-b pb-2">
              Step 4: Capital Investment Outlay (in ₹ Crores)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Land Cost (₹ Cr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.landCost}
                  onChange={e => handleChange('landCost', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Building &amp; Civil Works (₹ Cr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.buildingCost}
                  onChange={e => handleChange('buildingCost', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plant &amp; Machinery (₹ Cr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.machineryCost}
                  onChange={e => handleChange('machineryCost', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Other Assets / Utilities (₹ Cr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.otherCost}
                  onChange={e => handleChange('otherCost', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded flex justify-between items-center text-sm font-bold text-blue-900">
              <span>Total Capital Investment:</span>
              <span>₹{totalInvestment.toFixed(2)} Crore</span>
            </div>
          </div>
        )}

        {/* STEP 5: Operations & Utility */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900 text-sm border-b pb-2">
              Step 5: Operations, Capacity &amp; Utilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Production Process</label>
                <input
                  type="text"
                  value={formData.productionType}
                  onChange={e => handleChange('productionType', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Production Capacity</label>
                <input
                  type="text"
                  value={formData.productionCapacity}
                  onChange={e => handleChange('productionCapacity', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Number of Employees (Direct) *</label>
                <input
                  type="number"
                  value={formData.employeeCount}
                  onChange={e => handleChange('employeeCount', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
                <span className="text-[10px] text-slate-500">
                  {formData.employeeCount >= 10 ? '✓ Triggers DISH Factory License' : ''}
                </span>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contracted Power Demand (kVA) *</label>
                <input
                  type="number"
                  value={formData.powerReq}
                  onChange={e => handleChange('powerReq', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
                <span className="text-[10px] text-slate-500">
                  {formData.powerReq >= 100 ? '✓ Triggers MSEDCL High Tension (HT) Sanction' : 'LT connection'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Environmental Impact */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900 text-sm border-b pb-2">
              Step 6: Environmental &amp; Pollution Parameters (MPCB Triggers)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Daily Water Demand (KLD)</label>
                <input
                  type="number"
                  value={formData.waterConsumption}
                  onChange={e => handleChange('waterConsumption', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trade Effluent / Wastewater (KLD)</label>
                <input
                  type="number"
                  value={formData.wastewater}
                  onChange={e => handleChange('wastewater', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
                <span className="text-[10px] text-slate-500">
                  {formData.wastewater > 0 ? '✓ Triggers MPCB Consent to Establish (Orange/Red)' : 'No industrial trade effluent'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Air Emissions Description</label>
                <input
                  type="text"
                  value={formData.airEmissions}
                  onChange={e => handleChange('airEmissions', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="flex items-center space-x-2 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.hazardousMaterials}
                    onChange={e => handleChange('hazardousMaterials', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Hazardous Chemicals / Raw Materials Stored on Site</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.hazardousWaste}
                    onChange={e => handleChange('hazardousWaste', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Hazardous Waste Generated (Schedule I/II)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Construction & Fire Safety */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900 text-sm border-b pb-2">
              Step 7: Civil Construction &amp; Fire Safety (Fire NOC &amp; MIDC)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Built-up Building Area (sq. meters) *</label>
                <input
                  type="number"
                  value={formData.buildingArea}
                  onChange={e => handleChange('buildingArea', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fire Classification Hazard *</label>
                <select
                  value={formData.fireRisk}
                  onChange={e => handleChange('fireRisk', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                >
                  <option value="Low">Low Fire Risk (Non-flammable)</option>
                  <option value="Medium">Medium Fire Risk</option>
                  <option value="High">High Fire Risk (Textile, Solvents, Polymers)</option>
                </select>
                <span className="text-[10px] text-slate-500">
                  {formData.fireRisk !== 'Low' || formData.buildingArea > 500
                    ? '✓ Triggers Provisional Fire Safety NOC'
                    : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Generate Project Analysis */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-900 text-sm border-b pb-2">
              Step 8: Review &amp; Analyze Project
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Review your declared project profile before triggering deterministic statutory rules scrutiny.
            </p>

            <div className="bg-slate-50 p-4 rounded border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Sector:</span>
                <p className="font-bold text-slate-900">{formData.sector}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Location:</span>
                <p className="font-bold text-slate-900">{formData.district}, {formData.state}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Total Outlay:</span>
                <p className="font-bold text-blue-700">₹{totalInvestment.toFixed(2)} Cr</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Workforce:</span>
                <p className="font-bold text-slate-900">{formData.employeeCount} Persons</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded text-blue-900 text-xs flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">Automated Rule-Based Evaluation</div>
                <p className="text-[11px] mt-0.5 leading-relaxed">
                  Clicking &quot;Analyze My Project&quot; will evaluate Maharashtra statutory acts (Water Act, Factories Act, Fire Prevention Act, RTSA 2015) and calculate your eligibility for state and central industrial subsidies.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <button
            type="button"
            disabled={currentStep === 1 || loading}
            onClick={handlePrev}
            className="px-4 py-2 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded shadow-xs transition flex items-center"
            >
              Next Step
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleAnalyzeProject}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded shadow-xs transition flex items-center"
            >
              {loading ? 'Analyzing Project...' : 'Analyze My Project & Discover Clearances'}
              <Sparkles className="w-4 h-4 ml-1.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

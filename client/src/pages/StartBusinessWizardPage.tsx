import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Search,
  Fuel,
  Hotel,
  HeartPulse,
  Factory,
  Apple,
  Cpu,
  Car,
  FlaskConical,
  SunMedium,
  Zap,
  HelpCircle,
  FileCheck2,
  Award,
  Clock,
  Sparkles,
  Layers,
  MapPin,
  IndianRupee,
  Users,
  FileText,
  Download,
  AlertCircle
} from 'lucide-react';

interface BusinessTypeItem {
  code: string;
  name: string;
  categoryCode: string;
  description: string;
  icon: string;
  isHazardous: boolean;
  typicalInvestmentRange: string;
  governingActs: string;
  keywords: string[];
}

interface DynamicQuestion {
  code: string;
  questionText: string;
  helpText?: string;
  inputType: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'RADIO';
  options?: Array<{ label: string; value: string }>;
  isRequired: boolean;
  sortOrder: number;
}

export const StartBusinessWizardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const preselectedType = searchParams.get('type') || '';

  // Wizard Steps: 1: Business, 2: Location & Stage, 3: Scale & Investment, 4: Dynamic Questionnaire, 5: Roadmap Review
  const [step, setStep] = useState<number>(preselectedType ? 2 : 1);

  // Business Types & Categories state
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<BusinessTypeItem | null>(null);

  // Form States
  const [projectName, setProjectName] = useState<string>('');
  const [projectStage, setProjectStage] = useState<string>('Planning');
  const [stateName, setStateName] = useState<string>('Maharashtra');
  const [district, setDistrict] = useState<string>('Pune');
  const [cityOrTaluka, setCityOrTaluka] = useState<string>('Baramati');
  const [industrialArea, setIndustrialArea] = useState<string>('Additional Baramati MIDC');
  const [plotNumber, setPlotNumber] = useState<string>('Plot C-14');

  const [investmentCr, setInvestmentCr] = useState<number>(2.5);
  const [employeeCount, setEmployeeCount] = useState<number>(25);
  const [landAreaAcres, setLandAreaAcres] = useState<number>(2.0);
  const [buildingAreaSqM, setBuildingAreaSqM] = useState<number>(1500);

  // Dynamic Questions & Answers
  const [dynamicQuestions, setDynamicQuestions] = useState<DynamicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Discovery Results
  const [loadingDiscovery, setLoadingDiscovery] = useState<boolean>(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);

  // Project Creation State
  const [creatingProject, setCreatingProject] = useState<boolean>(false);
  const [downloadingBlueprint, setDownloadingBlueprint] = useState<boolean>(false);

  // Load business types & categories on mount
  useEffect(() => {
    const loadTaxonomy = async () => {
      try {
        const [typesData, catsData] = await Promise.all([
          api.get<BusinessTypeItem[]>('/business/business-types'),
          api.get<any[]>('/business/categories')
        ]);
        setBusinessTypes(typesData);
        setCategories(catsData);

        if (preselectedType) {
          const match = typesData.find(t => t.code === preselectedType.toUpperCase());
          if (match) {
            handleSelectBusinessType(match);
          }
        }
      } catch (err) {
        console.error('Failed to load business taxonomy:', err);
      }
    };
    loadTaxonomy();
  }, [preselectedType]);

  const handleSelectBusinessType = async (bType: BusinessTypeItem) => {
    setSelectedType(bType);
    setProjectName(`${bType.name} Venture`);
    try {
      const qData = await api.get<DynamicQuestion[]>(`/business/business-types/${bType.code}/questions`);
      setDynamicQuestions(qData);
      // Pre-fill sensible default answers
      const defaultAns: Record<string, any> = {};
      qData.forEach(q => {
        if (q.inputType === 'BOOLEAN') defaultAns[q.code] = true;
        else if (q.options && q.options.length > 0) defaultAns[q.code] = q.options[0].value;
        else if (q.inputType === 'NUMBER') defaultAns[q.code] = 50;
      });
      setAnswers(defaultAns);
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  };

  const handleRunDiscovery = async () => {
    if (!selectedType) return;
    try {
      setLoadingDiscovery(true);
      const res = await api.post('/business/discover-requirements', {
        businessTypeCode: selectedType.code,
        location: {
          state: stateName,
          district,
          cityOrTaluka,
          localAuthority: `${district} Municipal Corporation / Collectorate`
        },
        projectStage,
        answers,
        investmentCr,
        employeeCount
      });
      setDiscoveryResult(res);
      setStep(5); // Go to results step
    } catch (err) {
      console.error('Failed to run discovery:', err);
    } finally {
      setLoadingDiscovery(false);
    }
  };

  const handleCreateProjectAndProceed = async () => {
    if (!selectedType) return;
    try {
      setCreatingProject(true);
      const newProj = await api.post('/projects', {
        name: projectName || `${selectedType.name} Unit`,
        businessTypeCode: selectedType.code,
        answers,
        projectStage,
        sector: selectedType.name,
        state: stateName,
        district,
        taluka: cityOrTaluka,
        industrialArea,
        midcPlot: plotNumber,
        totalInvestment: investmentCr,
        employeeCount,
        buildingArea: buildingAreaSqM,
        buildingRequired: true,
        factoryRequired: selectedType.categoryCode === 'MANUFACTURING' || selectedType.isHazardous,
        hazardousMaterials: selectedType.isHazardous,
        fireRisk: selectedType.isHazardous ? 'High' : 'Medium'
      });

      if (newProj && newProj.id) {
        navigate(`/projects/${newProj.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      navigate('/dashboard');
    } finally {
      setCreatingProject(false);
    }
  };

  // Filter business types by search query and category
  const filteredBusinessTypes = businessTypes.filter(t => {
    const matchesCat = selectedCategory === 'ALL' || t.categoryCode === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Fuel': return <Fuel className="w-5 h-5 text-amber-600" />;
      case 'Hotel': return <Hotel className="w-5 h-5 text-blue-600" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'Factory': return <Factory className="w-5 h-5 text-slate-700" />;
      case 'Apple': return <Apple className="w-5 h-5 text-emerald-600" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-indigo-600" />;
      case 'Car': return <Car className="w-5 h-5 text-orange-600" />;
      case 'FlaskConical': return <FlaskConical className="w-5 h-5 text-purple-600" />;
      case 'SunMedium': return <SunMedium className="w-5 h-5 text-amber-500" />;
      default: return <Building2 className="w-5 h-5 text-blue-700" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* 1. Header & Stepper Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                <Link to="/" className="hover:text-blue-700 font-medium">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-800 font-semibold">Start Any Business Wizard</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Start Your Business With Confidence
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Tell us what you want to build. We will map statutory clearances, mandatory documents, and government incentives across India.
              </p>
            </div>

            {selectedType && (
              <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded">
                <div className="w-7 h-7 rounded bg-blue-100 flex items-center justify-center shrink-0">
                  {getCategoryIcon(selectedType.icon)}
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">Selected Business</span>
                  <span className="text-xs font-bold text-slate-900">{selectedType.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Navigation */}
          <div className="grid grid-cols-5 gap-2 mt-6 text-xs">
            {[
              { num: 1, label: '1. Select Business' },
              { num: 2, label: '2. Location & Stage' },
              { num: 3, label: '3. Investment & Scale' },
              { num: 4, label: '4. Specific Questions' },
              { num: 5, label: '5. Approvals Roadmap' }
            ].map(s => {
              const isCurrent = step === s.num;
              const isPassed = step > s.num;
              return (
                <div
                  key={s.num}
                  className={`p-2.5 rounded border text-center transition ${
                    isCurrent
                      ? 'bg-blue-700 text-white font-bold border-blue-800 shadow-xs'
                      : isPassed
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200 font-semibold'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider mb-0.5">
                    {isPassed ? '✓ Complete' : isCurrent ? 'Active Step' : `Step ${s.num}`}
                  </div>
                  <div className="truncate">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Wizard Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* ======================================================= */}
        {/* STEP 1: BUSINESS TYPE DISCOVERY & SELECTION */}
        {/* ======================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded border border-slate-200 shadow-xs">
              <div className="max-w-2xl mx-auto text-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">What business do you want to start?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Search across 40+ structured industrial, retail, service, and healthcare sectors.
                </p>

                {/* Instant Search Bar */}
                <div className="relative mt-4">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search: Petrol Pump, Hotel, Hospital, Textile Factory, Pharmacy, IT Company, Cold Storage..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white"
                  />
                </div>

                {/* Popular Quick-Select Chips */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-[11px]">
                  <span className="text-slate-400 font-medium">Quick Suggestions:</span>
                  {[
                    { label: 'Petrol Pump', code: 'PETROL_PUMP' },
                    { label: 'Hotel & Resort', code: 'HOTEL' },
                    { label: 'Hospital', code: 'HOSPITAL' },
                    { label: 'Textile Factory', code: 'TEXTILE_FACTORY' },
                    { label: 'Food Processing', code: 'FOOD_PROCESSING' },
                    { label: 'IT / Software', code: 'IT_COMPANY' },
                    { label: 'Pharmacy', code: 'PHARMACY' },
                    { label: 'Auto Components', code: 'AUTO_COMPONENTS' }
                  ].map(chip => (
                    <button
                      key={chip.code}
                      onClick={() => {
                        const match = businessTypes.find(b => b.code === chip.code);
                        if (match) {
                          handleSelectBusinessType(match);
                          setStep(2);
                        }
                      }}
                      className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2 py-0.5 rounded border border-slate-200 transition"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-slate-200 mb-6 text-xs">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded font-semibold whitespace-nowrap transition ${
                    selectedCategory === 'ALL'
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Categories ({businessTypes.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.code}
                    onClick={() => setSelectedCategory(cat.code)}
                    className={`px-3 py-1.5 rounded font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat.code
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Business Types Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBusinessTypes.map(bType => {
                  const isSelected = selectedType?.code === bType.code;
                  return (
                    <div
                      key={bType.code}
                      onClick={() => handleSelectBusinessType(bType)}
                      className={`p-4 rounded border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-9 h-9 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                            {getCategoryIcon(bType.icon)}
                          </div>
                          {bType.isHazardous && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              PESO / SPCB Controlled
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">{bType.name}</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {bType.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] flex justify-between items-center text-slate-500">
                        <span>Invest: <strong className="text-slate-700">{bType.typicalInvestmentRange}</strong></span>
                        <span className="text-blue-700 font-bold flex items-center">
                          Select &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedType && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-sm transition"
                  >
                    Continue with {selectedType.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 2: LOCATION & PROJECT STAGE */}
        {/* ======================================================= */}
        {step === 2 && selectedType && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded border border-slate-200 shadow-xs">
              <div className="border-b border-slate-200 pb-3 mb-6">
                <h2 className="text-base font-bold text-slate-900">Where will your business operate?</h2>
                <p className="text-xs text-slate-500">
                  Statutory requirements and state incentives vary by jurisdiction, district classification, and project maturity.
                </p>
              </div>

              <div className="space-y-5 text-xs">
                {/* Project Stage Radios */}
                <div>
                  <label className="block font-bold text-slate-800 mb-2">Current Project Maturity Stage</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'Idea', label: '1. Conceptual / Idea Stage', desc: 'Evaluating feasibility & required licenses' },
                      { id: 'Planning', label: '2. Planning & Financing', desc: 'Preparing DPR, seeking loan & bank tie-ups' },
                      { id: 'Land Acquired', label: '3. Land Acquired / Leased', desc: 'Plot identified, awaiting civil clearances' },
                      { id: 'Construction', label: '4. Civil Construction', desc: 'Erecting building / foundation' },
                      { id: 'Installation', label: '5. Machinery Installation', desc: 'Setting up equipment & testing' },
                      { id: 'Operations', label: '6. Operational Unit', desc: 'Live unit seeking renewal & ongoing compliance' }
                    ].map(stg => (
                      <div
                        key={stg.id}
                        onClick={() => setProjectStage(stg.id)}
                        className={`p-3 rounded border cursor-pointer transition ${
                          projectStage === stg.id
                            ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-slate-900">{stg.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{stg.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* State & District Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">State / Union Territory</label>
                    <select
                      value={stateName}
                      onChange={e => setStateName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                    >
                      <option value="Maharashtra">Maharashtra (MIDC)</option>
                      <option value="Gujarat">Gujarat (GIDC)</option>
                      <option value="Punjab">Punjab (PSIEC)</option>
                      <option value="Karnataka">Karnataka (KIADB)</option>
                      <option value="Tamil Nadu">Tamil Nadu (SIPCOT)</option>
                      <option value="Uttar Pradesh">Uttar Pradesh (UPSIDA)</option>
                      <option value="Delhi">National Capital Territory (Delhi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="e.g. Pune, Ludhiana, Ahmedabad, Thane"
                      className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">City / Taluka</label>
                    <input
                      type="text"
                      value={cityOrTaluka}
                      onChange={e => setCityOrTaluka(e.target.value)}
                      placeholder="e.g. Baramati, Jalandhar Cantt, Sanand"
                      className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Industrial Estate / Highway / Area Name</label>
                    <input
                      type="text"
                      value={industrialArea}
                      onChange={e => setIndustrialArea(e.target.value)}
                      placeholder="e.g. Additional Baramati MIDC or NH-44 GT Road"
                      className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Plot / Survey / Door Number</label>
                    <input
                      type="text"
                      value={plotNumber}
                      onChange={e => setPlotNumber(e.target.value)}
                      placeholder="e.g. Plot C-14 or Survey 124/2"
                      className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-xs"
                >
                  Next: Investment & Scale
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 3: INVESTMENT & SCALE */}
        {/* ======================================================= */}
        {step === 3 && selectedType && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded border border-slate-200 shadow-xs">
              <div className="border-b border-slate-200 pb-3 mb-6">
                <h2 className="text-base font-bold text-slate-900">Project Scale & Financial Outlay</h2>
                <p className="text-xs text-slate-500">
                  Used by our Rules Engine to determine MSME classification, mega project fiscal subsidies, and environmental category.
                </p>
              </div>

              <div className="space-y-5 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Proposed Project / Unit Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="e.g. Punjab Highway Fuel Station or Baramati Heritage Hotel"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                    <label className="block font-bold text-slate-800 mb-1">
                      Total Capital Investment (₹ Crore)
                    </label>
                    <div className="flex items-center space-x-3 mt-2">
                      <input
                        type="range"
                        min="0.5"
                        max="50"
                        step="0.5"
                        value={investmentCr}
                        onChange={e => setInvestmentCr(parseFloat(e.target.value))}
                        className="flex-1 accent-blue-700 cursor-pointer"
                      />
                      <span className="font-bold text-base text-blue-700 w-20 text-right">
                        ₹{investmentCr} Cr
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Includes plant, machinery, civil work, and land expenditure.
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                    <label className="block font-bold text-slate-800 mb-1">
                      Estimated Workforce (Employees / Staff)
                    </label>
                    <div className="flex items-center space-x-3 mt-2">
                      <input
                        type="range"
                        min="5"
                        max="300"
                        step="5"
                        value={employeeCount}
                        onChange={e => setEmployeeCount(parseInt(e.target.value, 10))}
                        className="flex-1 accent-blue-700 cursor-pointer"
                      />
                      <span className="font-bold text-base text-blue-700 w-16 text-right">
                        {employeeCount}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Workforce &gt; 20 triggers Factories Act / Welfare Officer thresholds.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Total Land Area (in Acres or sq.m.)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={landAreaAcres}
                      onChange={e => setLandAreaAcres(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                    />
                    <span className="text-[10px] text-slate-500">Standard fuel outlet: ~1-2 Acres</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Built-up Area (in sq. meters)</label>
                    <input
                      type="number"
                      value={buildingAreaSqM}
                      onChange={e => setBuildingAreaSqM(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white"
                    />
                    <span className="text-[10px] text-slate-500">Determines Fire Safety sprinkler & exit staircase requirements</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex items-center px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-xs"
                >
                  Next: Specific Questions
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 4: DYNAMIC BUSINESS-SPECIFIC QUESTIONS */}
        {/* ======================================================= */}
        {step === 4 && selectedType && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded border border-slate-200 shadow-xs">
              <div className="border-b border-slate-200 pb-3 mb-6 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-700" />
                    <h2 className="text-base font-bold text-slate-900">
                      Tailored Questions for {selectedType.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Our dynamic rules engine asks only questions that directly govern statutory licensing for this specific activity.
                  </p>
                </div>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                  {dynamicQuestions.length} Conditional Rules
                </span>
              </div>

              <div className="space-y-5 text-xs">
                {dynamicQuestions.map(q => (
                  <div key={q.code} className="p-4 bg-slate-50 border border-slate-200 rounded">
                    <label className="block font-bold text-slate-900 mb-1">
                      {q.questionText}
                      {q.isRequired && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    {q.helpText && (
                      <p className="text-[11px] text-slate-500 mb-2.5">{q.helpText}</p>
                    )}

                    {/* SELECT INPUT */}
                    {q.inputType === 'SELECT' && q.options && (
                      <select
                        value={answers[q.code] || ''}
                        onChange={e => setAnswers({ ...answers, [q.code]: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded border border-slate-300 bg-white font-medium"
                      >
                        {q.options.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* BOOLEAN INPUT */}
                    {q.inputType === 'BOOLEAN' && (
                      <div className="flex items-center space-x-4 mt-1">
                        <label className="inline-flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={q.code}
                            checked={answers[q.code] === true}
                            onChange={() => setAnswers({ ...answers, [q.code]: true })}
                            className="text-blue-700 focus:ring-blue-500"
                          />
                          <span className="text-xs font-semibold text-slate-800">Yes</span>
                        </label>
                        <label className="inline-flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={q.code}
                            checked={answers[q.code] === false}
                            onChange={() => setAnswers({ ...answers, [q.code]: false })}
                            className="text-blue-700 focus:ring-blue-500"
                          />
                          <span className="text-xs font-semibold text-slate-800">No</span>
                        </label>
                      </div>
                    )}

                    {/* NUMBER INPUT */}
                    {q.inputType === 'NUMBER' && (
                      <input
                        type="number"
                        value={answers[q.code] !== undefined ? answers[q.code] : 40}
                        onChange={e => setAnswers({ ...answers, [q.code]: parseFloat(e.target.value) })}
                        className="w-full max-w-xs px-3 py-2 text-xs rounded border border-slate-300 bg-white font-medium"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Back
                </button>
                <button
                  onClick={handleRunDiscovery}
                  disabled={loadingDiscovery}
                  className="inline-flex items-center px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-sm"
                >
                  {loadingDiscovery ? (
                    <>Running Rules Engine...</>
                  ) : (
                    <>
                      Generate Know Your Approvals Roadmap
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 5: ROADMAP REVIEW & CONTROL CENTER LAUNCH */}
        {/* ======================================================= */}
        {step === 5 && discoveryResult && selectedType && (
          <div className="space-y-6">
            {/* Top Success Banner */}
            <div className="p-5 bg-white rounded border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Statutory Blueprint Compiled Successfully</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {projectName || selectedType.name} &bull; {discoveryResult.totalRequirementsCount} Clearances Mapped
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Location: <strong className="text-slate-800">{district}, {stateName}</strong> &bull; Capital Outlay:{' '}
                  <strong className="text-slate-800">₹{investmentCr} Cr</strong> &bull; Estimated RTSA SLA Window:{' '}
                  <strong className="text-blue-700">{discoveryResult.estimatedTotalWorkingDays} Working Days</strong>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setDownloadingBlueprint(true);
                    setTimeout(() => setDownloadingBlueprint(false), 2000);
                  }}
                  className="inline-flex items-center px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded border border-slate-300 transition"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
                  {downloadingBlueprint ? 'Compiling PDF...' : 'Download Blueprint PDF'}
                </button>

                <button
                  onClick={handleCreateProjectAndProceed}
                  disabled={creatingProject}
                  className="inline-flex items-center px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-sm transition"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  {creatingProject ? 'Initializing Project...' : 'Launch Business Control Center'}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-white rounded border border-slate-200 shadow-2xs">
                <span className="text-slate-500 font-medium">Statutory Clearances</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{discoveryResult.totalRequirementsCount} Identified</div>
                <span className="text-[11px] text-blue-700 font-semibold">Across Central, State & Local</span>
              </div>

              <div className="p-4 bg-white rounded border border-slate-200 shadow-2xs">
                <span className="text-slate-500 font-medium">Dossiers to Prepare</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {discoveryResult.mandatoryDocumentsList.length} Files
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold">Single Upload & Multi-Use</span>
              </div>

              <div className="p-4 bg-white rounded border border-slate-200 shadow-2xs">
                <span className="text-slate-500 font-medium">Critical Path SLA</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {discoveryResult.estimatedTotalWorkingDays} Working Days
                </div>
                <span className="text-[11px] text-slate-500">Under RTSA 2015 Guidelines</span>
              </div>

              <div className="p-4 bg-white rounded border border-slate-200 shadow-2xs">
                <span className="text-slate-500 font-medium">Parallel Filing Savings</span>
                <div className="text-2xl font-bold text-emerald-700 mt-1">
                  +{discoveryResult.parallelProcessingSavesDays} Days Saved
                </div>
                <span className="text-[11px] text-slate-500">vs traditional serial queue</span>
              </div>
            </div>

            {/* Requirements Categorized by Jurisdiction */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Clearances Breakdown */}
              <div className="lg:col-span-2 space-y-4">
                {/* Central Requirements */}
                {discoveryResult.requirementsByJurisdiction.central.length > 0 && (
                  <div className="bg-white rounded border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Central Government Approvals ({discoveryResult.requirementsByJurisdiction.central.length})
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Govt of India Authorities</span>
                    </div>

                    <div className="space-y-3">
                      {discoveryResult.requirementsByJurisdiction.central.map((req: any) => (
                        <div key={req.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-slate-900 text-sm">{req.name}</strong>
                              <div className="text-[11px] text-slate-500 mt-0.5">{req.authority}</div>
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              {req.statutorySLA}d SLA
                            </span>
                          </div>
                          <p className="text-slate-600 mt-2 text-[11px]">
                            <em>Why required:</em> {req.applicabilityReason}
                          </p>
                          <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap gap-1 text-[10px]">
                            <span className="text-slate-400">Required Dossiers:</span>
                            {req.requiredDocuments.map((d: any, i: number) => (
                              <span key={i} className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                                {d.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* State Requirements */}
                {discoveryResult.requirementsByJurisdiction.state.length > 0 && (
                  <div className="bg-white rounded border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          State Government Approvals ({discoveryResult.requirementsByJurisdiction.state.length})
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">State Single Window Departments</span>
                    </div>

                    <div className="space-y-3">
                      {discoveryResult.requirementsByJurisdiction.state.map((req: any) => (
                        <div key={req.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-slate-900 text-sm">{req.name}</strong>
                              <div className="text-[11px] text-slate-500 mt-0.5">{req.department}</div>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              {req.statutorySLA}d SLA
                            </span>
                          </div>
                          <p className="text-slate-600 mt-2 text-[11px]">
                            <em>Why required:</em> {req.applicabilityReason}
                          </p>
                          <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap gap-1 text-[10px]">
                            <span className="text-slate-400">Required Dossiers:</span>
                            {req.requiredDocuments.map((d: any, i: number) => (
                              <span key={i} className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                                {d.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Local Requirements */}
                {discoveryResult.requirementsByJurisdiction.local.length > 0 && (
                  <div className="bg-white rounded border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Local & Municipal Clearances ({discoveryResult.requirementsByJurisdiction.local.length})
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">District & Town Planning</span>
                    </div>

                    <div className="space-y-3">
                      {discoveryResult.requirementsByJurisdiction.local.map((req: any) => (
                        <div key={req.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-slate-900 text-sm">{req.name}</strong>
                              <div className="text-[11px] text-slate-500 mt-0.5">{req.authority}</div>
                            </div>
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              {req.statutorySLA}d SLA
                            </span>
                          </div>
                          <p className="text-slate-600 mt-2 text-[11px]">
                            <em>Why required:</em> {req.applicabilityReason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Col: Document Checklist & Government Schemes */}
              <div className="space-y-6">
                {/* Single Upload Document Checklist */}
                <div className="bg-white rounded border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileCheck2 className="w-4 h-4 text-blue-700" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Single Upload & Multi-Use Vault
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Upload each document once to your secure vault. The platform maps verified credentials across all applications.
                  </p>

                  <div className="space-y-2 text-xs">
                    {discoveryResult.mandatoryDocumentsList.slice(0, 7).map((doc: any, i: number) => (
                      <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                        <div className="font-semibold text-slate-800">{doc.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Reusable for: <span className="text-blue-700 font-medium">{doc.usedForApprovals.join(', ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Applicable Government Schemes */}
                {discoveryResult.potentialGovernmentSchemes.length > 0 && (
                  <div className="bg-white rounded border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Matched Government Schemes
                      </h3>
                    </div>
                    <div className="space-y-3 text-xs">
                      {discoveryResult.potentialGovernmentSchemes.map((sch: any, idx: number) => (
                        <div key={idx} className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                            {sch.matchConfidence}
                          </span>
                          <strong className="block text-slate-900 mt-1">{sch.name}</strong>
                          <p className="text-[11px] text-slate-600 mt-0.5">{sch.benefitSummary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const http = require('http');

async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/business/business-types');
    const data = await res.json();
    console.log('Total business types:', data.length);
    const active = data.filter(d => d.isActive === true);
    const phase2 = data.filter(d => d.isActive === false);
    console.log('Active Food Ventures (' + active.length + '):');
    active.forEach(a => console.log('  - ' + a.name + ' (' + a.code + ') => ' + a.tagline));
    console.log('\nPhase 2 Ventures (' + phase2.length + '):');
    phase2.forEach(p => console.log('  - ' + p.name + ' (' + p.code + ') => ' + p.badgeText));

    console.log('\n--- Testing Discovery for FOOD_PROCESSING ---');
    const discRes = await fetch('http://localhost:5000/api/business/discover-requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessTypeCode: 'FOOD_PROCESSING',
        location: {
          state: 'Maharashtra',
          district: 'Pune',
          cityOrTaluka: 'Baramati'
        },
        projectStage: 'Planning',
        investmentCr: 4.5,
        employeeCount: 35,
        answers: {
          turnoverScale: 'TIER_STATE',
          capacityMtPerDay: 8,
          waterSource: 'BOREWELL',
          hasColdStorage: true,
          packagingType: 'CONSUMER_RETAIL',
          effluentGeneration: 'HIGH_ORGANIC'
        }
      })
    });
    const discData = await discRes.json();
    console.log('Clearances identified:', discData.totalRequirementsCount);
    console.log('Mandatory documents:', discData.mandatoryDocumentsList?.length);
    console.log('Subsidies matched:', discData.potentialGovernmentSchemes?.map(s => s.name));
    console.log('Smart recommendations:', discData.smartRecommendations?.map(r => r.title));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();

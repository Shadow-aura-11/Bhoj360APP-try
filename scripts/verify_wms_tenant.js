/**
 * Verification Script for WMS Tenant Creation & API
 */
const { createRestaurant } = require('../agency-core/restaurant-factory');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

async function verifyWMS() {
  console.log('🚀 Starting WMS Tenant Verification...');

  try {
    // 1. Create a WMS Tenant
    const wmsConfig = await createRestaurant({
      name: 'Global Logistics Hub',
      type: 'WMS',
      location: 'Chicago, IL',
      pins: { admin: 'wmsadmin' }
    });

    console.log(`✅ WMS Tenant Created: ${wmsConfig.id} on port ${wmsConfig.port}`);

    // Wait for microservice to boot
    console.log('⏳ Waiting for service to start...');
    await new Promise(r => setTimeout(r, 3000));

    // 2. Test Health Endpoint
    const healthUrl = `http://localhost:${wmsConfig.port}/health`;
    const healthRes = await axios.get(healthUrl);

    if (healthRes.data.type === 'WMS' && healthRes.data.status === 'ok') {
      console.log('✅ Health Check Passed: Service identified as WMS');
    } else {
      throw new Error(`Health Check Failed: ${JSON.stringify(healthRes.data)}`);
    }

    // 3. Test Inventory API
    const invRes = await axios.get(`http://localhost:${wmsConfig.port}/wms/inventory`);
    console.log(`✅ Inventory API Passed: Found ${invRes.data.length} seeded items`);

    // 4. Test Analytics KPIs
    const kpiRes = await axios.get(`http://localhost:${wmsConfig.port}/wms/analytics/kpis`);
    console.log(`✅ Analytics API Passed: Accuracy=${kpiRes.data.accuracy}, Throughput=${kpiRes.data.dailyThroughput}`);

    // 5. Test Yard API
    const yardRes = await axios.get(`http://localhost:${wmsConfig.port}/wms/yard`);
    console.log(`✅ Yard API Passed: Found ${yardRes.data.docks.length} docks`);

    console.log('\n✨ ALL WMS VERIFICATIONS PASSED SUCCESSFULLY!');

    // Cleanup registry for test
    const registryPath = path.join(__dirname, '..', 'agency-core', 'registry.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    registry.restaurants = registry.restaurants.filter(r => r.id !== wmsConfig.id);
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('❌ VERIFICATION FAILED:', err.message);
    if (err.response) console.error('Response:', err.response.data);
    process.exit(1);
  }
}

verifyWMS();

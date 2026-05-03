const readline = require('readline');

const CONFIG = {
  INGESTER_URL: 'http://localhost:8001',
  API_KEY: 'mock-gen-key-001',
  WORKFLOW_URL: 'http://localhost:8002'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fireSignal(payload) {
  try {
    const res = await fetch(`${CONFIG.INGESTER_URL}/api/v1/signals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': CONFIG.API_KEY
      },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.error(`  [ERROR] Failed to send signal: ${err.message}`);
    return false;
  }
}

async function showMenu() {
  console.log(`
╔══════════════════════════════════════════╗
║     IMS Outage Simulator v1.0            ║
║     Zeotap SRE Assignment Demo           ║
╚══════════════════════════════════════════╝

Select a simulation scenario:

  [1] RDBMS Outage → MCP Cascade    (recommended for demo)
  [2] Cache Burst Test              (tests debounce logic)
  [3] Full Stack Disaster           (all components)
  [4] Custom Signal                 (manual input)
  [5] Exit
`);

  rl.question('Enter choice (1-5): ', async (choice) => {
    switch (choice) {
      case '1': await runScenario1(); break;
      case '2': await runScenario2(); break;
      case '3': await runScenario3(); break;
      case '4': await runScenario4(); break;
      case '5': console.log('Exiting...'); process.exit(0);
      default: console.log('Invalid choice.'); await showMenu(); return;
    }
    
    rl.question('\nRun another scenario? (y/n): ', async (ans) => {
      if (ans.toLowerCase() === 'y') await showMenu();
      else { console.log('Exiting...'); process.exit(0); }
    });
  });
}

async function runScenario1() {
  console.log('\nPhase 1: Simulating RDBMS primary failure...');
  for (let i = 1; i <= 50; i++) {
    await fireSignal({
      component_id: "RDBMS_PRIMARY_01",
      component_type: "RDBMS",
      severity: "P0",
      error_code: "CONNECTION_POOL_EXHAUSTED",
      message: "Primary database connection pool exhausted. All write operations failing.",
      timestamp: new Date().toISOString()
    });
    if (i % 10 === 0) process.stdout.write(`Sent ${i}/50... `);
    if (i % 10 === 0 && i < 50) await wait(200);
  }
  
  console.log('\n\nWaiting 5 seconds before cascade...');
  await wait(5000);
  
  console.log('Phase 2: MCP processors failing due to DB dependency...');
  for (let i = 1; i <= 30; i++) {
    await fireSignal({
      component_id: "MCP_HOST_01",
      component_type: "MCP",
      severity: "P2",
      error_code: "MCP_DEPENDENCY_FAILURE",
      message: "MCP processor cannot reach RDBMS. Job queue backing up.",
      timestamp: new Date().toISOString()
    });
    await wait(100);
  }
  
  console.log('Waiting 3 seconds...');
  await wait(3000);
  
  console.log('Phase 3: API gateway timeouts spiking...');
  for (let i = 1; i <= 20; i++) {
    await fireSignal({
      component_id: "API_GATEWAY_01",
      component_type: "API",
      severity: "P1",
      error_code: "LATENCY_THRESHOLD_EXCEEDED",
      message: "API gateway p99 latency at 8400ms. SLA breach imminent.",
      timestamp: new Date().toISOString()
    });
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Simulation complete.');
  console.log('Signals sent: 100');
  console.log('Expected incidents created: 3 (debounced)');
  console.log('  → RDBMS_PRIMARY_01  P0  OPEN');
  console.log('  → MCP_HOST_01       P2  OPEN');
  console.log('  → API_GATEWAY_01    P1  OPEN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Open http://localhost:3000 to see incidents in the dashboard');
  console.log('Next steps:');
  console.log('  1. Go to Alarms page');
  console.log('  2. Click RDBMS_PRIMARY_01 incident');
  console.log('  3. Click Investigate → Resolve');
  console.log('  4. Submit RCA form');
  console.log('  5. Close the incident — MTTR will be calculated');
}

async function runScenario2() {
  console.log('\nTesting debounce logic — firing 100 signals for CACHE_CLUSTER_01...');
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(fireSignal({
      component_id: "CACHE_CLUSTER_01",
      component_type: "CACHE",
      severity: "P2",
      error_code: "CACHE_MISS_SPIKE",
      message: "Rapid spike in cache misses detected.",
      timestamp: new Date().toISOString()
    }));
  }
  await Promise.all(promises);
  console.log('100 signals sent.');
  console.log('Expected result: exactly 1 incident created (debounce working)');
  console.log('Check: GET http://localhost:8002/incidents | grep CACHE_CLUSTER_01');
}

async function runScenario3() {
  console.log('\nWARNING: This fires signals across all 6 component types simultaneously.');
  console.log('Press ENTER to confirm or Ctrl+C to cancel...');
  await new Promise(resolve => rl.once('line', resolve));
  
  console.log('Triggering disaster...');
  const components = [
    { id: 'RDBMS_PRIMARY_01', type: 'RDBMS', sev: 'P0', code: 'CONNECTION_POOL_EXHAUSTED' },
    { id: 'CACHE_CLUSTER_01', type: 'CACHE', sev: 'P2', code: 'CACHE_MISS_SPIKE' },
    { id: 'API_GATEWAY_01', type: 'API', sev: 'P1', code: 'LATENCY_THRESHOLD_EXCEEDED' },
    { id: 'ASYNC_QUEUE_01', type: 'QUEUE', sev: 'P1', code: 'QUEUE_DEPTH_EXCEEDED' },
    { id: 'MCP_HOST_01', type: 'MCP', sev: 'P2', code: 'MCP_PROCESSOR_TIMEOUT' },
    { id: 'NOSQL_CLUSTER_01', type: 'NOSQL', sev: 'P1', code: 'WRITE_TIMEOUT' }
  ];
  
  const promises = components.map(async (c) => {
    for (let i = 0; i < 30; i++) {
      await fireSignal({
        component_id: c.id,
        component_type: c.type,
        severity: c.sev,
        error_code: c.code,
        message: `Simulated ${c.type} failure in disaster scenario.`,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  await Promise.all(promises);
  console.log('Full stack disaster complete. 180 signals sent. 6 incidents expected.');
}

async function runScenario4() {
  const ask = (q, def) => new Promise(res => rl.question(`${q} (default: ${def}): `, ans => res(ans || def)));
  
  const component_id = await ask('Component ID', 'MY_SERVICE_01');
  const component_type = await ask('Component Type (RDBMS/CACHE/API/QUEUE/MCP/NOSQL)', 'API');
  const severity = await ask('Severity (P0/P1/P2/P3)', 'P2');
  const error_code = await ask('Error Code', 'CUSTOM_ERROR');
  const message = await ask('Message', 'Custom test signal');
  const count = parseInt(await ask('Count', '1'));
  
  console.log(`Firing ${count} signals...`);
  for (let i = 0; i < count; i++) {
    await fireSignal({
      component_id,
      component_type,
      severity,
      error_code,
      message,
      timestamp: new Date().toISOString()
    });
  }
  console.log('Done.');
}

showMenu();

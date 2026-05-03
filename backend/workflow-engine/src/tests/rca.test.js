import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { IncidentContext } from '../states/IncidentContext.js'
import { RCARequiredError } from '../utils/errors.js'

// Mock pgPool factory — returns controlled query results
function createMockPool(rcaRow = null, updateSuccess = true) {
  const client = {
    query: async (sql, params) => {
      if (sql.includes('SELECT * FROM rca_records')) {
        return { rows: rcaRow ? [rcaRow] : [] }
      }
      if (sql.includes('UPDATE work_items')) {
        if (!updateSuccess) throw new Error('DB write failed')
        return { rowCount: 1 }
      }
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
        return {}
      }
      return { rows: [] }
    },
    release: () => {}
  }
  return {
    connect: async () => client,
    query: async (sql, params) => {
      if (sql.includes('SELECT * FROM rca_records')) {
        return { rows: rcaRow ? [rcaRow] : [] }
      }
      return { rows: [] }
    }
  }
}

// Complete valid RCA fixture
const validRCA = {
  root_cause_category: 'CAPACITY_EXHAUSTION',
  fix_applied: 'Increased connection pool size from 10 to 50',
  prevention_steps: 'Add alerting when pool usage exceeds 80 percent',
  incident_start: '2026-05-03T10:00:00Z',
  incident_end: '2026-05-03T10:45:00Z'
}

test('close() throws RCARequiredError when no RCA exists', async () => {
  const incident = { id: 'test-uuid-001', status: 'RESOLVED', component_id: 'TEST_DB' }
  const pool = createMockPool(null)
  const context = new IncidentContext(incident, pool)
  
  await assert.rejects(
    async () => await context.close(),
    (err) => {
      assert.ok(err instanceof RCARequiredError)
      assert.match(err.message, /RCA record is missing/)
      assert.strictEqual(err.statusCode, 422)
      return true
    }
  )
})

test('close() throws RCARequiredError when root_cause_category is missing', async () => {
  const rca = { ...validRCA, root_cause_category: null }
  const incident = { id: 'test-uuid-001', status: 'RESOLVED', component_id: 'TEST_DB' }
  const pool = createMockPool(rca)
  const context = new IncidentContext(incident, pool)

  await assert.rejects(
    async () => await context.close(),
    { name: 'RCARequiredError', message: /root_cause_category/ }
  )
})

test('close() throws RCARequiredError when fix_applied is missing', async () => {
  const rca = { ...validRCA, fix_applied: null }
  const incident = { id: 'test-uuid-001', status: 'RESOLVED', component_id: 'TEST_DB' }
  const pool = createMockPool(rca)
  const context = new IncidentContext(incident, pool)

  await assert.rejects(
    async () => await context.close(),
    { name: 'RCARequiredError', message: /fix_applied/ }
  )
})

test('close() throws RCARequiredError when prevention_steps is missing', async () => {
  const rca = { ...validRCA, prevention_steps: null }
  const incident = { id: 'test-uuid-001', status: 'RESOLVED', component_id: 'TEST_DB' }
  const pool = createMockPool(rca)
  const context = new IncidentContext(incident, pool)

  await assert.rejects(
    async () => await context.close(),
    { name: 'RCARequiredError', message: /prevention_steps/ }
  )
})

test('close() throws RCARequiredError when incident_end is missing', async () => {
  const rca = { ...validRCA, incident_end: null }
  const incident = { id: 'test-uuid-001', status: 'RESOLVED', component_id: 'TEST_DB' }
  const pool = createMockPool(rca)
  const context = new IncidentContext(incident, pool)

  await assert.rejects(
    async () => await context.close(),
    { name: 'RCARequiredError', message: /incident_end/ }
  )
})

test('close() succeeds and calculates correct MTTR with valid RCA', async () => {
  const incident = { id: 'test-uuid-001', status: 'RESOLVED', component_id: 'TEST_DB' }
  const pool = createMockPool(validRCA)
  const context = new IncidentContext(incident, pool)

  await context.close()
  assert.strictEqual(context.getCurrentState(), 'CLOSED')
  
  const expectedMttr = (new Date(validRCA.incident_end) - new Date(validRCA.incident_start)) / 60000
  assert.strictEqual(expectedMttr, 45)
})

test('investigate() throws when incident is already CLOSED', async () => {
  const incident = { id: 'test-uuid-001', status: 'CLOSED', component_id: 'TEST_DB' }
  const pool = createMockPool()
  const context = new IncidentContext(incident, pool)

  await assert.rejects(
    async () => await context.investigate(),
    { message: /already CLOSED/ }
  )
})

test('OpenState cannot call resolve() directly', async () => {
  const incident = { id: 'test-uuid-001', status: 'OPEN', component_id: 'TEST_DB' }
  const pool = createMockPool()
  const context = new IncidentContext(incident, pool)

  await assert.rejects(
    async () => await context.resolve(),
    (err) => {
      assert.doesNotMatch(err.message, /CLOSED/)
      assert.match(err.message, /resolve|INVESTIGATING/i)
      return true
    }
  )
})

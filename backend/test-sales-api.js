#!/usr/bin/env node

/**
 * Test Sales API Endpoints
 * Run this script to test if the sales API is working correctly
 */

const BASE_URL = 'http://localhost:8080/api';

// Test authentication first
async function testAuth() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Authentication successful');
    console.log('   User:', data.user?.email);
    console.log('   Role:', data.user?.role);
    
    return data.accessToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    return null;
  }
}

// Test getting sales
async function testGetSales(token) {
  console.log('\n📊 Testing GET /api/sales...');
  
  if (!token) {
    console.error('❌ No authentication token available');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/sales`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Sales loaded successfully');
    console.log('   Sales count:', data.sales?.length || 0);
    console.log('   Total records:', data.total || 0);
    console.log('   Response structure:', Object.keys(data));
    
    if (data.sales && data.sales.length > 0) {
      console.log('\n   Sample sale:');
      const sale = data.sales[0];
      console.log('   - ID:', sale._id);
      console.log('   - Customer:', sale.customerName || sale.customer?.name);
      console.log('   - Total:', sale.totalAmount);
      console.log('   - Status:', sale.status);
      console.log('   - Items:', sale.items?.length);
    }
  } catch (error) {
    console.error('❌ Failed to get sales:', error.message);
  }
}

// Test database health
async function testDatabaseHealth(token) {
  console.log('\n🏥 Testing GET /api/database/health...');
  
  if (!token) {
    console.error('❌ No authentication token available');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/database/health`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Database health check successful');
    console.log('   Customers:', data.data?.collections?.customers?.count || 0);
    console.log('   Sales:', data.data?.collections?.sales?.count || 0);
    console.log('   Products:', data.data?.collections?.products?.count || 0);
    console.log('   Indexes valid:', data.data?.indexesValid ? 'Yes' : 'No');
  } catch (error) {
    console.error('❌ Failed to get database health:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Al-Masdar Security - Sales API Tests');
  console.log('=====================================');
  
  const token = await testAuth();
  
  if (token) {
    await testGetSales(token);
    await testDatabaseHealth(token);
  }
  
  console.log('\n✨ Tests completed!\n');
}

// Run the tests
runTests().catch(console.error);

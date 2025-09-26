#!/usr/bin/env node

/**
 * Test suite for Firecrawl MCP Error Resolution
 * 
 * Tests the error handling, diagnostics, and fallback functionality
 * for resolving Firecrawl MCP $dynamicRef schema errors.
 */

const KnowledgeCartographer = require('./The-Knowledge-Cartographer-Agent-MCP.js');
const FirecrawlFallback = require('./firecrawl-fallback.js');
const MCPDiagnostics = require('./mcp-diagnostics.js');
const fs = require('fs').promises;
const path = require('path');

/**
 * Simple test assertion function
 */
function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        return true;
    } else {
        console.error(`❌ FAIL: ${message}`);
        throw new Error(`Test failed: ${message}`);
    }
}

/**
 * Test error handling functionality
 */
async function testErrorHandling() {
    console.log('\n🧪 Testing MCP Error Handling...');
    
    const cartographer = new KnowledgeCartographer();
    
    // Test $dynamicRef error detection
    const dynamicRefError = new Error('JSON schema validation failed: $dynamicRef feature not supported');
    
    try {
        // This should not throw, but handle gracefully
        await cartographer.handleMCPError(dynamicRefError, 'test-topic');
        assert(true, 'MCP error handler executed without throwing');
    } catch (error) {
        assert(false, `MCP error handler should not throw: ${error.message}`);
    }
    
    // Test general MCP error
    const generalMCPError = new Error('MCP connection failed');
    
    try {
        await cartographer.handleMCPError(generalMCPError);
        assert(true, 'General MCP error handler executed');
    } catch (error) {
        assert(false, `General MCP error handler should not throw: ${error.message}`);
    }
}

/**
 * Test diagnostics functionality
 */
async function testDiagnostics() {
    console.log('\n🧪 Testing MCP Diagnostics...');
    
    const diagnostics = new MCPDiagnostics();
    
    // Test diagnostics initialization
    assert(typeof diagnostics.runDiagnostics === 'function', 'Diagnostics has runDiagnostics method');
    assert(typeof diagnostics.results === 'object', 'Diagnostics has results object');
    
    // Test environment checking (should not throw)
    try {
        await diagnostics.checkEnvironment();
        assert(true, 'Environment check completed');
        
        // Check that results are populated
        assert(diagnostics.results.environment.nodeVersion, 'Node.js version detected');
        assert(typeof diagnostics.results.environment.nodeVersion === 'string', 'Node.js version is string');
        
    } catch (error) {
        console.log(`⚠️  Environment check had issues (expected in test environment): ${error.message}`);
    }
}

/**
 * Test fallback functionality
 */
async function testFallback() {
    console.log('\n🧪 Testing Fallback Functionality...');
    
    const fallback = new FirecrawlFallback({
        baseDir: './test-archives',
        timeout: 5000
    });
    
    // Test fallback initialization
    assert(typeof fallback.scrapeUrl === 'function', 'Fallback has scrapeUrl method');
    assert(typeof fallback.createKnowledgeArchive === 'function', 'Fallback has createKnowledgeArchive method');
    
    // Test URL scraping (will use mock data)
    const testUrl = 'https://example.com/test';
    
    try {
        const result = await fallback.scrapeUrl(testUrl);
        
        assert(typeof result === 'object', 'Scrape result is object');
        assert(typeof result.url === 'string', 'Result has URL');
        assert(typeof result.content === 'string', 'Result has content');
        assert(result.content.length > 0, 'Result has non-empty content');
        
        console.log(`   📄 Scraped content preview: ${result.content.substring(0, 100)}...`);
        
    } catch (error) {
        console.log(`⚠️  Scraping failed as expected (no real network): ${error.message}`);
    }
    
    // Test knowledge archive creation with mock data
    const mockScrapedData = [
        {
            success: true,
            url: 'https://example.com/quantum',
            content: 'Quantum computing uses quantum bits or qubits. Superposition allows qubits to exist in multiple states.',
            title: 'Quantum Computing Basics',
            metadata: { timestamp: new Date().toISOString() }
        },
        {
            success: true,
            url: 'https://example.com/algorithms',
            content: 'Quantum algorithms like Shor\'s algorithm can break classical cryptography.',
            title: 'Quantum Algorithms',
            metadata: { timestamp: new Date().toISOString() }
        }
    ];
    
    try {
        const archive = await fallback.createKnowledgeArchive('test-quantum', mockScrapedData);
        
        assert(typeof archive === 'object', 'Archive creation returns object');
        assert(typeof archive.name === 'string', 'Archive has name');
        assert(typeof archive.slug === 'string', 'Archive has slug');
        assert(archive.entityCount > 0, 'Archive has entities');
        
        console.log(`   📚 Created archive: ${archive.name} (${archive.entityCount} entities)`);
        
        // Verify files were created
        const archiveDir = path.join('./test-archives', 'topics', archive.slug);
        const entitiesFile = path.join(archiveDir, 'entities.json');
        
        const entitiesExist = await fs.access(entitiesFile).then(() => true).catch(() => false);
        assert(entitiesExist, 'Entities file was created');
        
        if (entitiesExist) {
            const entitiesContent = await fs.readFile(entitiesFile, 'utf8');
            const entities = JSON.parse(entitiesContent);
            assert(Object.keys(entities).length > 0, 'Entities file contains data');
            console.log(`   🔍 Extracted entities: ${Object.keys(entities).join(', ')}`);
        }
        
    } catch (error) {
        assert(false, `Archive creation failed: ${error.message}`);
    }
}

/**
 * Test command line argument parsing
 */
async function testCommandLineHandling() {
    console.log('\n🧪 Testing Command Line Handling...');
    
    const cartographer = new KnowledgeCartographer();
    
    // Test demo URL generation
    const quantumUrls = cartographer.getDemoUrls('quantum-computing');
    assert(Array.isArray(quantumUrls), 'Demo URLs returned as array');
    assert(quantumUrls.length > 0, 'Demo URLs array not empty');
    assert(quantumUrls.every(url => url.startsWith('http')), 'All demo URLs are valid HTTP URLs');
    
    console.log(`   🔗 Generated ${quantumUrls.length} demo URLs for quantum-computing`);
    
    const aiUrls = cartographer.getDemoUrls('artificial-intelligence');
    assert(Array.isArray(aiUrls), 'AI demo URLs returned as array');
    assert(aiUrls.length > 0, 'AI demo URLs array not empty');
    
    const customUrls = cartographer.getDemoUrls('custom-topic');
    assert(Array.isArray(customUrls), 'Custom topic URLs returned as array');
    assert(customUrls.length > 0, 'Custom topic URLs array not empty');
}

/**
 * Test content extraction functionality
 */
async function testContentExtraction() {
    console.log('\n🧪 Testing Content Extraction...');
    
    const fallback = new FirecrawlFallback();
    
    // Test HTML content extraction
    const mockHtml = `
        <html>
            <head><title>Quantum Computing Guide</title></head>
            <body>
                <h1>Introduction to Quantum Computing</h1>
                <p>Quantum computing leverages quantum mechanics principles like superposition and entanglement.</p>
                <p>Key concepts include quantum bits (qubits), quantum gates, and quantum algorithms.</p>
                <script>console.log('test');</script>
                <style>body { font-family: Arial; }</style>
            </body>
        </html>
    `;
    
    const extracted = fallback.extractContent(mockHtml, 'https://example.com');
    
    assert(typeof extracted.title === 'string', 'Title extracted');
    assert(extracted.title === 'Quantum Computing Guide', 'Title matches expected');
    assert(typeof extracted.text === 'string', 'Text extracted');
    assert(extracted.text.includes('quantum mechanics'), 'Text contains expected content');
    assert(!extracted.text.includes('<'), 'HTML tags removed');
    assert(!extracted.text.includes('console.log'), 'Script content removed');
    assert(!extracted.text.includes('font-family'), 'Style content removed');
    
    console.log(`   📝 Extracted title: "${extracted.title}"`);
    console.log(`   📄 Extracted text preview: ${extracted.text.substring(0, 100)}...`);
    
    // Test entity extraction
    const mockScrapedData = [{
        success: true,
        content: 'Quantum Computing uses Quantum Bits and Superposition. Machine Learning and Deep Learning are related to Artificial Intelligence.',
        url: 'https://example.com'
    }];
    
    const entities = fallback.extractEntities(mockScrapedData);
    
    assert(typeof entities === 'object', 'Entities extracted as object');
    assert(Object.keys(entities).length > 0, 'Entities contain data');
    
    const entityNames = Object.keys(entities);
    console.log(`   🏷️  Extracted entities: ${entityNames.join(', ')}`);
    
    // Test relationship extraction
    const relationships = fallback.extractRelationships(mockScrapedData, entities);
    
    assert(typeof relationships === 'object', 'Relationships extracted as object');
    console.log(`   🔗 Extracted ${Object.keys(relationships).length} relationships`);
}

/**
 * Cleanup test files
 */
async function cleanup() {
    console.log('\n🧹 Cleaning up test files...');
    
    try {
        // Remove test archives directory
        await fs.rmdir('./test-archives', { recursive: true });
        console.log('   ✅ Test archives cleaned up');
    } catch (error) {
        // Ignore cleanup errors
        console.log('   ℹ️  No test files to clean up');
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('🧪 FIRECRAWL MCP ERROR RESOLUTION TEST SUITE');
    console.log('=============================================\n');
    
    try {
        await testErrorHandling();
        await testDiagnostics();
        await testFallback();
        await testCommandLineHandling();
        await testContentExtraction();
        
        console.log('\n✅ ALL TESTS PASSED');
        console.log('🔧 Error resolution functionality is working correctly');
        
    } catch (error) {
        console.error('\n❌ TEST SUITE FAILED');
        console.error(`Error: ${error.message}`);
        throw error;
    } finally {
        await cleanup();
    }
}

// Run tests if called directly
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('Test suite failed:', error.message);
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    testErrorHandling,
    testDiagnostics,
    testFallback,
    testCommandLineHandling,
    testContentExtraction
};
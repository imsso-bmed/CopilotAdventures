#!/usr/bin/env node

/**
 * MCP Diagnostics Tool - Firecrawl Error Resolution
 * 
 * This tool helps diagnose and resolve Firecrawl MCP connection issues,
 * particularly the $dynamicRef JSON schema error.
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class MCPDiagnostics {
    constructor() {
        this.results = {
            environment: {},
            mcpConfig: {},
            connections: {},
            errors: [],
            recommendations: []
        };
    }

    async runDiagnostics() {
        console.log('🔍 MCP Diagnostics Tool - Firecrawl Error Resolution');
        console.log('====================================================\n');

        try {
            await this.checkEnvironment();
            await this.checkMCPConfiguration();
            await this.testConnections();
            await this.generateReport();
        } catch (error) {
            console.error('❌ Diagnostic error:', error.message);
            this.results.errors.push(`Diagnostic failure: ${error.message}`);
        }

        this.displayResults();
    }

    async checkEnvironment() {
        console.log('🔧 Checking Environment...');
        
        // Check Node.js version
        this.results.environment.nodeVersion = process.version;
        console.log(`   Node.js: ${process.version}`);

        // Check if VS Code is available
        try {
            const vscodeVersion = await this.runCommand('code', ['--version']);
            this.results.environment.vscode = vscodeVersion.split('\n')[0];
            console.log(`   VS Code: ${this.results.environment.vscode}`);
        } catch (error) {
            this.results.environment.vscode = 'Not available';
            console.log('   VS Code: Not found in PATH');
        }

        // Check npx availability
        try {
            const npxVersion = await this.runCommand('npx', ['--version']);
            this.results.environment.npx = npxVersion.trim();
            console.log(`   npx: ${this.results.environment.npx}`);
        } catch (error) {
            this.results.errors.push('npx not available - required for MCP tools');
        }
    }

    async checkMCPConfiguration() {
        console.log('\n📋 Checking MCP Configuration...');
        
        const mcpConfigPath = path.join(process.cwd(), '.vscode', 'mcp.json');
        
        try {
            const configContent = await fs.readFile(mcpConfigPath, 'utf8');
            const config = JSON.parse(configContent);
            
            this.results.mcpConfig.found = true;
            this.results.mcpConfig.path = mcpConfigPath;
            this.results.mcpConfig.servers = Object.keys(config.servers || {});
            
            console.log(`   ✅ MCP config found: ${mcpConfigPath}`);
            console.log(`   📄 Configured servers: ${this.results.mcpConfig.servers.join(', ')}`);
            
            // Check for Firecrawl configuration
            if (config.servers.firecrawl) {
                console.log('   🔍 Firecrawl server configured');
                this.results.mcpConfig.firecrawlConfigured = true;
                
                // Check API key configuration
                const apiKeyConfig = config.servers.firecrawl.env?.FIRECRAWL_API_KEY;
                if (apiKeyConfig) {
                    console.log(`   🔑 API key configuration: ${apiKeyConfig}`);
                    this.results.mcpConfig.apiKeyConfigured = true;
                } else {
                    this.results.errors.push('Firecrawl API key not configured');
                }
            } else {
                this.results.errors.push('Firecrawl server not configured in MCP');
            }
            
        } catch (error) {
            this.results.mcpConfig.found = false;
            this.results.errors.push(`MCP configuration not found: ${error.message}`);
            console.log('   ❌ No MCP configuration found');
        }
    }

    async testConnections() {
        console.log('\n🌐 Testing MCP Connections...');
        
        // Test Firecrawl package availability
        try {
            console.log('   🔄 Testing firecrawl-mcp package...');
            const result = await this.runCommand('npx', ['-y', 'firecrawl-mcp', '--help'], 10000);
            
            if (result.includes('$dynamicRef') || result.includes('schema')) {
                this.results.connections.firecrawlSchema = 'potential_issue';
                console.log('   ⚠️  Potential schema compatibility issue detected');
                this.results.recommendations.push('Use fallback scraping method due to schema compatibility');
            } else {
                this.results.connections.firecrawlPackage = 'available';
                console.log('   ✅ Firecrawl MCP package accessible');
            }
        } catch (error) {
            this.results.connections.firecrawlPackage = 'error';
            this.results.errors.push(`Firecrawl MCP package error: ${error.message}`);
            console.log('   ❌ Firecrawl MCP package not accessible');
        }

        // Test File System MCP
        try {
            console.log('   🔄 Testing filesystem MCP...');
            await this.runCommand('npx', ['-y', '@modelcontextprotocol/server-filesystem', '--help'], 5000);
            this.results.connections.filesystemMcp = 'available';
            console.log('   ✅ File System MCP package accessible');
        } catch (error) {
            this.results.connections.filesystemMcp = 'error';
            console.log('   ❌ File System MCP package not accessible');
        }
    }

    async generateReport() {
        console.log('\n📊 Generating Recommendations...');
        
        // Analyze results and generate recommendations
        if (this.results.errors.length === 0) {
            this.results.recommendations.push('All checks passed - MCP should work normally');
        } else {
            if (this.results.errors.some(e => e.includes('$dynamicRef') || e.includes('schema'))) {
                this.results.recommendations.push('Use alternative MCP configuration to avoid schema issues');
                this.results.recommendations.push('Consider using direct API calls as fallback');
            }
            
            if (!this.results.mcpConfig.found) {
                this.results.recommendations.push('Create .vscode/mcp.json configuration file');
            }
            
            if (!this.results.mcpConfig.apiKeyConfigured) {
                this.results.recommendations.push('Configure Firecrawl API key in MCP settings');
            }
        }
    }

    displayResults() {
        console.log('\n📋 DIAGNOSTIC RESULTS');
        console.log('====================');
        
        console.log('\n🔧 Environment Status:');
        console.log(`   Node.js: ${this.results.environment.nodeVersion}`);
        console.log(`   VS Code: ${this.results.environment.vscode || 'Not detected'}`);
        console.log(`   npx: ${this.results.environment.npx || 'Not available'}`);
        
        console.log('\n📋 MCP Configuration:');
        console.log(`   Config found: ${this.results.mcpConfig.found ? '✅' : '❌'}`);
        console.log(`   Firecrawl configured: ${this.results.mcpConfig.firecrawlConfigured ? '✅' : '❌'}`);
        console.log(`   API key configured: ${this.results.mcpConfig.apiKeyConfigured ? '✅' : '❌'}`);
        
        console.log('\n🌐 Connection Status:');
        console.log(`   Firecrawl MCP: ${this.getStatusIcon(this.results.connections.firecrawlPackage)}`);
        console.log(`   File System MCP: ${this.getStatusIcon(this.results.connections.filesystemMcp)}`);
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ Issues Found:');
            this.results.errors.forEach(error => {
                console.log(`   • ${error}`);
            });
        }
        
        if (this.results.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            this.results.recommendations.forEach(rec => {
                console.log(`   • ${rec}`);
            });
        }
        
        console.log('\n🔗 Next Steps:');
        if (this.results.errors.some(e => e.includes('schema') || e.includes('$dynamicRef'))) {
            console.log('   1. Run: node firecrawl-fallback.js (use alternative implementation)');
            console.log('   2. Update VS Code and GitHub Copilot to latest versions');
            console.log('   3. Try alternative MCP configuration in .vscode/mcp.json');
        } else if (this.results.errors.length === 0) {
            console.log('   1. Your MCP setup appears to be working correctly');
            console.log('   2. Run: node The-Knowledge-Cartographer-Agent-MCP.js');
        } else {
            console.log('   1. Fix configuration issues listed above');
            console.log('   2. Re-run diagnostics: node mcp-diagnostics.js');
        }
    }

    getStatusIcon(status) {
        switch (status) {
            case 'available': return '✅ Available';
            case 'error': return '❌ Error';
            case 'potential_issue': return '⚠️  Potential Issue';
            default: return '❓ Unknown';
        }
    }

    runCommand(command, args, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, { stdio: 'pipe' });
            let output = '';
            let errorOutput = '';
            
            const timer = setTimeout(() => {
                child.kill();
                reject(new Error(`Command timeout: ${command} ${args.join(' ')}`));
            }, timeout);
            
            child.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            child.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            child.on('close', (code) => {
                clearTimeout(timer);
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(errorOutput || `Command failed with code ${code}`));
                }
            });
            
            child.on('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }
}

// Run diagnostics if called directly
if (require.main === module) {
    const diagnostics = new MCPDiagnostics();
    diagnostics.runDiagnostics().catch(console.error);
}

module.exports = MCPDiagnostics;
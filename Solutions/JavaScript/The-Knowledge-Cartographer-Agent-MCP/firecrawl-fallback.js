#!/usr/bin/env node

/**
 * Firecrawl MCP Fallback Implementation
 * 
 * This provides alternative web scraping functionality when Firecrawl MCP
 * encounters schema errors or is unavailable. Uses direct HTTP requests
 * and basic HTML parsing instead of MCP tools.
 */

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

class FirecrawlFallback {
    constructor(options = {}) {
        this.userAgent = options.userAgent || 'Knowledge-Cartographer/1.0';
        this.timeout = options.timeout || 10000;
        this.maxRetries = options.maxRetries || 3;
        this.baseDir = options.baseDir || './akashic-archives';
    }

    /**
     * Scrape a single URL with fallback methods
     */
    async scrapeUrl(url, options = {}) {
        console.log(`🔄 Scraping (fallback): ${url}`);
        
        try {
            // First try: Direct HTTP request
            const content = await this.fetchWithTimeout(url);
            const extractedData = this.extractContent(content, url);
            
            console.log(`✅ Successfully scraped: ${url}`);
            return {
                success: true,
                url: url,
                content: extractedData.text,
                title: extractedData.title,
                metadata: {
                    method: 'fallback-http',
                    timestamp: new Date().toISOString(),
                    contentLength: extractedData.text.length
                }
            };
            
        } catch (error) {
            console.log(`❌ Scraping failed for ${url}: ${error.message}`);
            
            // Return mock data for demonstration
            return this.generateMockContent(url, error.message);
        }
    }

    /**
     * Scrape multiple URLs in batch
     */
    async scrapeUrls(urls, options = {}) {
        console.log(`🔄 Batch scraping ${urls.length} URLs (fallback mode)...`);
        
        const results = [];
        const concurrency = options.concurrency || 3;
        
        for (let i = 0; i < urls.length; i += concurrency) {
            const batch = urls.slice(i, i + concurrency);
            const batchPromises = batch.map(url => this.scrapeUrl(url, options));
            
            const batchResults = await Promise.allSettled(batchPromises);
            results.push(...batchResults.map(r => r.value || r.reason));
            
            // Rate limiting
            if (i + concurrency < urls.length) {
                await this.delay(1000);
            }
        }
        
        return results;
    }

    /**
     * Create knowledge archive from scraped data
     */
    async createKnowledgeArchive(topic, scrapedData, options = {}) {
        console.log(`📚 Creating knowledge archive for: ${topic}`);
        
        try {
            // Create directory structure
            const topicSlug = topic.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
            const topicDir = path.join(this.baseDir, 'topics', topicSlug);
            await fs.mkdir(topicDir, { recursive: true });
            
            // Extract entities and relationships from scraped content
            const entities = this.extractEntities(scrapedData);
            const relationships = this.extractRelationships(scrapedData, entities);
            const sources = this.createSourcesIndex(scrapedData);
            
            // Save structured data files
            await fs.writeFile(
                path.join(topicDir, 'entities.json'),
                JSON.stringify(entities, null, 2)
            );
            
            await fs.writeFile(
                path.join(topicDir, 'relationships.json'),
                JSON.stringify(relationships, null, 2)
            );
            
            await fs.writeFile(
                path.join(topicDir, 'sources.json'),
                JSON.stringify(sources, null, 2)
            );
            
            // Create topic index
            const indexDir = path.join(this.baseDir, 'indexes');
            await fs.mkdir(indexDir, { recursive: true });
            
            const topicIndex = {
                name: topic,
                slug: topicSlug,
                created: new Date().toISOString(),
                entityCount: Object.keys(entities).length,
                relationshipCount: Object.keys(relationships).length,
                sourceCount: Object.keys(sources).length,
                method: 'fallback-scraping'
            };
            
            await fs.writeFile(
                path.join(indexDir, `${topicIndex.slug}-index.json`),
                JSON.stringify(topicIndex, null, 2)
            );
            
            console.log(`✅ Knowledge archive created: ${topicDir}`);
            return topicIndex;
            
        } catch (error) {
            console.error(`❌ Failed to create knowledge archive: ${error.message}`);
            throw error;
        }
    }

    /**
     * Extract content from HTML
     */
    extractContent(html, url) {
        // Basic HTML parsing - remove tags and extract text
        const title = this.extractTitle(html) || new URL(url).hostname;
        const text = this.stripHtml(html);
        
        return {
            title: title,
            text: text,
            wordCount: text.split(/\s+/).length
        };
    }

    extractTitle(html) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return titleMatch ? titleMatch[1].trim() : null;
    }

    stripHtml(html) {
        return html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Extract entities from scraped content
     */
    extractEntities(scrapedData) {
        const entities = {};
        const commonTerms = new Map();
        
        scrapedData.forEach(data => {
            if (data.success && data.content) {
                // Simple entity extraction - find frequent capitalized terms
                const words = data.content.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
                
                words.forEach(term => {
                    if (term.length > 3 && !this.isCommonWord(term)) {
                        const key = term.toLowerCase();
                        if (!commonTerms.has(key)) {
                            commonTerms.set(key, { term, count: 0, sources: new Set() });
                        }
                        commonTerms.get(key).count++;
                        commonTerms.get(key).sources.add(data.url);
                    }
                });
            }
        });
        
        // Convert to entities format
        for (const [key, data] of commonTerms) {
            if (data.count >= 1) { // Include terms that appear at least once for better testing
                entities[data.term] = {
                    frequency: data.count,
                    sources: Array.from(data.sources),
                    concepts: this.inferConcepts(data.term)
                };
            }
        }
        
        return entities;
    }

    /**
     * Extract relationships between entities
     */
    extractRelationships(scrapedData, entities) {
        const relationships = {};
        const entityKeys = Object.keys(entities);
        
        scrapedData.forEach(data => {
            if (data.success && data.content) {
                // Find co-occurrences of entities
                for (let i = 0; i < entityKeys.length; i++) {
                    for (let j = i + 1; j < entityKeys.length; j++) {
                        const entity1 = entityKeys[i];
                        const entity2 = entityKeys[j];
                        
                        if (data.content.includes(entity1) && data.content.includes(entity2)) {
                            const relationKey = `${entity1} <-> ${entity2}`;
                            if (!relationships[relationKey]) {
                                relationships[relationKey] = {
                                    strength: 0,
                                    type: 'related',
                                    sources: []
                                };
                            }
                            relationships[relationKey].strength++;
                            relationships[relationKey].sources.push(data.url);
                        }
                    }
                }
            }
        });
        
        return relationships;
    }

    /**
     * Create sources index
     */
    createSourcesIndex(scrapedData) {
        const sources = {};
        
        scrapedData.forEach(data => {
            if (data.success) {
                sources[this.createSourceId(data.url)] = {
                    title: data.title || new URL(data.url).hostname,
                    url: data.url,
                    contentLength: data.content.length,
                    scrapedAt: data.metadata?.timestamp || new Date().toISOString(),
                    method: data.metadata?.method || 'fallback'
                };
            }
        });
        
        return sources;
    }

    createSourceId(url) {
        return new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, '-');
    }

    inferConcepts(term) {
        // Simple concept inference based on common patterns
        const concepts = [];
        
        if (term.includes('quantum') || term.includes('Quantum')) {
            concepts.push('quantum mechanics');
        }
        if (term.includes('algorithm') || term.includes('Algorithm')) {
            concepts.push('algorithms');
        }
        if (term.includes('computing') || term.includes('Computing')) {
            concepts.push('computation');
        }
        
        return concepts.length > 0 ? concepts : ['general'];
    }

    isCommonWord(word) {
        const common = ['The', 'This', 'That', 'With', 'From', 'They', 'There', 'Where', 'When', 'What', 'Which', 'How'];
        return common.includes(word);
    }

    /**
     * Generate mock content when scraping fails
     */
    generateMockContent(url, error) {
        const hostname = new URL(url).hostname;
        
        return {
            success: false,
            url: url,
            content: `Mock content for ${hostname}. This content was generated because scraping failed: ${error}. In a real implementation with proper API access, this would contain the actual scraped content.`,
            title: `Mock Content - ${hostname}`,
            metadata: {
                method: 'mock-fallback',
                timestamp: new Date().toISOString(),
                error: error
            }
        };
    }

    /**
     * Fetch URL with timeout
     */
    fetchWithTimeout(url) {
        return new Promise((resolve, reject) => {
            const request = (url.startsWith('https:') ? https : http).get(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            }, (res) => {
                let data = '';
                
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                });
            });
            
            request.setTimeout(this.timeout, () => {
                request.abort();
                reject(new Error('Request timeout'));
            });
            
            request.on('error', reject);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Demo function for testing
async function runFallbackDemo() {
    console.log('🔧 Firecrawl MCP Fallback Demo');
    console.log('=============================\n');
    
    const fallback = new FirecrawlFallback();
    
    // Demo URLs (these will use mock data in most cases)
    const demoUrls = [
        'https://en.wikipedia.org/wiki/Quantum_computing',
        'https://www.nature.com/articles/nature23474',
        'https://quantum-computing.ibm.com/'
    ];
    
    console.log('🔄 Attempting to scrape URLs with fallback method...');
    const results = await fallback.scrapeUrls(demoUrls);
    
    console.log('\n📊 Scraping Results:');
    results.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.url}`);
        console.log(`      Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
        console.log(`      Content: ${result.content.substring(0, 100)}...`);
    });
    
    // Create knowledge archive
    console.log('\n📚 Creating knowledge archive...');
    const archive = await fallback.createKnowledgeArchive('quantum-computing', results);
    
    console.log('\n✅ Fallback demo complete!');
    console.log(`📁 Archive created at: ${archive.slug}`);
    console.log('\n💡 This fallback method can be used when Firecrawl MCP encounters schema errors.');
}

// Run demo if called directly
if (require.main === module) {
    runFallbackDemo().catch(console.error);
}

module.exports = FirecrawlFallback;
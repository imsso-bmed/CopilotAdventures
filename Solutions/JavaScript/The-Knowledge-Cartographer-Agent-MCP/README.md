# The Knowledge Cartographer - Agent Mode + MCP Solution

This JavaScript application demonstrates the **correct approach** for working with GitHub Copilot Agent Mode + MCP tools, including comprehensive error resolution for Firecrawl MCP issues.

## 🚨 Firecrawl MCP Error Resolution

### The $dynamicRef Schema Error

If you encounter errors like:
```
JSON schema validation failed: $dynamicRef feature not supported
Schema parsing error in firecrawl_scrape tool
MCP tool initialization failure
```

This is a **known compatibility issue** with Firecrawl MCP's use of advanced JSON schema features that aren't supported in all environments.

### Quick Fix Commands

```bash
# 1. Run diagnostics to identify the issue
npm run diagnostics

# 2. Use fallback scraping if MCP fails
npm run fallback

# 3. Test the error resolution
npm test

# 4. Get comprehensive help
npm run help
```

### Resolution Strategies

1. **Environment Update**: Update VS Code and GitHub Copilot to latest versions
2. **Alternative Configuration**: Use simplified MCP settings
3. **Fallback Implementation**: Direct web scraping when MCP fails
4. **Diagnostic Tools**: Identify and resolve specific issues

## Features

### 🔧 Error Resolution Tools
- **MCP Diagnostics**: Comprehensive environment and connection testing
- **Fallback Scraping**: Alternative web scraping when MCP fails
- **Error Detection**: Automatic identification of MCP schema issues
- **Recovery Options**: Multiple strategies for continuing work

### 🔍 Core Knowledge Features
- Reads structured data files created by MCP tools
- Loads entities, relationships, and source information
- Supports multiple knowledge domains/topics
- Knowledge graph analysis and relationship mapping
- Interactive exploration CLI

## Usage

### Basic Exploration
```bash
# Explore a knowledge domain
node The-Knowledge-Cartographer-Agent-MCP.js "quantum computing"

# Interactive mode
node The-Knowledge-Cartographer-Agent-MCP.js --interactive
```

### Error Resolution
```bash
# Run full MCP diagnostics
node The-Knowledge-Cartographer-Agent-MCP.js --diagnostics

# Use fallback scraping for a topic
node The-Knowledge-Cartographer-Agent-MCP.js --use-fallback "quantum computing"

# Get help with error resolution
node The-Knowledge-Cartographer-Agent-MCP.js --help
```

### Available Scripts
```bash
npm start              # Run knowledge cartographer
npm run interactive    # Interactive exploration mode
npm run diagnostics    # Run MCP diagnostics
npm run fallback       # Use fallback scraping
npm run fix-mcp        # Comprehensive MCP troubleshooting
npm test              # Run error resolution tests
```

### Interactive Commands
```
> list                           # Show all available knowledge domains
> load quantum computing         # Load a specific knowledge domain
> overview                       # Show current topic overview
> find "quantum bit"             # Find connections for an entity
> relationships                  # Explore knowledge graph relationships
> sources                        # Show original source materials
> entities                       # List all entities in current topic
> help                           # Show available commands
> exit                           # Exit the system
```

## File Structure Expected

The application expects to find knowledge archives created by MCP tools:

```
akashic-archives-demo/               # Created by File System MCP
├── topics/
│   └── quantum-computing/
│       ├── entities.json            # Entities extracted by FireCrawl MCP
│       ├── relationships.json       # Relationships identified by Agent Mode
│       └── sources.json             # Original sources scraped by FireCrawl MCP
└── indexes/
    └── quantum-computing-index.json # Topic metadata organized by File System MCP
```

**In Real Usage:** GitHub Copilot Agent Mode would have already used MCP tools to create these files before your application runs.

## How This Relates to MCP + Agent Mode

This implementation demonstrates the **correct architecture** for MCP + Agent Mode integration:

### Real Usage Flow:
1. **GitHub Copilot Agent Mode** → Uses **FireCrawl MCP Server** → Scrapes real web content
2. **Agent Mode** → Passes scraped data to **Your Application** → Processes knowledge
3. **Your Application** → Requests file operations via **Agent Mode** → **File System MCP** saves files
4. **Your Application** → Focuses purely on business logic (graphs, analysis, CLI)

### What Each Component Does:
- **FireCrawl MCP**: Web scraping, JavaScript rendering, batch processing
- **File System MCP**: File/directory operations, structured storage  
- **Agent Mode**: Orchestrates MCP tools and coordinates with your application
- **Your Application**: Knowledge extraction, graph construction, user interface

## Key Learning Points

🔧 **Correct MCP Architecture**
- **Separation of Concerns**: MCP tools handle external operations, your app handles business logic
- **Data Flow**: MCP → Agent Mode → Your Application (not MCP → Your Application)
- **Agent Mode Orchestration**: Agent Mode coordinates between multiple MCP tools and your application

🧠 **Application Responsibilities**  
- Process data provided by MCP tools (don't duplicate MCP functionality)
- Focus on domain-specific logic (knowledge graphs, entity extraction, analysis)
- Provide user interfaces and interaction patterns

📊 **MCP Tool Responsibilities**
- **FireCrawl MCP**: Web scraping, content extraction, JavaScript rendering
- **File System MCP**: File operations, directory management, data persistence
- **Agent Mode**: Tool coordination, data passing, error handling

## Sample Output

```
🗺️ Welcome to the Knowledge Cartographer! 🗺️

🔗 Initializing MCP connections...
✅ FireCrawl MCP Server: Connected (simulated)
✅ File System MCP Server: Connected (simulated)

🔮 Initiating knowledge discovery for: "quantum computing"
📡 This application processes data provided by MCP tools
🤖 GitHub Copilot Agent Mode would call FireCrawl MCP to scrape web content

🔍 Phase 1: Processing Web Content (provided by FireCrawl MCP)
📚 Analyzing 3 sources scraped by MCP tools
   📄 Processing: "Introduction to Quantum Computing" from https://example.com/quantum-computing-basics
       Content size: 2.4KB

🧠 Phase 2: Knowledge Extraction
   📄 Processing: "Introduction to Quantum Computing"
      Entities: [quantum bit, superposition, entanglement, quantum gate]
      Concepts: [quantum mechanics, computation theory, algorithmic complexity]

🗂️ Phase 3: Knowledge Organization (using File System MCP)
   📁 Requesting MCP to create knowledge base structure...
   ✅ MCP successfully organized knowledge files

🕸️ Phase 4: Graph Construction
   📊 Building knowledge graph...
   • Nodes: 19 entities and concepts
   • Edges: 42 relationships
   • Clusters: 3 concept groups

✨ Knowledge discovery complete!
```

## Technical Implementation

- **Node.js**: Core runtime for the application
- **File System Operations**: Organized storage with proper directory structure  
- **Graph Algorithms**: Relationship mapping and cluster identification
- **Interactive CLI**: Readline interface for user exploration
- **Export Formats**: JSON, DOT (Graphviz), and Markdown output

This solution demonstrates the power of GitHub Copilot Agent Mode to create sophisticated applications that integrate external tools through MCP while maintaining clean, maintainable code structure.
# Firecrawl MCP Error Resolution Guide

## Understanding the $dynamicRef Error

When using Firecrawl MCP, you may encounter an error related to `$dynamicRef` in JSON schema validation. This error occurs because:

1. **Schema Limitation**: The Firecrawl MCP tool uses advanced JSON schema features (`$dynamicRef`) that aren't fully supported in all environments
2. **Environment Compatibility**: Your current development environment may not support the latest JSON Schema draft specifications
3. **Tool Version Mismatch**: The MCP implementation may be using a newer schema format than what's available

## Error Symptoms

```
Error: JSON schema validation failed
- $dynamicRef feature not supported
- Schema parsing error in firecrawl_scrape tool
- MCP tool initialization failure
```

## Resolution Strategies

### Strategy 1: Environment Update
1. Ensure you have the latest VS Code version with MCP support
2. Update GitHub Copilot extension to the latest version
3. Restart VS Code and re-initialize MCP connections

### Strategy 2: Alternative MCP Configuration
Use a simpler MCP configuration that avoids the problematic schema features:

```json
{
  "servers": {
    "firecrawl-simple": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp@latest"],
      "env": {
        "FIRECRAWL_API_KEY": "${input:fireCrawlApiKey}",
        "FIRECRAWL_SCHEMA_MODE": "basic"
      }
    }
  }
}
```

### Strategy 3: Fallback Implementation
If MCP tools fail, use direct implementation alternatives (see firecrawl-fallback.js)

### Strategy 4: Diagnostic Tools
Use the MCP diagnostic tools (see mcp-diagnostics.js) to identify specific issues

## Quick Fix Commands

```bash
# Update MCP packages
npx -y firecrawl-mcp@latest --version

# Test MCP connection
node mcp-diagnostics.js

# Run with fallback
node The-Knowledge-Cartographer-Agent-MCP.js --use-fallback
```

## When to Use Each Strategy

- **Strategy 1**: First attempt - fixes most environment issues
- **Strategy 2**: When you have API access but schema issues persist
- **Strategy 3**: When MCP tools are completely unavailable
- **Strategy 4**: For debugging and identifying root causes
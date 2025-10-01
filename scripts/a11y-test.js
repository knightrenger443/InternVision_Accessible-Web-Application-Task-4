/**
 * Accessibility Testing Script using Axe-core
 * 
 * This script runs automated accessibility tests against the application
 * using the axe-core library and generates a comprehensive report.
 */

const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  url: 'http://localhost:4173', // Vite preview server
  outputDir: path.join(__dirname, '../reports'),
  timeout: 30000,
  axeOptions: {
    // WCAG 2.1 Level AA compliance
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    // Include all rule types
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
    }
  }
};

/**
 * Generate HTML report from axe results
 */
function generateHTMLReport(results, timestamp) {
  const { violations, passes, incomplete, inapplicable } = results;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    .header {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #fff;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card.violations { border-left: 4px solid #dc3545; }
    .summary-card.passes { border-left: 4px solid #28a745; }
    .summary-card.incomplete { border-left: 4px solid #ffc107; }
    .summary-card.inapplicable { border-left: 4px solid #6c757d; }
    .summary-card h3 { margin: 0 0 10px 0; color: #495057; }
    .summary-card .count { font-size: 2em; font-weight: bold; }
    .violations .count { color: #dc3545; }
    .passes .count { color: #28a745; }
    .incomplete .count { color: #f0ad4e; }
    .inapplicable .count { color: #6c757d; }
    .section {
      margin-bottom: 40px;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      overflow: hidden;
    }
    .section-header {
      background: #f8f9fa;
      padding: 15px 20px;
      border-bottom: 1px solid #dee2e6;
      font-size: 1.2em;
      font-weight: bold;
    }
    .section-header.violations { background: #f8d7da; color: #721c24; }
    .section-header.passes { background: #d4edda; color: #155724; }
    .section-header.incomplete { background: #fff3cd; color: #856404; }
    .violation-item {
      padding: 20px;
      border-bottom: 1px solid #dee2e6;
    }
    .violation-item:last-child { border-bottom: none; }
    .violation-id {
      font-weight: bold;
      color: #dc3545;
      margin-bottom: 8px;
    }
    .violation-description {
      margin-bottom: 12px;
      color: #495057;
    }
    .violation-impact {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9em;
      font-weight: bold;
      text-transform: uppercase;
    }
    .impact-critical { background: #dc3545; color: white; }
    .impact-serious { background: #fd7e14; color: white; }
    .impact-moderate { background: #ffc107; color: #212529; }
    .impact-minor { background: #20c997; color: white; }
    .nodes {
      margin-top: 15px;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
    }
    .node {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      margin-bottom: 8px;
      padding: 8px;
      background: white;
      border-left: 3px solid #dc3545;
    }
    .help-url {
      color: #007bff;
      text-decoration: none;
    }
    .help-url:hover { text-decoration: underline; }
    .timestamp {
      color: #6c757d;
      font-size: 0.9em;
    }
    .no-items {
      padding: 40px;
      text-align: center;
      color: #6c757d;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Accessibility Test Report</h1>
    <p class="timestamp">Generated: ${timestamp}</p>
    <p><strong>Test URL:</strong> ${CONFIG.url}</p>
    <p><strong>Standards:</strong> WCAG 2.1 Level AA</p>
  </div>

  <div class="summary">
    <div class="summary-card violations">
      <h3>Violations</h3>
      <div class="count">${violations.length}</div>
      <p>Issues found</p>
    </div>
    <div class="summary-card passes">
      <h3>Passes</h3>
      <div class="count">${passes.length}</div>
      <p>Tests passed</p>
    </div>
    <div class="summary-card incomplete">
      <h3>Incomplete</h3>
      <div class="count">${incomplete.length}</div>
      <p>Needs review</p>
    </div>
    <div class="summary-card inapplicable">
      <h3>Not Applicable</h3>
      <div class="count">${inapplicable.length}</div>
      <p>Rules not relevant</p>
    </div>
  </div>

  <div class="section">
    <div class="section-header violations">🚨 Violations (${violations.length})</div>
    ${violations.length === 0 
      ? '<div class="no-items">🎉 No accessibility violations found!</div>'
      : violations.map(violation => `
        <div class="violation-item">
          <div class="violation-id">${violation.id}</div>
          <div class="violation-description">${violation.description}</div>
          <span class="violation-impact impact-${violation.impact}">${violation.impact}</span>
          <div class="nodes">
            <strong>Affected elements (${violation.nodes.length}):</strong>
            ${violation.nodes.map(node => `
              <div class="node">
                <strong>Target:</strong> ${node.target.join(', ')}<br>
                <strong>HTML:</strong> ${node.html}<br>
                ${node.failureSummary ? `<strong>Issue:</strong> ${node.failureSummary}` : ''}
              </div>
            `).join('')}
          </div>
          <p><a href="${violation.helpUrl}" class="help-url" target="_blank" rel="noopener">Learn more about this rule</a></p>
        </div>
      `).join('')
    }
  </div>

  <div class="section">
    <div class="section-header incomplete">⚠️ Incomplete Tests (${incomplete.length})</div>
    ${incomplete.length === 0 
      ? '<div class="no-items">No incomplete tests</div>'
      : incomplete.map(item => `
        <div class="violation-item">
          <div class="violation-id">${item.id}</div>
          <div class="violation-description">${item.description}</div>
          <p><strong>Manual review required</strong></p>
          <p><a href="${item.helpUrl}" class="help-url" target="_blank" rel="noopener">Learn more</a></p>
        </div>
      `).join('')
    }
  </div>

  <div class="section">
    <div class="section-header passes">✅ Passed Tests (${passes.length})</div>
    ${passes.length === 0 
      ? '<div class="no-items">No tests passed</div>'
      : '<div class="no-items">All passed tests are listed in the JSON report</div>'
    }
  </div>

</body>
</html>
  `;
  
  return html;
}

/**
 * Run accessibility tests
 */
async function runA11yTests() {
  console.log('🚀 Starting accessibility tests...');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent testing
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log(`📄 Navigating to ${CONFIG.url}`);
    
    // Navigate to the application
    await page.goto(CONFIG.url, { 
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeout 
    });
    
    console.log('🔍 Running axe-core analysis...');
    
    // Run axe tests
    const results = await new AxePuppeteer(page)
      .configure(CONFIG.axeOptions)
      .analyze();
    
    const timestamp = new Date().toISOString();
    
    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
    
    // Write JSON report
    const jsonPath = path.join(CONFIG.outputDir, `a11y-report-${timestamp.replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    
    // Write HTML report
    const htmlPath = path.join(CONFIG.outputDir, `a11y-report-${timestamp.replace(/[:.]/g, '-')}.html`);
    const htmlReport = generateHTMLReport(results, timestamp);
    fs.writeFileSync(htmlPath, htmlReport);
    
    // Write latest reports (for easy access)
    fs.writeFileSync(path.join(CONFIG.outputDir, 'latest-a11y-report.json'), JSON.stringify(results, null, 2));
    fs.writeFileSync(path.join(CONFIG.outputDir, 'latest-a11y-report.html'), htmlReport);
    
    // Log results
    console.log('\\n📊 Test Results:');
    console.log(`✅ Passed: ${results.passes.length}`);
    console.log(`❌ Violations: ${results.violations.length}`);
    console.log(`⚠️  Incomplete: ${results.incomplete.length}`);
    console.log(`⚪ Not Applicable: ${results.inapplicable.length}`);
    
    if (results.violations.length > 0) {
      console.log('\\n🚨 Violations found:');
      results.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id} (${violation.impact})`);
        console.log(`   ${violation.description}`);
        console.log(`   Affected elements: ${violation.nodes.length}`);
      });
    }
    
    console.log(`\\n📄 Reports generated:`);
    console.log(`   HTML: ${htmlPath}`);
    console.log(`   JSON: ${jsonPath}`);
    
    // Exit with error if violations found
    if (results.violations.length > 0) {
      console.log('\\n❌ Accessibility violations detected!');
      process.exit(1);
    } else {
      console.log('\\n🎉 No accessibility violations found!');
    }
    
  } catch (error) {
    console.error('❌ Error running accessibility tests:', error.message);
    
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.log('\\n💡 Make sure your development server is running:');
      console.log('   npm run dev  # for development');
      console.log('   npm run preview  # for production build');
    }
    
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the tests
if (require.main === module) {
  runA11yTests();
}

module.exports = { runA11yTests };
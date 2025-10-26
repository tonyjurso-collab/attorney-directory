// Environment Variable Check Script
// Run with: node scripts/check-env.js

console.log('Environment Variable Check:');
console.log('=========================');
console.log('NEXT_PUBLIC_ALGOLIA_APP_ID:', process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'NOT SET');
console.log('NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY:', process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY ? 'SET (length: ' + process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY.length + ')' : 'NOT SET');
console.log('ALGOLIA_ADMIN_API_KEY:', process.env.ALGOLIA_ADMIN_API_KEY ? 'SET (length: ' + process.env.ALGOLIA_ADMIN_API_KEY.length + ')' : 'NOT SET');
console.log('');
console.log('Expected .env.local format:');
console.log('NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id');
console.log('NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_search_key');
console.log('ALGOLIA_ADMIN_API_KEY=your_admin_key');
console.log('');
console.log('Common issues:');
console.log('- Extra spaces around = sign');
console.log('- Quotes around values');
console.log('- Wrong line endings (CRLF vs LF)');
console.log('- File not in project root');
console.log('- File permissions');
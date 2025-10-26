# Attorney Directory - Testing Guide

## Overview

This guide covers testing strategies, test cases, and quality assurance processes for the Attorney Directory application.

## Testing Strategy

### Test Types

1. **Unit Tests** - Individual component testing
2. **Integration Tests** - API endpoint testing
3. **End-to-End Tests** - Complete user journey testing
4. **Performance Tests** - Load and stress testing
5. **Security Tests** - Vulnerability and penetration testing

### Testing Environment

- **Development**: `http://localhost:3000`
- **Staging**: `https://staging.attorney-directory.com`
- **Production**: `https://attorney-directory.com`

## Test Pages and Utilities

### Built-in Test Pages

#### 1. Chatbot Testing
- **URL**: `/test-chatbot`
- **Purpose**: Test AI chatbot functionality
- **Test Cases**:
  - Basic conversation flow
  - Field extraction
  - Lead capture
  - Error handling

#### 2. Comprehensive Chatbot Suite
- **URL**: `/test-chatbot-suite`
- **Purpose**: Full chatbot testing suite
- **Test Cases**:
  - Multiple practice areas
  - Field validation
  - Session management
  - Lead submission

#### 3. Dynamic Form Testing
- **URL**: `/test-dynamic-form`
- **Purpose**: Test form components
- **Test Cases**:
  - Form validation
  - Field dependencies
  - Submission flow
  - Error states

#### 4. Search Testing
- **URL**: `/test-search`
- **Purpose**: Test search functionality
- **Test Cases**:
  - Attorney search
  - Filtering
  - Pagination
  - Results display

### Test Scripts

#### 1. Category Fields Test
```bash
node test-category-fields.js
```
- Tests practice area field requirements
- Validates JSON configuration
- Checks field dependencies

#### 2. Required Fields Test
```bash
node test-required-fields.js
```
- Tests field validation logic
- Checks required field enforcement
- Validates error handling

#### 3. Reset Functionality Test
```bash
node test-reset.js
```
- Tests session reset functionality
- Validates cleanup processes
- Checks state management

#### 4. Chatbot PowerShell Test
```powershell
.\test-chatbot.ps1
```
- Windows-specific chatbot testing
- Automated test execution
- Results reporting

## API Testing

### Chat API Tests

#### Test Chat Endpoint
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I need help with a divorce"}'
```

**Expected Response**:
```json
{
  "response": "I understand you need help with divorce proceedings...",
  "sessionData": {
    "collectedFields": {},
    "conversationHistory": [...],
    "category": "family_law",
    "subcategory": "divorce"
  }
}
```

#### Test Chat Reset
```bash
curl -X POST http://localhost:3000/api/chat/reset \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-session"}'
```

#### Test Lead Submission
```bash
curl -X POST http://localhost:3000/api/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "phone": "(555) 123-4567",
    "zip_code": "12345",
    "describe": "Test legal issue",
    "main_category": "personal_injury_law",
    "sub_category": "car_accident",
    "has_attorney": "no"
  }'
```

### Search API Tests

#### Test Attorney Search
```bash
curl -X POST http://localhost:3000/api/search-attorneys \
  -H "Content-Type: application/json" \
  -d '{
    "practice_area": "Personal Injury",
    "state": "NC",
    "category": "personal-injury"
  }'
```

#### Test Geocoding
```bash
curl "http://localhost:3000/api/geocode-zip?zip_code=28201"
```

## User Journey Testing

### 1. Landing Page Journey

**Test Case**: User finds attorney through landing page

**Steps**:
1. Navigate to `/d/nc/personal-injury`
2. Verify page loads correctly
3. Check hero section displays
4. Verify chatbot appears in top-right
5. Test search form functionality
6. Browse attorney listings
7. Click on attorney profile
8. Test contact form

**Expected Results**:
- Page loads in < 3 seconds
- All sections display correctly
- Chatbot is functional
- Search returns relevant results
- Contact forms work properly

### 2. Chatbot Journey

**Test Case**: User gets help through chatbot

**Steps**:
1. Click chatbot widget
2. Send message: "I was in a car accident"
3. Verify AI response and field detection
4. Provide required information
5. Complete lead capture
6. Verify lead submission

**Expected Results**:
- Chatbot responds within 2 seconds
- Fields are extracted correctly
- Lead is captured successfully
- User receives confirmation

### 3. Search Journey

**Test Case**: User searches for attorney

**Steps**:
1. Navigate to search page
2. Enter search criteria
3. Apply filters
4. Review results
5. Click on attorney profile
6. Contact attorney

**Expected Results**:
- Search returns relevant results
- Filters work correctly
- Profiles display properly
- Contact options are available

## Performance Testing

### Load Testing

#### Test Scenarios

1. **Concurrent Users**: 100 users simultaneously
2. **Page Load Times**: < 3 seconds for all pages
3. **API Response Times**: < 500ms for all endpoints
4. **Database Queries**: < 100ms average

#### Tools

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Landing Page Load"
    weight: 50
    flow:
      - get:
          url: "/d/nc/personal-injury"
  - name: "Search API"
    weight: 30
    flow:
      - post:
          url: "/api/search-attorneys"
          json:
            practice_area: "Personal Injury"
            state: "NC"
  - name: "Chat API"
    weight: 20
    flow:
      - post:
          url: "/api/chat"
          json:
            message: "I need legal help"
EOF

# Run load test
artillery run load-test.yml
```

### Stress Testing

```bash
# Test with increasing load
artillery run --target http://localhost:3000 stress-test.yml
```

## Security Testing

### Input Validation Tests

#### SQL Injection Tests
```bash
# Test search endpoint with malicious input
curl -X POST http://localhost:3000/api/search-attorneys \
  -H "Content-Type: application/json" \
  -d '{"practice_area": "Personal Injury\"; DROP TABLE attorneys; --"}'
```

#### XSS Tests
```bash
# Test chat endpoint with script injection
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "<script>alert(\"XSS\")</script>"}'
```

### Authentication Tests

#### Session Management
```bash
# Test session persistence
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: session=test-session" \
  -d '{"message": "Test message"}'
```

## Mobile Testing

### Responsive Design Tests

#### Test Devices
- iPhone 12/13/14 (375px width)
- Samsung Galaxy S21 (360px width)
- iPad (768px width)
- Desktop (1920px width)

#### Test Cases
1. **Navigation**: Menu functionality on mobile
2. **Forms**: Input fields and validation
3. **Chatbot**: Mobile chat interface
4. **Search**: Mobile search experience
5. **Profiles**: Attorney profile display

### Mobile Performance

```bash
# Test mobile performance with Lighthouse
npx lighthouse http://localhost:3000/d/nc/personal-injury \
  --only-categories=performance \
  --form-factor=mobile \
  --output=json \
  --output-path=mobile-performance.json
```

## Accessibility Testing

### WCAG 2.1 Compliance

#### Test Tools
- **axe-core**: Automated accessibility testing
- **WAVE**: Web accessibility evaluation
- **Lighthouse**: Accessibility auditing

#### Test Cases
1. **Keyboard Navigation**: All functionality accessible via keyboard
2. **Screen Reader**: Content readable by screen readers
3. **Color Contrast**: Sufficient contrast ratios
4. **Alt Text**: Images have descriptive alt text
5. **Focus Indicators**: Clear focus indicators

### Automated Accessibility Testing

```bash
# Install axe-core
npm install --save-dev @axe-core/cli

# Run accessibility tests
npx axe http://localhost:3000/d/nc/personal-injury
```

## Error Handling Tests

### API Error Tests

#### Test Invalid Requests
```bash
# Test with missing required fields
curl -X POST http://localhost:3000/api/lead-capture \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Test"}'

# Expected: 400 Bad Request with validation errors
```

#### Test Server Errors
```bash
# Test with invalid database connection
# (Simulate by stopping database)
curl -X POST http://localhost:3000/api/search-attorneys \
  -H "Content-Type: application/json" \
  -d '{"practice_area": "Personal Injury", "state": "NC"}'

# Expected: 500 Internal Server Error
```

### Frontend Error Tests

#### Test Network Failures
1. Disconnect network
2. Attempt to submit form
3. Verify error handling
4. Check user feedback

#### Test Invalid Data
1. Enter invalid email format
2. Submit form
3. Verify validation messages
4. Check form state

## Test Data Management

### Test Data Sets

#### Attorney Test Data
```json
{
  "attorneys": [
    {
      "id": "test-attorney-1",
      "full_name": "Test Attorney One",
      "email": "test1@example.com",
      "phone": "(555) 111-1111",
      "practice_areas": ["Personal Injury"],
      "location": {
        "city": "Charlotte",
        "state": "NC",
        "zip_code": "28201"
      }
    }
  ]
}
```

#### Lead Test Data
```json
{
  "leads": [
    {
      "first_name": "Test",
      "last_name": "Client",
      "email": "test@example.com",
      "phone": "(555) 123-4567",
      "zip_code": "12345",
      "describe": "Test legal issue",
      "main_category": "personal_injury_law",
      "sub_category": "car_accident",
      "has_attorney": "no"
    }
  ]
}
```

### Test Environment Setup

```bash
# Create test database
createdb attorney_directory_test

# Run test migrations
psql attorney_directory_test < lib/database/create-google-reviews-table.sql

# Seed test data
npm run seed:test
```

## Continuous Integration Testing

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run unit tests
      run: npm run test:unit
      
    - name: Run integration tests
      run: npm run test:integration
      
    - name: Run E2E tests
      run: npm run test:e2e
      
    - name: Run accessibility tests
      run: npm run test:a11y
```

## Test Reporting

### Test Results Dashboard

Create a test results dashboard showing:
- Test execution status
- Performance metrics
- Error rates
- Coverage reports

### Automated Reporting

```bash
# Generate test report
npm run test:report

# Send results to team
npm run test:notify
```

## Best Practices

### Test Development

1. **Write Tests First**: Follow TDD principles
2. **Test Edge Cases**: Include boundary conditions
3. **Mock External Services**: Use test doubles
4. **Clean Test Data**: Reset state between tests
5. **Document Test Cases**: Clear test descriptions

### Test Maintenance

1. **Regular Updates**: Keep tests current with code changes
2. **Performance Monitoring**: Track test execution times
3. **Coverage Analysis**: Maintain high test coverage
4. **Test Review**: Regular review of test quality
5. **Automation**: Automate repetitive test tasks

## Troubleshooting

### Common Test Issues

1. **Flaky Tests**: Investigate timing and state issues
2. **Slow Tests**: Optimize test execution
3. **Environment Issues**: Ensure consistent test environment
4. **Data Conflicts**: Use isolated test data
5. **Network Issues**: Mock external API calls

### Debug Commands

```bash
# Run tests with verbose output
npm run test -- --verbose

# Run specific test file
npm run test -- test-chatbot.js

# Run tests with coverage
npm run test -- --coverage

# Debug failing tests
npm run test -- --debug
```

## Support

For testing questions or issues:
1. Check this guide first
2. Review test logs and error messages
3. Use debugging tools and commands
4. Contact development team with specific test failures
5. Include test environment details and reproduction steps

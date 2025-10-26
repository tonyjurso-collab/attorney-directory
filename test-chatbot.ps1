# Chatbot Test Script
# Run this script to test the chatbot across different categories

Write-Host "Starting Chatbot Test Suite..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$testResults = @()

# Test cases
$testCases = @(
    @{
        id = "pi-car-accident"
        category = "personal_injury_law"
        message = "I was in a car accident yesterday and got injured"
        description = "Car accident with injury - should auto-detect subcategory and injury status"
    },
    @{
        id = "pi-zip-code"
        category = "personal_injury_law"
        message = "I was hurt in a motorcycle accident. My zip code is 28202"
        description = "Motorcycle accident with zip - should auto-populate city/state"
    },
    @{
        id = "family-divorce"
        category = "family_law"
        message = "I need help with a divorce"
        description = "Divorce case - should auto-detect subcategory, no PI fields"
    },
    @{
        id = "criminal-dui"
        category = "criminal_law"
        message = "I got a DUI last night"
        description = "DUI case - should auto-detect subcategory and date"
    },
    @{
        id = "location-zip-only"
        category = "personal_injury_law"
        message = "I was in an accident. Zip code 10001"
        description = "Zip code only - should auto-populate city/state"
    }
)

function Test-ChatbotMessage {
    param(
        [string]$message,
        [string]$testId
    )
    
    try {
        Write-Host "Testing: $testId" -ForegroundColor Yellow
        
        # Reset chat session
        $resetResponse = Invoke-RestMethod -Uri "$baseUrl/api/chat/reset" -Method POST -ContentType "application/json"
        
        # Send test message
        $body = @{ message = $message } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/api/chat" -Method POST -ContentType "application/json" -Body $body
        
        return @{
            testId = $testId
            message = $message
            success = $true
            response = $response
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
    }
    catch {
        return @{
            testId = $testId
            message = $message
            success = $false
            error = $_.Exception.Message
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
    }
}

# Run tests
foreach ($testCase in $testCases) {
    $result = Test-ChatbotMessage -message $testCase.message -testId $testCase.id
    $testResults += $result
    
    Write-Host "  Result: $(if ($result.success) { 'SUCCESS' } else { 'FAILED' })" -ForegroundColor $(if ($result.success) { 'Green' } else { 'Red' })
    
    if ($result.success) {
        Write-Host "  Response: $($result.response.answer)" -ForegroundColor Gray
        if ($result.response.debug) {
            Write-Host "  Category: $($result.response.debug.category)" -ForegroundColor Gray
            Write-Host "  Subcategory: $($result.response.debug.subcategory)" -ForegroundColor Gray
            Write-Host "  Collected Fields: $($result.response.debug.collected.Keys -join ', ')" -ForegroundColor Gray
        }
    } else {
        Write-Host "  Error: $($result.error)" -ForegroundColor Red
    }
    
    Write-Host ""
    Start-Sleep -Seconds 1
}

# Summary
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
$totalTests = $testResults.Count
$successfulTests = ($testResults | Where-Object { $_.success }).Count
$failedTests = $totalTests - $successfulTests

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Successful: $successfulTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red

if ($failedTests -gt 0) {
    Write-Host ""
    Write-Host "Failed Tests:" -ForegroundColor Red
    foreach ($result in $testResults | Where-Object { -not $_.success }) {
        Write-Host "  - $($result.testId): $($result.error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan

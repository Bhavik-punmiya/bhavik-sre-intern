# Extreme Load CloudWatch Simulation
$INGESTER_URL = "http://localhost:8001/api/v1/signals"
$API_KEY = "key1"

# Load the realistic samples
$samplesJson = Get-Content "c:\Users\Bhavi\OneDrive\Desktop\ZeoTap\backend\data\log-samples.json" | ConvertFrom-Json

$services = @(
    @{ name = "mock-data-service"; type = "API"; count = 500 },
    @{ name = "mcp-processor"; type = "MCP"; count = 500 },
    @{ name = "RDBMS"; type = "RDBMS"; count = 500 },
    @{ name = "CACHE"; type = "CACHE"; count = 500 }
)

Write-Host "🌊 Starting Extreme Load Simulation (Target: 2000 Signals)..." 

foreach ($svc in $services) {
    $svcName = $svc.name
    $svcType = $svc.type
    $svcCount = $svc.count
    $typeSamples = $samplesJson.$svcType
    
    # Split samples into Errors (P0, P1) and Normal (P2, P3)
    $errorSamples = $typeSamples | Where-Object { $_.severity -match "P0|P1" }
    $normalSamples = $typeSamples | Where-Object { $_.severity -match "P2|P3" }
    
    Write-Host "Sending signals for $svcName..." 
    
    for ($i = 1; $i -le $svcCount; $i++) {
        # 20% Error Rate Logic
        $isError = ($i % 5 -eq 0) 
        $sample = if ($isError) { $errorSamples | Get-Random } else { $normalSamples | Get-Random }
        
        $meta = @{ 
            iteration = $i
            request_id = [guid]::NewGuid().ToString()
            environment = "production"
        }
        if ($isError) { $meta.stack_trace = "Critical failure in controller.js:line 45" }

        $body = @{
            component_id = $svcName
            component_type = $svcType
            message = $sample.msg
            severity = $sample.severity
            error_code = "ERR_$($svcType)_$($i)"
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            metadata = $meta
        } | ConvertTo-Json

        # Send it!
        $null = Invoke-RestMethod -Method Post -Uri $INGESTER_URL -Headers @{"X-API-Key"=$API_KEY; "Content-Type"="application/json"} -Body $body
        
        if ($i % 100 -eq 0) { Write-Host "   Progress: $i / $svcCount" }
    }
}

Write-Host "Extreme Load Complete! View at http://localhost:3000"

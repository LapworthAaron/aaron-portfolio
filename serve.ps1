$port = if ($env:PORT) { [int]$env:PORT } else { 8080 }
$root = $PSScriptRoot

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.ico'  = 'image/x-icon'
    '.json' = 'application/json'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
$listener.Start()
Write-Host "Server running at http://localhost:$port"

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)

        # Read request line
        $requestLine = $reader.ReadLine()
        if (-not $requestLine) { $client.Close(); continue }

        # Read and discard headers
        while ($true) {
            $line = $reader.ReadLine()
            if ([string]::IsNullOrEmpty($line)) { break }
        }

        # Parse path
        $parts = $requestLine -split ' '
        $path = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
        $path = [System.Uri]::UnescapeDataString($path)
        if ($path -eq '/') { $path = '/index.html' }

        # Resolve file
        $filePath = Join-Path $root ($path -replace '/', '\')

        if ((Test-Path $filePath -PathType Leaf) -and $filePath.StartsWith($root)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }
            $body = [System.IO.File]::ReadAllBytes($filePath)
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        } else {
            $bodyText = 'Not Found'
            $body = [System.Text.Encoding]::UTF8.GetBytes($bodyText)
            $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        }

        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($body, 0, $body.Length)
        $stream.Flush()
        $client.Close()
    }
} finally {
    $listener.Stop()
}

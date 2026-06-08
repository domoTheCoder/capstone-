$prefix='http://localhost:8000/'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Output "Serving $PWD at $prefix"
while ($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $path = $request.Url.LocalPath.TrimStart('/')
  if ($path -eq '') { $path='index.html' }
  $file = Join-Path $PWD $path
  try {
    if (Test-Path $file) {
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $mimeMap = @{ '.html'='text/html'; '.htm'='text/html'; '.js'='application/javascript'; '.css'='text/css'; '.json'='application/json'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.gif'='image/gif'; '.svg'='image/svg+xml' }
      $mime = $mimeMap[$ext]
      if (-not $mime) { $mime='application/octet-stream' }
      $context.Response.ContentType = $mime
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes,0,$bytes.Length)
    } else {
      $context.Response.StatusCode = 404
      $msg = 'Not Found'
      $b = [System.Text.Encoding]::UTF8.GetBytes($msg)
      $context.Response.ContentLength64 = $b.Length
      $context.Response.OutputStream.Write($b,0,$b.Length)
    }
  } catch {
    $context.Response.StatusCode = 500
  } finally {
    $context.Response.Close()
  }
}

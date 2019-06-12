@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe" --inspect-brk "%~dp0\node_modules\rub-cli\bin\rub" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node --inspect-brk "%~dp0\node_modules\rub-cli\bin\rub" %*
)
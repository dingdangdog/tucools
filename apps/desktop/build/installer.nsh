; productName is Chinese. electron-builder then refuses it as the Windows
; install directory and falls back to the sanitized package name
; @tucools/desktop, which becomes @tucoolsdesktop. Keep the executable
; name as the product name and force an ASCII install directory.
!define /redef APP_FILENAME "tucools"
!if "${APP_FILENAME}" != "tucools"
  !error "APP_FILENAME must be tucools"
!endif

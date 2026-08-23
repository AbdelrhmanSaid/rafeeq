import 'bootstrap'
import '@/shared/styles/base.scss'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { router } from '@/app/router'
import { initOneSignal } from '@/app/pwa/oneSignal'
import { registerServiceWorker } from '@/app/pwa/registerServiceWorker'

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

initOneSignal()
registerServiceWorker()

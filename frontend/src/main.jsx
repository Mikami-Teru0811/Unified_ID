import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './auth/AuthProvider'
import { SessionProvider } from './context/SessionContext'
import { EmergencyProvider } from './context/EmergencyContext'
import { ThemeProvider } from './context/ThemeContext'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <EmergencyProvider>
        <SessionProvider>
          <AuthProvider>
            <ThemeProvider>
              <App />
              <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#0F172A',
                        color: '#fff',
                        border: '1px solid #334155'
                    },
                    success: {
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff'
                        }
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff'
                        }
                    }
                }}
              />
            </ThemeProvider>
          </AuthProvider>
        </SessionProvider>
      </EmergencyProvider>
    </BrowserRouter>
  </React.StrictMode>
)

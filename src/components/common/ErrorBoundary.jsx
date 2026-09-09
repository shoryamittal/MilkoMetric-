import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('AgriNex UI caught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
          <div className="rounded-full bg-signal-amberSoft p-3 text-signal-amber mb-3">
            <AlertTriangle size={32} />
          </div>
          <h2 className="font-display text-xl font-bold text-ink">Dashboard Notice</h2>
          <p className="mt-1 max-w-md text-sm text-ink-soft">
            A temporary component error occurred while rendering the live telemetry interface.
          </p>
          {this.state.error?.message && (
            <code className="mt-3 rounded bg-canvas-sunken px-3 py-1.5 text-xs text-signal-red font-mono border border-line">
              {this.state.error.message}
            </code>
          )}
          <button
            onClick={this.handleReset}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-pasture-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-pasture-600 transition-colors"
          >
            <RefreshCw size={14} /> Reload Interface
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

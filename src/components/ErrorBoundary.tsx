import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#e74c3c', background: '#f5f0e8', minHeight: '100dvh' }}>
          <h2>渲染出错</h2>
          <pre style={{ marginTop: 12, fontSize: 13, whiteSpace: 'pre-wrap', color: '#333' }}>
            {this.state.error.message}
          </pre>
          <button
            style={{ marginTop: 16, padding: '8px 20px', background: '#8f7a66', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16 }}
            onClick={() => window.location.reload()}
          >
            重新加载
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

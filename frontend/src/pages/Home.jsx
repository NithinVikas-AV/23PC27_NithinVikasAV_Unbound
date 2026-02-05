import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Workflows</h2>
      <p style={{ marginBottom: '24px' }}>Create your agentic workflows here.</p>
      
      <Link
        to="/editor"
        style={{
          background: '#2563eb',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          display: 'inline-block'
        }}
      >
        + Create New Workflow
      </Link>
    </div>
  )
}
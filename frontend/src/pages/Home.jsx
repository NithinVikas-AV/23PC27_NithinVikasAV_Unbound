// src/pages/Home.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllWorkflows, runWorkflow, getExecutionLogs, getAllExecutions } from '../api/api';

export default function Home() {
  const [workflows, setWorkflows] = useState([]);
  const [runIds, setRunIds] = useState([]); // list of past run_ids
  const [logsByRun, setLogsByRun] = useState({}); // { runId: logs[] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch workflows and past run IDs on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get all workflows
        const wfData = await getAllWorkflows();
        setWorkflows(wfData);

        // 2. Get past execution run IDs
        const execData = await getAllExecutions();
        setRunIds(execData);

        // Optional: auto-load logs for the most recent run (if any)
        if (execData.length > 0) {
          const latest = execData[0];
          const logData = await getExecutionLogs(latest);
          setLogsByRun((prev) => ({
            ...prev,
            [latest]: logData.history || [],
          }));
        }
      } catch (err) {
        setError('Failed to load data. Check if backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Run a workflow
  const handleRun = async (workflowId) => {
    try {
      const result = await runWorkflow(workflowId);
      alert(`Run started!\nStatus: ${result.status}\nRun ID: ${result.run_id || 'N/A'}`);
    } catch (err) {
      alert('Failed to start run');
      console.error(err);
    }
  };

  // View logs for a past run
  const handleViewLogs = async (runId) => {
    if (logsByRun[runId]) return; // already loaded

    try {
      const logData = await getExecutionLogs(runId);
      setLogsByRun((prev) => ({
        ...prev,
        [runId]: logData.history || [],
      }));
    } catch (err) {
      console.error('Failed to load logs:', err);
      alert('Failed to load logs');
    }
  };

  // Download workflow as JSON
  const handleDownload = (workflow) => {
    const jsonString = JSON.stringify(workflow, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.name || 'workflow'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      padding: '40px 20px',
      color: '#e2e8f0',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '48px',
          color: '#60a5fa',
        }}>
          Workflow Builder
        </h1>

        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '18px' }}>Loading workflows and history...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#f87171', fontSize: '18px' }}>{error}</p>
        ) : (
          <div>
            {/* Saved Workflows */}
            <section style={{ marginBottom: '64px' }}>
              <h2 style={{
                fontSize: '28px',
                marginBottom: '24px',
                textAlign: 'center',
                color: '#93c5fd',
              }}>
                Saved Workflows
              </h2>

              {workflows.length === 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ marginBottom: '24px', color: '#94a3b8' }}>
                    No workflows yet. Create your first one!
                  </p>
                  <Link
                    to="/editor"
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      padding: '14px 32px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '18px',
                      display: 'inline-block',
                    }}
                  >
                    + Create New Workflow
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '24px' }}>
                  {workflows.map((wf) => (
                    <div
                      key={wf.id}
                      style={{
                        background: '#1e293b',
                        padding: '24px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: '#93c5fd' }}>{wf.name}</h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={() => handleRun(wf.id)}
                            style={{
                              background: '#059669',
                              color: 'white',
                              padding: '10px 20px',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            Run Now
                          </button>
                          <button
                            onClick={() => handleDownload(wf)}
                            style={{
                              background: '#7c3aed',
                              color: 'white',
                              padding: '10px 20px',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            Download JSON
                          </button>
                        </div>
                      </div>

                      <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
                        {wf.steps.length} step{wf.steps.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past Executions / History */}
            <section>
              <h2 style={{
                fontSize: '28px',
                marginBottom: '24px',
                textAlign: 'center',
                color: '#93c5fd',
              }}>
                Execution History
              </h2>

              {runIds.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8' }}>
                  No past executions yet.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {runIds.map((runId) => (
                    <div
                      key={runId}
                      style={{
                        background: '#1e293b',
                        padding: '20px',
                        borderRadius: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <strong style={{ color: '#93c5fd' }}>Run ID: {runId}</strong>
                        <button
                          onClick={() => handleViewLogs(runId)}
                          style={{
                            background: '#2563eb',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          {logsByRun[runId] ? 'Logs Loaded' : 'View Logs'}
                        </button>
                      </div>

                      {logsByRun[runId] && (
                        <div style={{ marginTop: '16px' }}>
                          {logsByRun[runId].length === 0 ? (
                            <p style={{ color: '#94a3b8' }}>No logs available</p>
                          ) : (
                            logsByRun[runId].map((log, idx) => (
                              <div
                                key={idx}
                                style={{
                                  marginBottom: '12px',
                                  padding: '12px',
                                  background: '#111827',
                                  borderRadius: '8px',
                                  borderLeft: `4px solid ${log.passed_criteria ? '#34d399' : '#f87171'}`,
                                }}
                              >
                                <strong>
                                  Step {log.step_index + 1} — {log.passed_criteria ? 'Passed' : 'Failed'}
                                </strong>
                                <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>
                                  Retries: {log.retry_count}
                                </p>
                                <pre style={{
                                  marginTop: '8px',
                                  fontSize: '13px',
                                  whiteSpace: 'pre-wrap',
                                  overflowX: 'auto',
                                }}>
                                  {log.llm_output.substring(0, 300)}...
                                </pre>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Create New Button */}
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <Link
                to="/editor"
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '14px 40px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '18px',
                  display: 'inline-block',
                }}
              >
                + Create New Workflow
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
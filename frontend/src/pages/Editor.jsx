// src/pages/Editor.jsx

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { createWorkflow, runWorkflow, getExecutionLogs } from '../api/api';

export default function Editor() {
  const [workflowId, setWorkflowId] = useState(null);
  const [runId, setRunId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | creating | running | completed | failed
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: 'My New Workflow',
      steps: [
        {
          model: 'fireworks-ai/kimi-k2-instruct-0905',
          prompt: '',
          completion_criteria: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'steps',
  });

  const onSubmit = async (data) => {
    setError(null);
    setStatus('creating');
    setWorkflowId(null);
    setRunId(null);
    setLogs([]);

    try {
      const createResult = await createWorkflow(data);
      setWorkflowId(createResult.id);
      setStatus('running');

      const runResult = await runWorkflow(createResult.id);
      setRunId(runResult.run_id);

      if (runResult.run_id) {
        const logData = await getExecutionLogs(runResult.run_id);
        setLogs(logData.history || []);
      }

      setStatus(runResult.status === 'completed' ? 'completed' : 'failed');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Something went wrong');
      setStatus('failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        justifyContent: 'center',          // ← Centers everything horizontally
        alignItems: 'flex-start',
        padding: '40px 20px',
      }}
    >
      {/* Centered content wrapper */}
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',                // ← Adjust this number to make it wider/narrower
          margin: '0 auto',                  // ← Classic centering
        }}
      >
        {/* Page Title */}
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '48px',
            textAlign: 'center',
            color: '#60a5fa',
          }}
        >
          Workflow Builder
        </h1>

        {/* Form Card */}
        <div
          style={{
            background: '#1e293b',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            marginBottom: '48px',
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Workflow Name */}
            <div style={{ marginBottom: '40px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '12px',
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#e2e8f0',
                }}
              >
                Workflow Name
              </label>
              <input
                {...register('name', { required: 'Workflow name is required' })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  outline: 'none',
                }}
                placeholder="e.g. Code Generator & Tester"
              />
              {errors.name && (
                <p style={{ color: '#f87171', marginTop: '8px', fontSize: '14px' }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Steps */}
            <div>
              <h2
                style={{
                  fontSize: '26px',
                  marginBottom: '32px',
                  color: '#94a3b8',
                  textAlign: 'center',
                }}
              >
                Workflow Steps
              </h2>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  style={{
                    background: '#111827',
                    padding: '28px',
                    borderRadius: '12px',
                    marginBottom: '32px',
                    border: '1px solid #334155',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '24px',
                    }}
                  >
                    <h3 style={{ fontSize: '20px', margin: 0, color: '#cbd5e1' }}>
                      Step {index + 1}
                    </h3>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '8px 18px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        Remove Step
                      </button>
                    )}
                  </div>

                  {/* Model Dropdown */}
                  <div style={{ marginBottom: '24px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontWeight: '500',
                        color: '#cbd5e1',
                      }}
                    >
                      Model
                    </label>
                    <select
                      {...register(`steps.${index}.model`, { required: 'Model is required' })}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        fontSize: '16px',
                        background: '#0f172a',
                        color: '#f1f5f9',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        outline: 'none',
                      }}
                    >
                      <option value="">Select model</option>
                      <option value="fireworks-ai/kimi-k2-instruct-0905">
                        Kimi K2 Instruct 0905 (Recommended)
                      </option>
                      <option value="fireworks-ai/kimi-k2p5">
                        Kimi K2p5
                      </option>
                    </select>
                    {errors.steps?.[index]?.model && (
                      <p style={{ color: '#f87171', marginTop: '8px', fontSize: '14px' }}>
                        {errors.steps[index].model.message}
                      </p>
                    )}
                  </div>

                  {/* Prompt */}
                  <div style={{ marginBottom: '24px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontWeight: '500',
                        color: '#cbd5e1',
                      }}
                    >
                      Prompt
                    </label>
                    <textarea
                      {...register(`steps.${index}.prompt`)}
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        fontSize: '15px',
                        background: '#0f172a',
                        color: '#f1f5f9',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        resize: 'vertical',
                      }}
                      placeholder="Write your instruction here..."
                    />
                  </div>

                  {/* Completion Criteria */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontWeight: '500',
                        color: '#cbd5e1',
                      }}
                    >
                      Completion Criteria
                    </label>
                    <input
                      {...register(`steps.${index}.completion_criteria`)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        fontSize: '16px',
                        background: '#0f172a',
                        color: '#f1f5f9',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                      placeholder="contains:success  OR  regex:\b42\b  OR  json  OR  code"
                    />
                  </div>
                </div>
              ))}

              <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      model: 'fireworks-ai/kimi-k2-instruct-0905',
                      prompt: '',
                      completion_criteria: '',
                    })
                  }
                  style={{
                    background: '#059669',
                    color: 'white',
                    padding: '12px 32px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  + Add New Step
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <button
                type="submit"
                disabled={status === 'creating' || status === 'running'}
                style={{
                  background: status === 'running' ? '#4b5563' : '#3b82f6',
                  color: 'white',
                  padding: '16px 56px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: status === 'running' ? 'not-allowed' : 'pointer',
                }}
              >
                {status === 'creating'
                  ? 'Creating...'
                  : status === 'running'
                  ? 'Running...'
                  : 'Create & Run Workflow'}
              </button>
            </div>
          </form>
        </div>

        {/* Progress / Results Section */}
        {(status !== 'idle' || workflowId || runId || logs.length > 0 || error) && (
          <div
            style={{
              background: '#1e293b',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            <h2
              style={{
                fontSize: '28px',
                marginBottom: '32px',
                color: '#93c5fd',
                textAlign: 'center',
              }}
            >
              Execution Progress
            </h2>

            {error && (
              <div
                style={{
                  background: '#7f1d1d',
                  color: '#fecaca',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '32px',
                  textAlign: 'center',
                }}
              >
                Error: {error}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginBottom: '40px',
                fontSize: '16px',
                textAlign: 'center',
              }}
            >
              {workflowId && <div><strong>Workflow ID:</strong> {workflowId}</div>}
              {runId && <div><strong>Run ID:</strong> {runId}</div>}
              <div>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    fontWeight: 'bold',
                    color:
                      status === 'completed' ? '#34d399' :
                      status === 'failed' ? '#f87171' :
                      status === 'running' ? '#fbbf24' :
                      '#9ca3af',
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>

            {logs.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: '22px',
                    marginBottom: '24px',
                    color: '#cbd5e1',
                    textAlign: 'center',
                  }}
                >
                  Step Logs
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {logs.map((log, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '24px',
                        background: '#111827',
                        borderRadius: '12px',
                        borderLeft: `6px solid ${log.passed_criteria ? '#34d399' : '#f87171'}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <strong style={{ fontSize: '18px' }}>
                          Step {log.step_index + 1} — {log.passed_criteria ? 'Passed' : 'Failed'}
                        </strong>
                        <span style={{ color: '#94a3b8' }}>Retries: {log.retry_count}</span>
                      </div>
                      <pre
                        style={{
                          whiteSpace: 'pre-wrap',
                          background: '#0f172a',
                          padding: '20px',
                          borderRadius: '10px',
                          marginTop: '12px',
                          fontSize: '14px',
                          overflowX: 'auto',
                        }}
                      >
                        {log.llm_output}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
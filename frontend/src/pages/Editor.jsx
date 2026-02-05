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
      // Create workflow
      const createResult = await createWorkflow(data);
      setWorkflowId(createResult.id);
      setStatus('running');

      // Run workflow
      const runResult = await runWorkflow(createResult.id);
      setRunId(runResult.run_id);

      // Get logs
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
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 20px',
      background: '#0f172a',
      minHeight: '100vh',
      color: '#e2e8f0',
    }}>
      <h1 style={{
        fontSize: '36px',
        fontWeight: 'bold',
        marginBottom: '40px',
        textAlign: 'center',
        color: '#60a5fa',
      }}>
        Workflow Builder
      </h1>

      {/* Form */}
      <form 
        onSubmit={handleSubmit(onSubmit)}
        style={{
          background: '#1e293b',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          marginBottom: '40px',
        }}
      >
        {/* Workflow Name */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '18px', fontWeight: '500' }}>
            Workflow Name
          </label>
          <input
            {...register('name', { required: 'Workflow name is required' })}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: 'white',
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
          <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#94a3b8' }}>
            Workflow Steps
          </h2>

          {fields.map((field, index) => (
            <div
              key={field.id}
              style={{
                background: '#111827',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid #334155',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', margin: 0 }}>Step {index + 1}</h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove Step
                  </button>
                )}
              </div>

              {/* Model Dropdown */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                  Model
                </label>
                <select
                  {...register(`steps.${index}.model`, { required: 'Model is required' })}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '16px',
                    background: '#0f172a',
                    color: 'white',
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
                  <p style={{ color: '#f87171', marginTop: '6px', fontSize: '14px' }}>
                    {errors.steps[index].model.message}
                  </p>
                )}
              </div>

              {/* Prompt */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                  Prompt
                </label>
                <textarea
                  {...register(`steps.${index}.prompt`)}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px',
                    background: '#0f172a',
                    color: 'white',
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
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                  Completion Criteria
                </label>
                <input
                  {...register(`steps.${index}.completion_criteria`)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '16px',
                    background: '#0f172a',
                    color: 'white',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  placeholder="contains:success   OR   regex:\b42\b   OR   json   OR   code"
                />
              </div>
            </div>
          ))}

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
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            + Add New Step
          </button>
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button
            type="submit"
            disabled={status === 'creating' || status === 'running'}
            style={{
              background: status === 'running' ? '#4b5563' : '#3b82f6',
              color: 'white',
              padding: '16px 48px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: status === 'running' ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {status === 'creating' ? 'Creating...' :
             status === 'running' ? 'Running...' :
             'Create & Run Workflow'}
          </button>
        </div>
      </form>

      {/* Result / Progress Section */}
      {(status !== 'idle' || workflowId || runId || logs.length > 0 || error) && (
        <div style={{
          marginTop: '48px',
          padding: '32px',
          background: '#1e293b',
          borderRadius: '16px',
          border: '1px solid #334155',
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '24px', color: '#93c5fd' }}>
            Execution Progress
          </h2>

          {error && (
            <div style={{
              background: '#7f1d1d',
              color: '#fecaca',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
            }}>
              Error: {error}
            </div>
          )}

          <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
            {workflowId && (
              <div>
                <strong style={{ color: '#93c5fd' }}>Workflow ID:</strong> {workflowId}
              </div>
            )}

            {runId && (
              <div>
                <strong style={{ color: '#93c5fd' }}>Run ID:</strong> {runId}
              </div>
            )}

            <div>
              <strong style={{ color: '#93c5fd' }}>Status:</strong>{' '}
              <span style={{
                fontWeight: 'bold',
                color:
                  status === 'completed' ? '#34d399' :
                  status === 'failed' ? '#f87171' :
                  status === 'running' ? '#fbbf24' :
                  '#9ca3af',
              }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div>
              <h3 style={{ fontSize: '22px', marginBottom: '16px', color: '#cbd5e1' }}>
                Step-by-Step Logs
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '20px',
                      background: '#111827',
                      borderRadius: '10px',
                      borderLeft: `5px solid ${log.passed_criteria ? '#34d399' : '#f87171'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '18px' }}>
                        Step {log.step_index + 1} — {log.passed_criteria ? 'Passed' : 'Failed'}
                      </strong>
                      <span style={{ color: '#94a3b8' }}>
                        Retries: {log.retry_count}
                      </span>
                    </div>

                    <div style={{ marginBottom: '12px', color: '#cbd5e1' }}>
                      <strong>Output:</strong>
                      <pre style={{
                        whiteSpace: 'pre-wrap',
                        background: '#0f172a',
                        padding: '16px',
                        borderRadius: '8px',
                        marginTop: '8px',
                        fontSize: '14px',
                        overflowX: 'auto',
                      }}>
                        {log.llm_output}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
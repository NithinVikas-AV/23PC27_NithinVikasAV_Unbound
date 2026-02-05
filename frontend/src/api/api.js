import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createWorkflow = async (data) => {
  const response = await api.post('/workflows', data);
  return response.data;
};

export const runWorkflow = async (workflowId) => {
  const response = await api.post(`/workflows/${workflowId}/run`);
  return response.data;
};

export const getAllWorkflows = async () => {
  try {
    const response = await api.get('/workflows');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch workflows:', error);
    return [];
  }
};

// List all past run IDs
export const getAllExecutions = async () => {
  try {
    const response = await api.get('/executions');
    return response.data.run_ids || [];
  } catch (error) {
    console.error('Failed to fetch executions:', error);
    return [];
  }
};

// Already have this – just make sure it's there
export const getExecutionLogs = async (runId) => {
  try {
    const response = await api.get(`/executions/${runId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return { history: [] };
  }
};
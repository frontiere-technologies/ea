// API client for Neo4j operations
// This replaces direct neo4jUtils imports in components

export const neo4jApi = {
  // Applications
  async getApplications() {
    const response = await fetch('/api/neo4j/applications');
    if (!response.ok) throw new Error('Failed to fetch applications');
    return response.json();
  },

  async getApplicationLabels() {
    const response = await fetch('/api/neo4j/applications?action=labels');
    if (!response.ok) throw new Error('Failed to fetch application labels');
    return response.json();
  },

  async getConnectedApplicationLabels() {
    const response = await fetch('/api/neo4j/applications?action=connected-labels');
    if (!response.ok) throw new Error('Failed to fetch connected application labels');
    return response.json();
  },

  async saveApplication(data: any) {
    const response = await fetch('/api/neo4j/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save application');
    return response.json();
  },

  async editApplication(data: any) {
    const response = await fetch('/api/neo4j/applications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update application');
    return response.json();
  },

  async deleteApplication(applicationId: string) {
    const response = await fetch(`/api/neo4j/applications?application_id=${applicationId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete application');
    return response.json();
  },

  // Flows
  async getFlows() {
    const response = await fetch('/api/neo4j/flows');
    if (!response.ok) throw new Error('Failed to fetch flows');
    return response.json();
  },

  async getFlowLabels() {
    const response = await fetch('/api/neo4j/flows?action=labels');
    if (!response.ok) throw new Error('Failed to fetch flow labels');
    return response.json();
  },

  async getFlowGraphByLabel(label: string) {
    const response = await fetch(`/api/neo4j/flows?action=graph&label=${encodeURIComponent(label)}`);
    if (!response.ok) throw new Error('Failed to fetch flow graph');
    return response.json();
  },

  async saveFlow(data: any) {
    const response = await fetch('/api/neo4j/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save flow');
    return response.json();
  },

  async editFlow(data: any) {
    const response = await fetch('/api/neo4j/flows', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update flow');
    return response.json();
  },

  async deleteFlow(flowId: string) {
    const response = await fetch(`/api/neo4j/flows?flow_id=${flowId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete flow');
    return response.json();
  },

  // Graph
  async getNodesRelationships() {
    const response = await fetch('/api/neo4j/graph');
    if (!response.ok) throw new Error('Failed to fetch graph');
    return response.json();
  },

  // Custom query
  async executeQuery(cypher: string, params = {}) {
    const response = await fetch('/api/neo4j/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cypher, params })
    });
    if (!response.ok) throw new Error('Failed to execute query');
    return response.json();
  }
};

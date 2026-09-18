import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,

  // Fetch all workspaces for the user
  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      // Assuming we have an endpoint for this. 
      // If not, we might need to fetch the user's profile which includes workspaces, 
      // or a specific /workspaces endpoint.
      // Based on previous steps, we don't have a dedicated workspace controller yet, 
      // but auth controller creates a default one.
      // Let's assume GET /api/workspaces exists or we need to create it.
      // Checking backend routes...
      
      // Wait, I need to check if I implemented workspace routes.
      // I implemented Board, Column, Card. 
      // Auth controller creates a default workspace.
      // I probably need to implement Workspace Controller/Routes first.
      
      // For now, I'll assume I will implement GET /api/workspaces
      const response = await api.get('/workspaces');
      set({ workspaces: response.data.data.workspaces, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch workspaces',
        isLoading: false 
      });
    }
  },

  createWorkspace: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/workspaces', { name });
      set((state) => ({
        workspaces: [...state.workspaces, response.data.data.workspace],
        isLoading: false
      }));
      toast.success('Workspace created successfully');
      return response.data.data.workspace;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create workspace',
        isLoading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to create workspace');
      throw error;
    }
  },

  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace });
  }
}));

export default useWorkspaceStore;

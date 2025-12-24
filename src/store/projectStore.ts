import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Project } from '@/api/types';

interface ProjectState {
  currentProjectId: string | null;
  projects: Project[];
}

interface ProjectActions {
  setCurrentProject: (id: string | null) => void;
  setProjects: (projects: Project[]) => void;
}

type ProjectStore = ProjectState & ProjectActions;

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      currentProjectId: null,
      projects: [],

      setCurrentProject: (id) => {
        set({ currentProjectId: id });
      },

      setProjects: (projects) => {
        set({ projects });
      },
    }),
    {
      name: 'blazelog-project-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ currentProjectId: state.currentProjectId }),
    }
  )
);

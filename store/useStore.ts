import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ShapeType = 'box' | 'sphere' | 'torus' | 'cone' | 'cylinder';

export interface Object3DInstance {
  id: string;
  shapeType: ShapeType;
  color: string;
  size: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  animationSpeed: number;
  createdAt: number;
}

interface AppState {
  instances: Object3DInstance[];
  selectedInstanceId: string | null;
  useSchlickFresnel: boolean;
  cageRotateMode: boolean;
  cageRotationY: number;
  addInstance: (instance: Omit<Object3DInstance, 'id' | 'createdAt'>) => void;
  removeInstance: (id: string) => void;
  clearAllInstances: () => void;
  selectInstance: (id: string | null) => void;
  toggleShaderMode: () => void;
  setCageRotateMode: (enabled: boolean) => void;
  addCageRotationY: (delta: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      instances: [],
      selectedInstanceId: null,
      useSchlickFresnel: false,
      cageRotateMode: false,
      cageRotationY: 0,
      addInstance: (instanceData) => {
        const newInstance: Object3DInstance = {
          ...instanceData,
          id: `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        };
        set((state) => ({
          instances: [...state.instances, newInstance],
        }));
      },
      removeInstance: (id) => {
        set((state) => ({
          instances: state.instances.filter((inst) => inst.id !== id),
          selectedInstanceId: state.selectedInstanceId === id ? null : state.selectedInstanceId,
        }));
      },
      clearAllInstances: () => {
        set({
          instances: [],
          selectedInstanceId: null,
        });
      },
      selectInstance: (id) => {
        set({ selectedInstanceId: id });
      },
      toggleShaderMode: () => {
        set((state) => ({ useSchlickFresnel: !state.useSchlickFresnel }));
      },
      setCageRotateMode: (enabled) => {
        set({ cageRotateMode: enabled });
      },
      addCageRotationY: (delta) => {
        set((state) => ({ cageRotationY: state.cageRotationY + delta }));
      },
    }),
    {
      name: 'collectibol-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

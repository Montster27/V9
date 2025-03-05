/**
 * /src/__tests__/integration/redux/resourcesSlice.test.ts
 *
 * Integration tests for the resources Redux slice
 */

import { configureStore } from '@reduxjs/toolkit';
import resourcesReducer, {
  updateEnergy,
  updateStress,
  updateHealth,
  updateBelonging,
  updateKnowledge,
  updateMoney,
  updateSocial,
  updateSkillPoints,
  updateResources,
  selectEnergy,
  selectStress,
  selectHealth,
  selectBelonging,
  selectKnowledge,
  selectMoney,
  selectSocial,
  selectSkillPoints,
  selectNumericalResources,
  selectStatusResources,
} from '../../../infrastructure/state/slices/resourcesSlice';

describe('resourcesSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        resources: resourcesReducer,
      },
    });
  });

  describe('reducers', () => {
    it('should handle updateEnergy', () => {
      const initialState = store.getState().resources;

      store.dispatch(updateEnergy({ current: 50 }));

      const newState = store.getState().resources;
      expect(newState.energy.current).toBe(50);
      expect(newState.energy.max).toBe(initialState.energy.max); // Should not change
    });

    it('should handle updateStress', () => {
      store.dispatch(updateStress({ current: 45, trend: 'increasing' }));

      const newState = store.getState().resources;
      expect(newState.stress.current).toBe(45);
      expect(newState.stress.trend).toBe('increasing');
    });

    it('should handle updateHealth', () => {
      store.dispatch(updateHealth({ current: 70 }));

      const newState = store.getState().resources;
      expect(newState.health.current).toBe(70);
    });

    it('should handle updateBelonging', () => {
      store.dispatch(updateBelonging({ current: 65 }));

      const newState = store.getState().resources;
      expect(newState.belonging.current).toBe(65);
    });

    it('should handle updateKnowledge', () => {
      store.dispatch(updateKnowledge(1500));

      const newState = store.getState().resources;
      expect(newState.knowledge).toBe(1500);
    });

    it('should handle updateMoney', () => {
      store.dispatch(updateMoney(2750));

      const newState = store.getState().resources;
      expect(newState.money).toBe(2750);
    });

    it('should handle updateSocial', () => {
      store.dispatch(updateSocial(950));

      const newState = store.getState().resources;
      expect(newState.social).toBe(950);
    });

    it('should handle updateSkillPoints', () => {
      store.dispatch(updateSkillPoints({ current: 60, spent: 80 }));

      const newState = store.getState().resources;
      expect(newState.skillPoints.current).toBe(60);
      expect(newState.skillPoints.spent).toBe(80);
    });

    it('should handle updateResources', () => {
      store.dispatch(
        updateResources({
          energy: { current: 40, max: 100 },
          knowledge: 1800,
          money: 3000,
        })
      );

      const newState = store.getState().resources;
      expect(newState.energy.current).toBe(40);
      expect(newState.knowledge).toBe(1800);
      expect(newState.money).toBe(3000);
      expect(newState.lastUpdated).toBeDefined();
    });
  });

  describe('selectors', () => {
    it('should select energy state', () => {
      const state = { resources: store.getState().resources };
      const energy = selectEnergy(state);

      expect(energy).toBe(state.resources.energy);
    });

    it('should select stress state', () => {
      const state = { resources: store.getState().resources };
      const stress = selectStress(state);

      expect(stress).toBe(state.resources.stress);
    });

    it('should select numerical resources', () => {
      const state = { resources: store.getState().resources };
      const numericalResources = selectNumericalResources(state);

      expect(numericalResources).toEqual({
        knowledge: state.resources.knowledge,
        money: state.resources.money,
        social: state.resources.social,
      });
    });

    it('should select status resources', () => {
      const state = { resources: store.getState().resources };
      const statusResources = selectStatusResources(state);

      expect(statusResources).toEqual({
        energy: state.resources.energy,
        stress: state.resources.stress,
        health: state.resources.health,
        belonging: state.resources.belonging,
      });
    });
  });
});

/**
 * /src/application/hooks/useResourceSimulation.ts
 *
 * Hook for using resource simulation services in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { useSimulation } from '../providers/SimulationProvider';
import { useAppDispatch, useAppSelector } from '../../infrastructure/state/store';
import {
  updateResources,
  selectResourcesState,
  selectEnergy,
  selectStress,
  selectHealth,
  selectBelonging,
  selectSkillPoints,
} from '../../infrastructure/state/slices/resourcesSlice';
import { ResourcesState, ResourceImpact } from '../../domain/models';

/**
 * Hook for resource simulation
 * @returns Resource simulation controls and state
 */
export const useResourceSimulation = () => {
  const { resourceService, isRunning } = useSimulation();
  const dispatch = useAppDispatch();

  // Select current resources from Redux
  const resources = useAppSelector(selectResourcesState);
  const energy = useAppSelector(selectEnergy);
  const stress = useAppSelector(selectStress);
  const health = useAppSelector(selectHealth);
  const belonging = useAppSelector(selectBelonging);
  const skillPoints = useAppSelector(selectSkillPoints);

  // Callback to manually apply resource changes
  const applyResourceChange = useCallback(
    (changes: Partial<ResourcesState>) => {
      const updatedResources = {
        ...resources,
        ...changes,
        lastUpdated: Date.now(),
      };

      dispatch(updateResources(updatedResources));
    },
    [resources, dispatch]
  );

  // Calculate resource impact from a specific activity
  const calculateActivityImpact = useCallback(
    (activityType: string, duration: number, efficiency: number = 1.0): ResourceImpact => {
      // This is a simplified implementation
      // In a real app, you would get activity definitions from a service
      const impacts: Record<string, ResourceImpact> = {
        study: {
          energy: -5 * efficiency,
          stress: 1 * efficiency,
          knowledge: 5 * efficiency,
          money: 0,
          social: 0,
          health: -0.1 * efficiency,
          belonging: 0,
        },
        work: {
          energy: -8 * efficiency,
          stress: 1.5 * efficiency,
          knowledge: 1 * efficiency,
          money: 3 * efficiency,
          social: 0.5 * efficiency,
          health: -0.2 * efficiency,
          belonging: 0.2 * efficiency,
        },
        social: {
          energy: -3 * efficiency,
          stress: -1 * efficiency,
          knowledge: 0.5 * efficiency,
          money: -1 * efficiency,
          social: 3 * efficiency,
          health: 0.1 * efficiency,
          belonging: 1.5 * efficiency,
        },
        exercise: {
          energy: -10 * efficiency,
          stress: -2 * efficiency,
          knowledge: 0,
          money: -0.5 * efficiency,
          social: 0.5 * efficiency,
          health: 2 * efficiency,
          belonging: 0.3 * efficiency,
        },
        rest: {
          energy: 5 * efficiency,
          stress: -2 * efficiency,
          knowledge: 0,
          money: 0,
          social: 0,
          health: 1 * efficiency,
          belonging: 0.1 * efficiency,
        },
      };

      // Get impact for the activity type
      const baseImpact = impacts[activityType] || {
        energy: 0,
        stress: 0,
        knowledge: 0,
        money: 0,
        social: 0,
        health: 0,
        belonging: 0,
      };

      // Scale impact by duration
      return {
        energy: baseImpact.energy * duration,
        stress: baseImpact.stress * duration,
        knowledge: baseImpact.knowledge * duration,
        money: baseImpact.money * duration,
        social: baseImpact.social * duration,
        health: baseImpact.health ? baseImpact.health * duration : 0,
        belonging: baseImpact.belonging ? baseImpact.belonging * duration : 0,
      };
    },
    []
  );

  // Apply resource changes from activity
  const applyActivity = useCallback(
    (activityType: string, duration: number) => {
      // Calculate impact
      const impact = calculateActivityImpact(
        activityType,
        duration,
        1.0 // Default efficiency
      );

      // Calculate new resource values
      const newEnergy = Math.max(0, Math.min(energy.max, energy.current + impact.energy));
      const newStress = Math.max(0, Math.min(stress.max, stress.current + impact.stress));
      const newHealth = Math.max(0, Math.min(health.max, health.current + (impact.health || 0)));
      const newBelonging = Math.max(
        0,
        Math.min(belonging.max, belonging.current + (impact.belonging || 0))
      );

      // Apply changes
      const updatedResources: Partial<ResourcesState> = {
        energy: { ...energy, current: newEnergy },
        stress: { ...stress, current: newStress },
        health: { ...health, current: newHealth },
        belonging: { ...belonging, current: newBelonging },
        knowledge: resources.knowledge + impact.knowledge,
        money: resources.money + impact.money,
        social: resources.social + impact.social,
      };

      applyResourceChange(updatedResources);

      return impact;
    },
    [energy, stress, health, belonging, resources, calculateActivityImpact, applyResourceChange]
  );

  // Generate skill points manually
  const generateSkillPoints = useCallback(
    (amount: number) => {
      const updatedSkillPoints = {
        current: skillPoints.current + amount,
        generated: skillPoints.generated + amount,
        spent: skillPoints.spent,
        trend: 'increasing' as const,
      };

      applyResourceChange({
        skillPoints: updatedSkillPoints,
      });

      return updatedSkillPoints;
    },
    [skillPoints, applyResourceChange]
  );

  // Spend skill points
  const spendSkillPoints = useCallback(
    (amount: number): boolean => {
      if (skillPoints.current < amount) {
        return false;
      }

      const updatedSkillPoints = {
        current: skillPoints.current - amount,
        generated: skillPoints.generated,
        spent: skillPoints.spent + amount,
        trend: 'decreasing' as const,
      };

      applyResourceChange({
        skillPoints: updatedSkillPoints,
      });

      return true;
    },
    [skillPoints, applyResourceChange]
  );

  return {
    resources,
    energy,
    stress,
    health,
    belonging,
    skillPoints,
    applyResourceChange,
    calculateActivityImpact,
    applyActivity,
    generateSkillPoints,
    spendSkillPoints,
    isRunning,
  };
};

export default useResourceSimulation;

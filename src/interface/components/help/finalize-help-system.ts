/**
 * /src/interface/components/help/finalize-help-system.ts
 *
 * Finalizes the help system implementation with enhanced usability features
 */

import { helpSystem, HelpCategory } from '../../../domain/services/help/HelpSystem';

/**
 * Finalize help system with additional entries and tutorials
 */
export const finalizeHelpSystem = () => {
  // Add additional help entries for complex mechanics
  helpSystem.addHelpEntry({
    id: 'stress-penalties',
    title: 'Understanding Stress Penalties',
    content:
      'High stress levels affect your performance in all activities. When stress exceeds 40%, ' +
      'you begin to experience efficiency penalties. At 60%+, your energy regeneration is reduced. ' +
      'At 80%+, you may experience random negative events. Balance your activities carefully to ' +
      'manage stress effectively.',
    category: HelpCategory.RESOURCES,
    tags: ['stress', 'penalties', 'efficiency'],
  });

  helpSystem.addHelpEntry({
    id: 'energy-management',
    title: 'Energy Management Strategies',
    content:
      'Energy is consumed by most activities and regenerates during rest. To maximize your ' +
      'energy efficiency: 1) Aim for 8 hours of rest per day, 2) Balance high-energy activities ' +
      'with rest periods, 3) Keep stress below 40% to maintain energy regeneration, 4) Consider ' +
      'investing in skills that improve energy efficiency.',
    category: HelpCategory.RESOURCES,
    tags: ['energy', 'regeneration', 'efficiency'],
  });

  helpSystem.addHelpEntry({
    id: 'time-allocation-strategy',
    title: 'Effective Time Allocation Strategy',
    content:
      'When allocating your time, consider these principles: 1) Maintain at least 8 hours of rest ' +
      'to avoid penalties, 2) Allocate time based on your current goals and resource needs, ' +
      '3) Leave some flexibility for events and opportunities, 4) Adjust your allocation as your ' +
      'skills develop and resource needs change, 5) Monitor the resource impact preview to understand ' +
      'the consequences of your choices.',
    category: HelpCategory.USE_OF_TIME,
    tags: ['time', 'allocation', 'strategy', 'planning'],
  });

  // Add resource optimization tutorial
  helpSystem.addTutorial({
    id: 'resource-optimization',
    name: 'Resource Optimization Guide',
    steps: [
      {
        id: 'resource-optimization-intro',
        target: '.resources-panel',
        title: 'Balancing Your Resources',
        content:
          "Effective resource management is key to success. Let's explore how to optimize your resources.",
        position: 'right',
      },
      {
        id: 'resource-energy-management',
        target: '.resource-item:nth-child(1)',
        title: 'Energy Management',
        content:
          'Energy is consumed by most activities. Keep it above 50% for optimal performance. Rest to recover energy.',
        position: 'bottom',
      },
      {
        id: 'resource-stress-management',
        target: '.resource-item:nth-child(2)',
        title: 'Stress Management',
        content:
          'Keep stress below 40% to avoid penalties. Balance work with rest and social activities to manage stress.',
        position: 'bottom',
      },
      {
        id: 'resource-knowledge-growth',
        target: '.resource-item:nth-child(3)',
        title: 'Knowledge Growth',
        content:
          'Knowledge grows through study and classes. It unlocks new opportunities and skill options.',
        position: 'bottom',
      },
      {
        id: 'resource-money-management',
        target: '.resource-item:nth-child(4)',
        title: 'Financial Management',
        content:
          'Money comes from work and investments. Plan your expenses and build savings for future opportunities.',
        position: 'bottom',
      },
      {
        id: 'resource-social-capital',
        target: '.resource-item:nth-child(5)',
        title: 'Social Capital',
        content:
          'Social connections provide opportunities and reduce stress. Maintain a healthy social life.',
        position: 'bottom',
      },
      {
        id: 'resource-skill-points',
        target: '.resource-item:nth-child(6)',
        title: 'Skill Points',
        content:
          'Skill points are earned over time (1 per game hour). Spend them wisely to unlock new abilities.',
        position: 'bottom',
      },
    ],
  });

  // Add daily routine tutorial
  helpSystem.addTutorial({
    id: 'daily-routine',
    name: 'Setting Up Your Daily Routine',
    steps: [
      {
        id: 'daily-routine-intro',
        target: '.time-allocation-panel',
        title: 'Planning Your Day',
        content: "Your daily routine determines your progress. Let's set up an effective schedule.",
        position: 'right',
      },
      {
        id: 'morning-routine',
        target: '.slider-container:nth-child(1)',
        title: 'Morning Activities',
        content:
          'Mornings are ideal for study and classes when your mind is fresh. Consider allocating more study time in the morning.',
        position: 'right',
      },
      {
        id: 'afternoon-routine',
        target: '.slider-container:nth-child(2)',
        title: 'Afternoon Activities',
        content:
          'Afternoons work well for jobs and practical activities. This is a good time for work and exercise.',
        position: 'right',
      },
      {
        id: 'evening-routine',
        target: '.slider-container:nth-child(3)',
        title: 'Evening Activities',
        content:
          'Evenings are ideal for social activities and relaxation. Balance your day with some social time.',
        position: 'right',
      },
      {
        id: 'night-routine',
        target: '.slider-container:nth-child(4)',
        title: 'Night Routine',
        content:
          'Ensure you get enough rest - aim for at least 8 hours to avoid stress penalties and maintain energy.',
        position: 'right',
      },
      {
        id: 'routine-balance',
        target: '.time-distribution',
        title: 'Balanced Routine',
        content:
          "A balanced routine includes all essential activities. Review your time distribution to ensure you're covering all areas.",
        position: 'top',
      },
    ],
  });

  return helpSystem;
};

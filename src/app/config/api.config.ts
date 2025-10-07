export const API_CONFIG = {
  baseUrl: 'http://localhost:3000',
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
    },
    mealOptions: '/meal-options',
    patients: '/patients',
    dietPlans: '/diet-plans',
    dailyMealChoices: '/daily-meal-choices',
  },
};
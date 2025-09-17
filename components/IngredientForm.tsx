import React from 'react';
import { MealType, DietaryOption, CookingMethod } from '../types';
import { translations } from '../localization';

interface IngredientFormProps {
  ingredients: string;
  setIngredients: (value: string) => void;
  mealType: MealType;
  setMealType: (value: MealType) => void;
  isQuickMeal: boolean;
  setIsQuickMeal: (value: boolean) => void;
  dietaryOptions: DietaryOption[];
  setDietaryOptions: (options: DietaryOption[]) => void;
  cookingMethods: CookingMethod[];
  setCookingMethods: (methods: CookingMethod[]) => void;
  isLoading: boolean;
  onSubmit: () => void;
  // FIX: Update the type for `t` to be more specific, matching the actual function signature from the parent component.
  t: (key: keyof typeof translations['en']) => string;
}

const IngredientForm: React.FC<IngredientFormProps> = ({
  ingredients,
  setIngredients,
  mealType,
  setMealType,
  isQuickMeal,
  setIsQuickMeal,
  dietaryOptions,
  setDietaryOptions,
  cookingMethods,
  setCookingMethods,
  isLoading,
  onSubmit,
  t,
}) => {
  const handleDietaryChange = (option: DietaryOption) => {
    if (dietaryOptions.includes(option)) {
      setDietaryOptions(dietaryOptions.filter((item) => item !== option));
    } else {
      setDietaryOptions([...dietaryOptions, option]);
    }
  };

  const handleCookingMethodChange = (method: CookingMethod) => {
    if (cookingMethods.includes(method)) {
      setCookingMethods(cookingMethods.filter((item) => item !== method));
    } else {
      setCookingMethods([...cookingMethods, method]);
    }
  };
  
  const getDietaryOptionTranslationKey = (option: DietaryOption) => {
    return `dietaryOption${option.replace(/-/g, '_')}`;
  }
  
  const getCookingMethodTranslationKey = (method: CookingMethod) => {
    return `cookingMethod${method.replace(/ /g, '_').replace(/-/g, '_')}`;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-200">
      <h2 className="text-2xl font-bold mb-4 text-amber-800 text-center">{t('formTitle')}</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1 text-center">
            {t('ingredientsLabel')}
          </label>
          <textarea
            id="ingredients"
            rows={5}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={t('ingredientsPlaceholder')}
            className="w-full p-3 border border-black rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition duration-150 bg-white text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1">
            {t('mealTypeLabel')}
          </label>
          <select
            id="mealType"
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full p-3 border border-black rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition duration-150 bg-white"
            disabled={isLoading}
          >
            {Object.values(MealType).map((type) => (
              <option key={type} value={type}>
                {t(`mealType${type}` as keyof typeof translations['en'])}
              </option>
            ))}
          </select>
        </div>
        
        <div>
            <label className="flex items-center space-x-3 cursor-pointer">
                <input
                    type="checkbox"
                    id="quickMeal"
                    checked={isQuickMeal}
                    onChange={(e) => setIsQuickMeal(e.target.checked)}
                    className="h-4 w-4 rounded border-black bg-white text-amber-600 focus:ring-amber-500"
                    disabled={isLoading}
                />
                <span className="text-gray-700 text-sm font-medium">{t('quickMealLabel')}</span>
            </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dietaryPreferencesLabel')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(DietaryOption).map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dietaryOptions.includes(option)}
                  onChange={() => handleDietaryChange(option)}
                  className="h-4 w-4 rounded border-black bg-white text-amber-600 focus:ring-amber-500"
                  disabled={isLoading}
                />
                <span className="text-gray-700">
                  {t(getDietaryOptionTranslationKey(option) as keyof typeof translations['en'])}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('equipmentLabel')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(CookingMethod).map((method) => (
              <label key={method} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cookingMethods.includes(method)}
                  onChange={() => handleCookingMethodChange(method)}
                  className="h-4 w-4 rounded border-black bg-white text-amber-600 focus:ring-amber-500"
                  disabled={isLoading}
                />
                <span className="text-gray-700">
                  {t(getCookingMethodTranslationKey(method) as keyof typeof translations['en'])}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <button
        onClick={onSubmit}
        disabled={isLoading || !ingredients.trim()}
        className="mt-8 w-full bg-amber-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isLoading ? t('generateButtonLoading') : t('generateButton')}
      </button>
    </div>
  );
};

export default IngredientForm;
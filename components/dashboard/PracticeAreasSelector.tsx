'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface PracticeAreaCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  practice_areas: PracticeArea[];
}

interface PracticeArea {
  id: string;
  slug: string;
  name: string;
}

interface PracticeAreasSelectorProps {
  selectedPracticeAreas: string[];
  onSelectionChange: (practiceAreaIds: string[]) => void;
  selectedCategories: string[];
  onCategoryChange: (categoryIds: string[]) => void;
}

export function PracticeAreasSelector({
  selectedPracticeAreas,
  onSelectionChange,
  selectedCategories,
  onCategoryChange,
}: PracticeAreasSelectorProps) {
  const [categories, setCategories] = useState<PracticeAreaCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPracticeAreas();
  }, []);

  const fetchPracticeAreas = async () => {
    try {
      const response = await fetch('/api/practice-areas');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching practice areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // Remove category and all its subcategories
      const newCategories = selectedCategories.filter(id => id !== categoryId);
      onCategoryChange(newCategories);
      
      // Remove subcategories belonging to this category
      const categoryPracticeAreas = categories.find(c => c.id === categoryId)?.practice_areas || [];
      const newPracticeAreas = selectedPracticeAreas.filter(paId => 
        !categoryPracticeAreas.some(pa => pa.id === paId)
      );
      onSelectionChange(newPracticeAreas);
    } else {
      // Add category
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const handlePracticeAreaToggle = (practiceAreaId: string) => {
    const newSelection = selectedPracticeAreas.includes(practiceAreaId)
      ? selectedPracticeAreas.filter(id => id !== practiceAreaId)
      : [...selectedPracticeAreas, practiceAreaId];
    
    onSelectionChange(newSelection);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Practice Areas
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select your main practice areas and their specializations.
        </p>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="flex-1 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                </div>
                {expandedCategories.has(category.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {/* Category Checkbox */}
              <div className="ml-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-xs text-blue-600 font-medium">Select</span>
                </label>
              </div>
            </div>

            {/* Only show subcategories if category is selected and expanded */}
            {selectedCategories.includes(category.id) && expandedCategories.has(category.id) && (
              <div className="border-t border-gray-200 p-4">
                <div className="space-y-2">
                  {category.practice_areas.map((practiceArea) => (
                    <div key={practiceArea.id} className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPracticeAreas.includes(practiceArea.id)}
                          onChange={() => handlePracticeAreaToggle(practiceArea.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">{practiceArea.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Display selected categories and specializations */}
      {(selectedCategories.length > 0 || selectedPracticeAreas.length > 0) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Practice Areas:</h4>
          
          {selectedCategories.map(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            const categoryPracticeAreas = selectedPracticeAreas.filter(paId => 
              category?.practice_areas.some(pa => pa.id === paId)
            );
            
            return (
              <div key={categoryId} className="mb-3">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {category?.name}
                  </span>
                </div>
                
                {categoryPracticeAreas.length > 0 && (
                  <div className="ml-6 mt-1">
                    <span className="text-xs text-blue-800 font-medium">Specializes in: </span>
                    <div className="space-y-1">
                      {categoryPracticeAreas.map((practiceAreaId) => {
                        const practiceArea = category?.practice_areas.find(pa => pa.id === practiceAreaId);
                        return practiceArea ? (
                          <div key={practiceAreaId} className="flex items-center space-x-2">
                            <Check className="h-3 w-3 text-blue-600" />
                            <span className="text-sm text-blue-900">
                              {practiceArea.name}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
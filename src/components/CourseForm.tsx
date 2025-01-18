import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { courseClassMap, programmeCategories, type ProgrammeCategory, type CourseData } from '../data/courses';

interface CourseFormProps {
  onAdd: (course: { courseCode: string; classCode: string; category: string }) => void;
  courseData: CourseData[];
}

export function CourseForm({ onAdd, courseData }: CourseFormProps) {
  const [courseCode, setCourseCode] = useState('');
  const [classCode, setClassCode] = useState('');
  const [category, setCategory] = useState<ProgrammeCategory>(programmeCategories[0]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableClassCodes = courseClassMap[courseCode] || [];

  useEffect(() => {
    setClassCode('');
  }, [courseCode]);

  const handleCourseCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setCourseCode(upperValue);
    
    if (upperValue) {
      const matches = Object.keys(courseClassMap).filter(code => 
        code.startsWith(upperValue)
      );
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCourseCode(suggestion);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseCode && classCode) {
      onAdd({
        courseCode,
        classCode,
        category
      });
      // Reset form
      setCourseCode('');
      setClassCode('');
      setCategory(programmeCategories[0]);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700">
            Course Code
          </label>
          <input
            ref={inputRef}
            id="courseCode"
            type="text"
            value={courseCode}
            onChange={(e) => handleCourseCodeChange(e.target.value)}
            onFocus={() => courseCode && setSuggestions(Object.keys(courseClassMap).filter(code => 
              code.startsWith(courseCode)
            ))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter course code (e.g., CS1010)"
            required
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
              <ul className="py-1">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="classCode" className="block text-sm font-medium text-gray-700">
            Class Code
          </label>
          <select
            id="classCode"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
            disabled={!courseCode || !availableClassCodes.length}
          >
            <option value="">Select a class code</option>
            {availableClassCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Programme Requirements Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProgrammeCategory)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            {programmeCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Course
      </button>
    </form>
  );
}
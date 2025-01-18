import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableClassCodes = courseClassMap[courseCode] || [];
  const allCourseCodes = Object.keys(courseClassMap);

  const filteredCourses = searchTerm
    ? allCourseCodes.filter(code => code.includes(searchTerm.toUpperCase()))
    : allCourseCodes;

  useEffect(() => {
    setClassCode('');
  }, [courseCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCourseSelect = (selectedCode: string) => {
    setCourseCode(selectedCode);
    setShowSuggestions(false);
    setSearchTerm('');
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
      setSearchTerm('');
      setCategory(programmeCategories[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div ref={dropdownRef} className="relative">
          <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700">
            Course Code
          </label>
          <div className="relative mt-1">
            <div
              className="relative w-full cursor-pointer"
              onClick={() => setShowSuggestions(true)}
            >
              <input
                type="text"
                id="courseCode"
                className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm cursor-pointer"
                placeholder="Select or search for a course"
                value={showSuggestions ? searchTerm : courseCode}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                required
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
            </div>

            {showSuggestions && (
              <div className="absolute z-10 mt-1 w-full rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto">
                {filteredCourses.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No courses found
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {filteredCourses.map((code) => (
                      <li
                        key={code}
                        className={`flex cursor-pointer select-none items-center px-4 py-2 text-sm hover:bg-indigo-50 ${
                          code === courseCode ? 'bg-indigo-50' : ''
                        }`}
                        onClick={() => handleCourseSelect(code)}
                      >
                        <span className="flex-grow font-medium">{code}</span>
                        {courseClassMap[code] && (
                          <span className="ml-2 text-xs text-gray-500">
                            {courseClassMap[code].length} class{courseClassMap[code].length !== 1 ? 'es' : ''}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
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
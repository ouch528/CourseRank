import React, { useState, useCallback } from 'react';
import { GraduationCap, Search, Loader2 } from 'lucide-react';
import { CourseForm } from './components/CourseForm';
import { CourseList } from './components/CourseList';
import { CourseTable } from './components/CourseTable';
import { AdminPanel } from './components/AdminPanel';
import { ErrorDisplay } from './components/ErrorDisplay';
import { useErrorHandler } from './hooks/useErrorHandler';
import { courseData as initialCourseData, updateCourseClassMap } from './data/courses';
import type { SelectedCourse } from './types';

const getPriorityScore = (category: string): number => {
  switch (category) {
    case "UTown/USP courses":
      return 8;
    case "Major core and Primary Major 1st Specialisation courses":
      return 7;
    case "Primary Major courses":
      return 6;
    case "Second Major Specialisation courses":
      return 5;
    case "Faculty Requirement courses":
      return 4;
    case "Second Major courses":
      return 3;
    case "Restricted/Direct Minor courses":
      return 2;
    case "Unrestricted Elective / General Education courses":
      return 1;
    default:
      return 0;
  }
};

function App() {
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [showRankings, setShowRankings] = useState(false);
  const [courseData, setCourseData] = useState(initialCourseData);
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearError, retryOperation } = useErrorHandler();

  const handleAddCourse = useCallback((course: Omit<SelectedCourse, 'id' | 'priority'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const priority = getPriorityScore(course.category);
    setSelectedCourses(prev => [...prev, { ...course, id, priority }]);
    setShowRankings(false);
    clearError();
  }, [clearError]);

  const handleRemoveCourse = useCallback((id: string) => {
    setSelectedCourses(prev => prev.filter(course => course.id !== id));
    setShowRankings(false);
    clearError();
  }, [clearError]);

  const handleSearchRankings = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      setShowRankings(true);
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      handleError(err, handleSearchRankings);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  const handleUpdateCourseData = useCallback(async (newData: any[]) => {
    try {
      setIsLoading(true);
      clearError();
      
      const formattedData = newData.map(item => ({
        courseCode: item.course_code,
        courseClass: item.course_class,
        rd0_TF: item.Rd0_TF,
        rd0_rate: item.Rd0_rate,
        rd1_TF: item.Rd1_TF,
        rd1_rate: item.Rd1_rate,
        rd2_TF: item.Rd2_TF,
        rd2_rate: item.Rd2_rate,
        rd3_TF: item.Rd3_TF,
        rd3_rate: item.Rd3_rate
      }));
      
      // Update both the course data and the course class map
      setCourseData(formattedData);
      updateCourseClassMap(formattedData);
    } catch (err) {
      handleError(err, () => handleUpdateCourseData(newData));
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-4">
          <AdminPanel onUpdateData={handleUpdateCourseData} />
        </div>

        <div className="text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-indigo-600" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            University Course Ranking
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Find the ranking and availability of your courses
          </p>
        </div>

        <div className="mt-12 max-w-7xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-6">
            <CourseForm onAdd={handleAddCourse} courseData={courseData} />
            
            {selectedCourses.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Selected Courses</h2>
                <CourseList 
                  courses={selectedCourses} 
                  onRemove={handleRemoveCourse} 
                />
                
                <button
                  onClick={handleSearchRankings}
                  disabled={isLoading}
                  className="mt-6 flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Loading...' : 'Submit for ranking'}
                </button>
              </div>
            )}

            {error && (
              <ErrorDisplay 
                message={error.message} 
                onRetry={error.retry ? retryOperation : undefined} 
              />
            )}

            {showRankings && !isLoading && !error && (
              <CourseTable selectedCourses={selectedCourses} courseData={courseData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
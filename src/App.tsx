import React, { useState, useCallback, useEffect } from 'react';
import { GraduationCap, Search, Loader2, Zap } from 'lucide-react';
import { CourseForm } from './components/CourseForm';
import { CourseList } from './components/CourseList';
import { CourseTable } from './components/CourseTable';
import { BiddingRecommendations } from './components/BiddingRecommendations';
import { ErrorDisplay } from './components/ErrorDisplay';
import { useErrorHandler } from './hooks/useErrorHandler';
import { courseData as initialCourseData, loadCourseData } from './data/courses';
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

export default function App() {
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [showRankings, setShowRankings] = useState(false);
  const [courseData, setCourseData] = useState(initialCourseData);
  const [isLoading, setIsLoading] = useState(true);
  const { error, handleError, clearError, retryOperation } = useErrorHandler();

  useEffect(() => {
    const initializeCourseData = async () => {
      try {
        const data = await loadCourseData();
        setCourseData(data);
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCourseData();
  }, [handleError]);

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
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      handleError(err, handleSearchRankings);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-600 rounded-full mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            CourseRank
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Smart course rank, don't get course rekt
          </p>
        </div>

        <div className="mt-12 max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-indigo-100">
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
                  className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Analyzing courses...' : 'Get Course Analysis'}
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
              <>
                <BiddingRecommendations selectedCourses={selectedCourses} courseData={courseData} />
                <CourseTable selectedCourses={selectedCourses} courseData={courseData} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import type { SelectedCourse } from '../types';
import type { CourseData } from '../data/courses';
import { AlertTriangle } from 'lucide-react';
import { sortCourses } from './CourseTable';

interface BiddingRecommendationsProps {
  selectedCourses: SelectedCourse[];
  courseData: CourseData[];
}

const getBiddingOrderByRound = (courses: (SelectedCourse & CourseData)[]) => {
  const biddingOrder: { [key: number]: (SelectedCourse & CourseData)[] } = {
    1: [],
    2: [],
    3: []
  };

  // Create intermediary sorted table
  const sortedCourses = sortCourses(courses);
  
  const assignedCourses = new Set<string>();
  const getCourseId = (course: SelectedCourse & CourseData) => 
    `${course.courseCode}-${course.classCode}`;

  // Round 1: High priority courses (priority > 1), max 4
  const round1Candidates = sortedCourses
    .filter(course => course.priority > 1);

  for (const course of round1Candidates) {
    if (biddingOrder[1].length < 4) {
      biddingOrder[1].push(course);
      assignedCourses.add(getCourseId(course));
    }
  }

  // Round 2: Based on the sorted intermediary table
  const maxRound2Slots = 5 - biddingOrder[1].length;
  const round2Candidates = sortedCourses
    .filter(course => !assignedCourses.has(getCourseId(course)));

  for (const course of round2Candidates) {
    const courseId = getCourseId(course);
    if (!assignedCourses.has(courseId)) {
      if (biddingOrder[2].length < maxRound2Slots) {
        biddingOrder[2].push(course);
        assignedCourses.add(courseId);
      } else {
        // Move to round 3 if rounds 1 and 2 are full
        biddingOrder[3].push(course);
        assignedCourses.add(courseId);
      }
    }
  }

  return biddingOrder;
};

export function BiddingRecommendations({ selectedCourses, courseData }: BiddingRecommendationsProps) {
  if (!Array.isArray(courseData) || !Array.isArray(selectedCourses)) {
    return (
      <div className="mt-8 p-4 flex items-center justify-center bg-yellow-50 rounded-lg border border-yellow-200">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
        <p className="text-yellow-700">Unable to load course data. Please try again later.</p>
      </div>
    );
  }

  const mergedCourses = selectedCourses
    .map(selected => {
      const courseInfo = courseData.find(
        c => c.courseCode.trim() === selected.courseCode.trim() && 
             c.courseClass.trim() === selected.classCode.trim()
      );
      return courseInfo ? { ...selected, ...courseInfo } : null;
    })
    .filter((course): course is NonNullable<typeof course> => course !== null);

  if (mergedCourses.length === 0) {
    return (
      <div className="mt-8 p-4 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No matching course data found.</p>
      </div>
    );
  }

  const biddingOrder = getBiddingOrderByRound(mergedCourses);
  const totalRound1And2 = biddingOrder[1].length + biddingOrder[2].length;

  return (
    <div className="mt-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recommended Bidding Order</h3>
          <p className="text-sm text-gray-600 mt-1">
            Total modules in Rounds 1 & 2: {totalRound1And2}/5
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          {[1, 2, 3].map(round => (
            <div key={round} className="space-y-3">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                Round {round}
                {round === 1 && (
                  <span className="ml-2 text-sm text-gray-500">(Maximum 4 courses)</span>
                )}
                {round === 2 && (
                  <span className="ml-2 text-sm text-gray-500">
                    (Maximum {5 - biddingOrder[1].length} courses)
                  </span>
                )}
              </h4>
              
              {biddingOrder[round].length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {biddingOrder[round].map((course, index) => (
                    <div 
                      key={`${course.courseCode}-${course.classCode}-${index}`}
                      className="bg-gray-50 p-3 rounded-lg flex items-center"
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <div className="flex justify-between flex-1">
                        <span className="font-medium text-gray-900">{course.courseCode}</span>
                        <span className="text-gray-600">{course.classCode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No courses recommended for this round</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
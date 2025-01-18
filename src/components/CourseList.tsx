import React from 'react';
import { X } from 'lucide-react';
import type { SelectedCourse } from '../types';

interface CourseListProps {
  courses: SelectedCourse[];
  onRemove: (id: string) => void;
}

export function CourseList({ courses, onRemove }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No courses added yet. Add courses above to see them here.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {courses.map((course) => (
        <div
          key={course.id}
          className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-900">{course.courseCode}</span>
              <span className="text-gray-600">{course.classCode}</span>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                Priority: {course.priority}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{course.category}</p>
          </div>
          <button
            onClick={() => onRemove(course.id)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={`Remove ${course.courseCode}`}
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      ))}
    </div>
  );
}
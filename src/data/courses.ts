export interface CourseData {
  courseCode: string;
  courseClass: string;
  rd0_TF: boolean;
  rd0_rate: number;
  rd1_TF: boolean;
  rd1_rate: number;
  rd2_TF: boolean;
  rd2_rate: number;
  rd3_TF: boolean;
  rd3_rate: number;
}

export let courseClassMap: { [key: string]: string[] } = {
  'ACC1701': ['LV1', 'LV2'],
  'ACC1701X': ['LX1', 'LX2'],
  'ACC2706': ['SA1'],
  'ACC2707': ['SA1', 'SA2'],
  'ACC2708': ['SA1'],
  'ACC2709': ['SA1', 'SA2', 'SA3'],
  'ACC3701': ['SA1', 'SA2'],
  'ACC3702': ['SA1', 'SA2']
};

export const updateCourseClassMap = (courseData: CourseData[]) => {
  const newMap: { [key: string]: Set<string> } = {};
  
  courseData.forEach(course => {
    if (!newMap[course.courseCode]) {
      newMap[course.courseCode] = new Set();
    }
    newMap[course.courseCode].add(course.courseClass);
  });
  
  courseClassMap = Object.fromEntries(
    Object.entries(newMap).map(([code, classes]) => [code, Array.from(classes).sort()])
  );
};

export const programmeCategories = [
  "UTown/USP courses",
  "Major core and Primary Major 1st Specialisation courses",
  "Primary Major courses",
  "Second Major Specialisation courses",
  "Faculty Requirement courses",
  "Second Major courses",
  "Restricted/Direct Minor courses",
  "Unrestricted Elective / General Education courses"
] as const;

export type ProgrammeCategory = typeof programmeCategories[number];

export const courseData: CourseData[] = [];
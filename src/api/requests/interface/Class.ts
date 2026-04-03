interface CourseClassProps {
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  courses: { id: string; name: string }[];
}

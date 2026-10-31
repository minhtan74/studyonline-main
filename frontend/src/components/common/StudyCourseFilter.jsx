export default function StudyCourseFilter({ courses, value, onChange, disabled = false }) {
  return <label className="study-course-filter">
    <span>Khóa học</span>
    <select aria-label="Lọc gợi ý theo khóa học" value={value} disabled={disabled} onChange={event => onChange(event.target.value)}>
      <option value="all">Tất cả khóa học</option>
      {value !== 'all' && !courses.some(course => String(course.id) === value) && <option value={value}>Khóa học đã chọn không còn dữ liệu</option>}
      {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
    </select>
  </label>;
}

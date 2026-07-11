<?php

require_once
    "../app/models/Enrollment.php";

class EnrollmentController
{
    public function enroll()
    {
        session_start();

        $userId =
            $_SESSION['user_id'];

        $courseId =
            $_GET['course_id'];

        $enrollment =
            new Enrollment();

        if (
            !$enrollment->isEnrolled(
                $userId,
                $courseId
            )
        ) {
            $enrollment->enroll(
                $userId,
                $courseId
            );
        }

        header(
            "Location:?page=my-courses"
        );
    }

    public function myCourses()
    {
        session_start();

        $userId =
            $_SESSION['user_id'];

        $enrollment =
            new Enrollment();

        $courses =
            $enrollment->myCourses(
                $userId
            );

        require_once
            "../app/views/student/my_courses.php";
    }
}
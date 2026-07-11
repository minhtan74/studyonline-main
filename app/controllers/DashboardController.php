<?php

class DashboardController
{
    public function index()
    {
        require_once dirname(__DIR__) . "/views/dashboard/index.php";
    }
}
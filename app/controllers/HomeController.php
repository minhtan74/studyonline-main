<?php

class HomeController
{
    public function index()
    {
        require_once dirname(__DIR__) . "/views/home/index.php";
    }
}
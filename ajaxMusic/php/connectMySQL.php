<?php
/**
 * Created by PhpStorm.
 * User: litao
 * Date: 2018/5/16
 * Time: 10:59
 * 連接數據庫的配置文件
 */

header("content-type:text/html;charset=utf-8");

//建立與數據庫的連接
$dbc = mysqli_connect('localhost','root','root','music') or die("連接數據庫失敗");

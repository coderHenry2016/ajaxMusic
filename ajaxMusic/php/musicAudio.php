<?php
/**
 * Created by PhpStorm.
 * User: litao
 * Date: 2018/5/16
 * Time: 11:56
 * 加載相應id的歌曲
 */
require_once('connectMySQL.php');

$id = $_GET['id'];
$sql = "select * from music_list where id = $id";

$query = mysqli_query($dbc,$sql);

if( $query && mysqli_num_rows($query) ){
    echo json_encode(mysqli_fetch_assoc($query));
}




?>
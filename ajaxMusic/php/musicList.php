<?php
/**
 * Created by PhpStorm.
 * User: litao
 * Date: 2018/5/16
 * Time: 10:45
 */
require_once('connectMySQL.php');

$sql = "select * from  music_list ";

$query = mysqli_query($dbc,$sql);

while ($row = mysqli_fetch_array($query)){
    $list[] = $row;
}
echo json_encode($list);

//if( $query && mysqli_num_rows($query) ){
//    echo json_encode(mysqli_fetch_assoc($query));
//}





?>
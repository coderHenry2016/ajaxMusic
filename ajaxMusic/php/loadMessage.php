<?php
/**
 * Created by PhpStorm.
 * User: litao
 * Date: 2018/5/17
 * Time: 9:39
 * 載入留言
 */

require_once('connectMySQL.php');
$mid = $_GET['mid'];

//查詢到mid等於某值時候的所有數據！
$sql = "select * from message_list where mid = $mid";

$query = mysqli_query($dbc,$sql);

if( $query && mysqli_num_rows($query) ){

    while ($row = mysqli_fetch_assoc($query)){
        $list[] = $row;
    }


    echo json_encode($list);
}

mysqli_close($dbc);
?>
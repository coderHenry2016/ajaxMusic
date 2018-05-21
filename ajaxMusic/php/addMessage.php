<?php
/**
 * Created by PhpStorm.
 * User: litao
 * Date: 2018/5/17
 * Time: 9:54
 * 添加留言信息
 */


require_once('connectMySQL.php');
$mid = $_POST['mid'];
$text = htmlspecialchars($_POST['text']);
$sql = "insert into message_list(mid,text) values($mid , '$text')";
$query = mysqli_query($dbc,$sql);

if($query){
    echo '{"code":"1","message":"'.$text.'"}';
}
else{
    echo '{"code":"0","message":"添加失败"}';
}

mysqli_close($dbc);







?>
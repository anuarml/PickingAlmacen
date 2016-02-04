<?php
	include_once('config.php');

	try{
		$username = $_GET['username'];
		$pass = $_GET['password'];

		$link = new PDO(   $db_url, 
	                        $user, 
	                        $password,  
	                        array(
	                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
	                        ));

		$handle = $link->prepare('EXEC spThoValidaPwdPick :username, :password, :output');

		$handle->bindParam(':username', $username);
		$handle->bindParam(':password', $pass);
		$handle->bindParam(':output', $output, PDO::PARAM_STR, 2);
		$handle->execute();

		if($output === '0'){
			echo json_encode(true);
		}else{
			if($output == '1'){
				echo json_encode(false);	
			}
		}
	}
	catch(PDOException $ex){
		error_log($ex->getMessage());
	    print($ex->getMessage());
	}
?>
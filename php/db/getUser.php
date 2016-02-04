<?php
	include_once('config.php');

	try{
		$username = $_GET['user'];
		$link = new PDO(   $db_url, 
	                        $user, 
	                        $password,  
	                        array(
	                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
	                        ));
		
		$handle = $link->prepare('SELECT Usuario [user], Nombre name FROM '.$table_Usuario.' WHERE Usuario = :user');
		
	 	$handle->bindParam(':user', $username);
		
	    $handle->execute();

	    if($result = $handle->fetch(PDO::FETCH_OBJ)){
	    	echo json_encode($result);
	    }
	    else echo json_encode(false);
		
	}
	catch(PDOException $ex){
		error_log($ex->getMessage());
	    print($ex->getMessage());
	}

?>
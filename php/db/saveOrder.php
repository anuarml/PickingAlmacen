<?php
	include_once('config.php');

	try{
		if( isset($_POST['id']) && $_POST['id'] !== ''){
		
			$orderID = $_POST['id'];
			$jProducts = $_POST['aScan'];

			$aProducts = json_decode($jProducts);

			$link = new PDO(   $db_url, 
		                        $user, 
		                        $password,  
		                        array(
		                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
		                        ));

			$handle = $link->prepare('UPDATE '.$table_inventory_detail.' SET cantidadA = :scanQuantity WHERE ID = :orderID AND Renglon = :row');
		
			$handle->bindParam(':orderID', $orderID);

			$aProductsLength = count($aProducts);

			for($i=0; $i<$aProductsLength; $i++){
				$handle->bindParam(':scanQuantity', $aProducts[$i]->scanQuantity);
				$handle->bindParam(':row', $aProducts[$i]->row);
			    $handle->execute();
			}

		    echo json_encode(true);
		}
		else{
			echo json_encode(false);
		}
	}
	catch(PDOException $ex){
		error_log($ex->getMessage());
	    print($ex->getMessage());
	}

?>
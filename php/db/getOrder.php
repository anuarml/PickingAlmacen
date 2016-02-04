<?php
	include_once('config.php');

	try{
		if( isset($_GET['movID']) && $_GET['movID'] !== ''){
		
			$movID = $_GET['movID'];

			$link = new PDO(   $db_url, 
		                        $user, 
		                        $password,  
		                        array(
		                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
		                        ));

			/*$handle = $link->prepare('SELECT id, movID, empresa company, almacen warehouse, almacenDestino office FROM '.$table_inventory.' WHERE Mov = :mov AND MovID = :movID');*/
			
			$handle = $link->prepare('SELECT inv.id, inv.mov, inv.movID, art.fabricante, invD.articulo code, invD.cantidad requestQuantity, artSubExistenciaInv.inventario inventoryQuantity, inv.empresa company, inv.almacen warehouse, inv.almacenDestino office, invD.renglon row FROM '.$table_inventory.' inv JOIN '.$table_inventory_detail.' invD ON inv.ID = invD.ID JOIN '.$table_article.' art ON invD.Articulo = art.Articulo JOIN '.$table_inventory_existence.' artSubExistenciaInv ON invD.Articulo = artSubExistenciaInv.Articulo AND artSubExistenciaInv.Almacen = invD.Almacen WHERE invD.SECCION IS NULL AND artSubExistenciaInv.Inventario > 0 AND inv.Mov = :mov AND inv.MovID = :movID ORDER BY art.Fabricante, invD.Articulo, invD.ID');
				
			$mov = 'Orden Traspaso';
			$handle->bindParam(':mov', $mov);
			$handle->bindParam(':movID', $movID);
		    $handle->execute();

		    //if($order = $handle->fetchObject()){
		    if($order = $handle->fetchAll(PDO::FETCH_OBJ)){
		    	
		    	//$order->products = getOrderDetail($link, $order);
		    	if($orderDetails = $handle->fetchAll(PDO::FETCH_OBJ)){
			
					$detailsLen = count($orderDetails);

					for($i=0; $i<$detailsLen; $i++){
						$productCode = $orderDetails[$i]->code;

						$orderDetails[$i]->barcodes = getProductBarCodes($link, $productCode);

						$orderDetails[$i]->inventoryQuantity = getInventoryQuantity($link, $company, $warehouse , $productCode);
					}
				}

		    	echo json_encode($order);
		    }
		    else echo json_encode(false);
		}
	}
	catch(PDOException $ex){
		error_log($ex->getMessage());
	    print($ex->getMessage());
	}

	//@return: false. Fallo en la consulta.
	function getOrderDetail($link, $order){
		include('config.php');

		$handle = $link->prepare('SELECT articulo code, cantidadPendiente requestQuantity, renglon row FROM '.$table_inventory_detail.' WHERE ID = :id');

		$handle->bindParam(':id', $order->id);

		$handle->execute();

		$company = $order->company;
		$warehouse = $order->warehouse;

		if($orderDetails = $handle->fetchAll(PDO::FETCH_OBJ)){
			
			$detailsLen = count($orderDetails);

			for($i=0; $i<$detailsLen; $i++){
				$productCode = $orderDetails[$i]->code;

				$orderDetails[$i]->barcodes = getProductBarCodes($link, $productCode);

				$orderDetails[$i]->inventoryQuantity = getInventoryQuantity($link, $company, $warehouse , $productCode);
			}
		}

	    return $orderDetails;
	}

	function getInventoryQuantity($link, $company, $warehouse , $productCode){
		include('config.php');

		$handle = $link->prepare('SELECT Convert(float, Disponible) available FROM '.$view_productAvail.' WHERE Empresa = :company AND Almacen = :warehouse AND Articulo = :productCode');

		$handle->bindParam(':company', $company);
		$handle->bindParam(':warehouse', $warehouse);
		$handle->bindParam(':productCode', $productCode);

		$handle->execute();

		$inventoryQuantity = 0;

		if($result = $handle->fetchObject()){
			$inventoryQuantity = $result->available;
		}

		return $inventoryQuantity;
	}

	function getProductBarCodes($link, $code){
		include('config.php');

		$handle = $link->prepare('SELECT codigo barcode FROM '.$table_barcode.' WHERE Cuenta = :code');

		$handle->bindParam(':code', $code);

		$handle->execute();

		$barCodes = array();

		if($aBarcodes = $handle->fetchAll(PDO::FETCH_OBJ)){
			$aBarcodesLen = count($aBarcodes);

			for($i=0; $i<$aBarcodesLen; $i++){
				$barCodes[] = $aBarcodes[$i]->barcode;
			}
		}

	    return $barCodes;
	}
?>
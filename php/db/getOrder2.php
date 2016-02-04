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

			// En la condición solo se toma en cuenta el Mov y MovID. Se omitió la empresa porque actualmente el MovID es diferente en cada empresa.
			$handle = $link->prepare('SELECT id, movID, almacenDestino office, estatus status FROM '.$table_inventory.' WHERE Mov = :mov AND MovID = :movID');
			
			/*$handle = $link->prepare('SELECT '.$table_inventory.'.id, '.$table_inventory.'.mov, '.$table_inventory.'.movID, '.$table_article.'.fabricante, '.$table_inventory_detail.'.articulo code, '.$table_inventory_detail.'.cantidad requestQuantity, '.$table_inventory_existence.'.inventario inventoryQuantity, '.$table_inventory.'.empresa company, '.$table_inventory.'.almacen warehouse, '.$table_inventory.'.almacenDestino office, '.$table_inventory_detail.'.renglon row FROM '.$table_inventory.' JOIN '.$table_inventory_detail.' ON '.$table_inventory.'.ID = '.$table_inventory_detail.'.ID JOIN '.$table_article.' ON '.$table_inventory_detail.'.Articulo = '.$table_article.'.Articulo JOIN '.$table_inventory_existence.' ON '.$table_inventory_detail.'.Articulo = '.$table_inventory_existence.'.Articulo AND '.$table_inventory_existence.'.Almacen = '.$table_inventory_detail.'.Almacen WHERE '.$table_inventory_detail.'.SECCION IS NULL AND '.$table_inventory_existence.'.Inventario > 0 AND '.$table_inventory.'.Mov = :mov AND '.$table_inventory.'.MovID = :movID ORDER BY '.$table_article.'.Fabricante, '.$table_inventory_detail.'.Articulo, '.$table_inventory_detail.'.ID');*/
				
			$mov = 'Orden Traspaso';
			$handle->bindParam(':mov', $mov);
			$handle->bindParam(':movID', $movID);
		    $handle->execute();

		    if($order = $handle->fetchObject()){
		    	
		    	$order->products = getOrderDetail($link, $order);
		    	$order->totalProducts = getTotalProducts($link, $order);

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

		$handle = $link->prepare('SELECT invD.articulo code, invD.cantidad requestQuantity, invD.renglon row, invExistence.inventario inventoryQuantity FROM '.$table_inventory_detail.' invD JOIN '.$table_article.' art ON invD.articulo = art.articulo JOIN '.$table_inventory_existence.' invExistence ON invD.Articulo=invExistence.Articulo AND invExistence.Almacen=invD.Almacen WHERE invD.id = :id AND invD.seccion IS NULL AND invExistence.inventario > 0 ORDER BY art.fabricante, invD.articulo');

		$handle->bindParam(':id', $order->id);

		$handle->execute();

		//$company = $order->company;
		//$warehouse = $order->warehouse;

		if($orderDetails = $handle->fetchAll(PDO::FETCH_OBJ)){
			
			$detailsLen = count($orderDetails);
			error_log(json_encode($detailsLen));
			for($i=0; $i<$detailsLen; $i++){
				$productCode = $orderDetails[$i]->code;

				$orderDetails[$i]->barcodes = getProductBarCodes($link, $productCode);

				//$orderDetails[$i]->inventoryQuantity = getInventoryQuantity($link, $company, $warehouse , $productCode);
			}
		}

	    return $orderDetails;
	}

	function getTotalProducts($link, $order){
		include('config.php');

		$handle = $link->prepare('SELECT SUM(invD.cantidad) total FROM InvD invD JOIN Art art ON invD.articulo = art.articulo JOIN ArtSubExistenciaInv invExistence ON invD.Articulo=invExistence.Articulo AND invExistence.Almacen=invD.Almacen WHERE invD.id = :id AND invD.seccion IS NULL AND invExistence.inventario > 0');

		$handle->bindParam(':id', $order->id);

		$handle->execute();

		//$company = $order->company;
		//$warehouse = $order->warehouse;
		$total = 0;

		if($result = $handle->fetch(PDO::FETCH_OBJ)){
			$total = $result->total;
		}

	    return $total;
	}

	/*function getInventoryQuantity($link, $company, $warehouse , $productCode){
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
	}*/

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
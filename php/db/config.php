<?php
    // ----------------SQL Server config------------------------
    $host = '192.168.96.3';
    $user = 'sa';
    $password = 'Tho2015';
    $database = 'Bellisima';

    $db_url = 'sqlsrv:server='.$host.';Database='.$database;


    //----------------- DB table names -------------------------
	$table_inventory = 'Inv';
	$table_inventory_detail = 'InvD';
	$table_Usuario = 'Usuario';
    $table_barcode = 'CB';
	$table_article = 'Art';
	$table_inventory_existence = 'ArtSubExistenciaInv';		
    $view_productAvail = 'ArtDisponible';
	
	
	//$sp_validatePassword = 'spThoValidaPwdPick';
?>


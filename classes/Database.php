<?php

// Classe permettant de generer une connexion a une base de donnees
class Database {
  var $connexion, $debug_error;

  // Constructeur
  function __construct($server, $base, $user, $password, $debug_error = FALSE) {
    $this->connexion = new mysqli($server, $user, $password, $base);
    $this->connexion->set_charset("utf8");
    $this->debug_error = $debug_error;
  }

  // Methodes publiques
  function executeRequest($requete) {
    $resultat = $this->connexion->query($requete);
    if (! $resultat && $this->debug_error) {
      print("Message d'erreur pour la requete ***" . $requete . "***: %s\n" . $this->connexion->error);
    }
    return $resultat;
  }

  function fetchObject($resultat) {
    return $resultat->fetch_assoc();
  }

  function getInsertedId() {
    return $this->connexion->insert_id;
  }

  function close() {
    $this->connexion->close();
  }
}

/**
 * ****************************************************
 */
/* Fonctions de gestion des données de base de données */
/**
 * ****************************************************
 */
function getObjectFromDB($class, $filter = NULL, $sort = NULL) {
  $phpObjects = getObjectsFromDB($class, $filter);
  
  if (($phpObjects != NULL) && (count($phpObjects) > 0))
    return $phpObjects [0];
  
  return null;
}

function getObjectsFromDB($class, $filter = NULL, $sort = NULL, $limit = NULL, $debug = FALSE) {
  $database = new Database(DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD);
  $tableName = getTableNameFromClass($class);
  $requete = "SELECT * FROM " . $tableName;
  
  if ($filter)
    $requete .= " WHERE " . $filter;
  
  if ($sort)
    $requete .= " ORDER BY " . $sort;
  
  if ($limit)
    $requete .= " LIMIT " . $limit;
  
  if ($debug == TRUE)
    echo $requete . "<br/>";
  
  $resultat = $database->executeRequest($requete);
  $phpObjects = array ();
  
  while ( $object = $database->fetchObject($resultat) ) {
    $objectName = getObjectNameFromTableName($tableName);
    $phpObject = new $objectName();
    $objectVars = get_object_vars($phpObject);
    
    foreach ( $objectVars as $key => $value ) {
      $column_name = getColumnNameFromVarName($key);
      $phpObject->$key = $object [$column_name];
    }
    
    $phpObjects [] = $phpObject;
  }
  
  $database->close();
  
  return $phpObjects;
}

function getObjectsCountFromDB($class, $filter = NULL) {
  $database = new Database(DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD);
  $tableName = getTableNameFromClass($class);
  $requete = "SELECT COUNT(*) AS count_result FROM " . $tableName;
  
  if ($filter)
    $requete .= " WHERE " . $filter;
  
  $resultat = $database->executeRequest($requete);
  $object = $database->fetchObject($resultat);
  $result = $object['count_result'];
  $database->close();
  
  return $result;
}

function createObjectToDB($class, $data, $updateDates = TRUE, $debug_error = FALSE) {
  return createOrUpdateObjectToDB($class, null, $data, TRUE, $updateDates, $debug_error);
}

function updateObjectToDB($class, $filter, $data) {
  return createOrUpdateObjectToDB($class, $filter, $data, FALSE);
}

function createOrUpdateObjectToDB($class, $filter, $data, $isCreation = TRUE, $updateDates = TRUE, $debug_error = FALSE) {
  $tableName = getTableNameFromClass($class);
  $phpObject = new $class();
  $objectVars = get_object_vars($phpObject);
  $requete = "";
  $addComa = FALSE;
  
  if ($isCreation)
    $requete = "INSERT INTO " . $tableName . " SET ";
  else
    $requete = "UPDATE " . $tableName . " SET ";
  
  foreach ( $objectVars as $key => $value ) {
    $column_name = getColumnNameFromVarName($key);
    $addQuote = true;
    $valueSet = false;
    
    if (isset($data [$key])) {
      $valueSet = true;
      $value = $data [$key];
      
      if ($value == "NOW()") {
        $addQuote = false;
      }
      else if ($updateDates && startsWith($key, "date_") && $value != "NULL") {
        $value = getSQLDate($value);
      }
      else if ($value == "NULL") {
        $addQuote = false;
      }
    }
    else if (($key == "date_creation") && $isCreation) {
      $value = "NOW()";
      $valueSet = true;
      $addQuote = FALSE;
    }
    
    if ($valueSet) {
      if ($addComa == TRUE)
        $requete .= ", ";
      
      if (! get_magic_quotes_gpc())
        $value = addslashes($value);
      
      $requete .= $column_name . "=" . ($addQuote == TRUE ? "'" : "") . $value . ($addQuote == TRUE ? "'" : "");
      $addComa = TRUE;
    }
  }
  
  if (! $isCreation && $filter)
    $requete .= " WHERE " . $filter;

  $database = new Database(DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD, $debug_error);
  $resultat = $database->executeRequest($requete);
  $insertedId = $database->getInsertedId();
  $database->close();
  
  return $insertedId;
}

function deleteObjectToDB($class, $filter = NULL) {
  $tableName = getTableNameFromClass($class);
  $requete = "DELETE FROM " . $tableName;
  
  if ($filter)
    $requete .= " WHERE " . $filter;
  
  $database = new Database(DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD);
  $resultat = $database->executeRequest($requete);
  $database->close();
}

function getObjectNameFromTableName($tableName) {
  return ucfirst($tableName);
}

function getColumnNameFromVarName($varName) {
  return strtoupper($varName);
}

function getTableNameFromClass($class) {
  return strtolower($class);
}

?>
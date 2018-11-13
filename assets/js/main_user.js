// Initialise the Zendesk JavaScript API client
// https://developer.zendesk.com/apps/docs/apps-v2

//$(document).ready(function(){
/////////////////// CONFIGURACION //////////////////////
var ConToken  = true;
var carnet    = '';
var accion    = '';
var dividir   = '';
var municipio ='';

//TOKEN AOUTH2
const usuario    = 'zendesk';
const clave      = '@23nd3$k.arsyunen';
const tipo_grant = 'password';
const tipo_dato  = 'json';
const metodo     = 'POST';

//requestWebService
const dataType      = 'json';
const url_correo    = 'https://api.arsyunen.com/afiliados/agregarcorreo';
const url_direccion = 'https://api.arsyunen.com/afiliados/agregardireccion';
const url_telefono  = 'https://api.arsyunen.com/afiliados/agregartelefono';
const method        = 'POST';
////////////////////////////////////////////////////////



/////////////////// INICIO //////////////////////
var data_WebService;
var client = ZAFClient.init();
client.on('app.registered', function() {
  //Inicio y Consultar
  ViewData();
  Footer();

});

///Capturamos el cambio en el campo de DIRECCION
client.on('user.direccion.changed', function(data) {
  /*console.log('Cambio de la Direccion');
  direccion = data;
    if (ConToken == true){
      //Genera el Token y Hace la Consulta
      accion = 'direccion';
      //GenerarToken();
    }else{
      //Genera la Consulta
      requestWebService();
    }*/
});


///Capturamos el cambio en el campo de CORREO
client.on('user.email.changed', function(data) {
	console.log('Cambio de Email');
	correo = data;
    if (ConToken == true){
      //Genera el Token y Hace la Consulta
      accion = 'correo';
      GenerarToken();
    }else{
      //Genera la Consulta
      requestWebService();
    }
});


///Capturamos el cambio en el campo de MUNICIPIO
client.on('user.municipio_select.changed', function(data) {
  //console.log('Cambio de la Municipio');
  municipio = data;
    if (ConToken == true){
      //Genera el Token y Hace la Consulta
      accion = 'municipio';
      //GenerarToken();
    }else{
      //Genera la Consulta
      requestWebService();
    }
});


///Capturamos el cambio en el campo de PROVINCIAS
client.on('user.provincias_select.changed', function(data) {
  provincia = data;
  if (ConToken == true){
    //Genera el Token y Hace la Consulta
    accion = 'provincia';
    //GenerarToken();
  }else{
    //Genera la Consulta
    requestWebService();
  }
});

/////////////////// LOGICA DEL NEGOCIO //////////////////////

/**
 * { Permite generar la información que se va a mostrar en el ticket }
 *
 * @class      ViewData (name)
 */
	function ViewData() {  

		//Obtenemos el ID del usarios, para buscar y obtener su carnet
		client.get('user').then(function(data){
      url_2 = '/api/v2/users/'+data.user.id+'.json';
      client.request(url_2).then(function(data) {

        id = data.user.user_fields.carnet;
        municipio1 =  data.user.user_fields.municipio_select;
        if (!id)  client.invoke('notify', "No tiene Número de Carnet", "error", 5000);
			});
		});
	}


function GenerarToken(){

  $.ajax({
    url: "https://api.arsyunen.com/token",
    beforeSend: function(xhr) {
        //console.log('Solicitando Token...');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
    },
    dataType: tipo_dato,
    type: metodo,
    data: {
        username: usuario,
        password: clave,
        grant_type: tipo_grant
    },
    success: function(response) {
        token = response.access_token;
        expiresIn = response.expires_in;
        //console.log('token: '+token);
        //console.log('Exp: '+ expiresIn);
        requestWebService(token);

    },
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      //Process error actions
      //alert('Error: ' + errorThrown);
      console.log('Error Token: ' +XMLHttpRequest.status + ' ' + 
          XMLHttpRequest.statusText);
      return false;
    }
  });
}


function requestWebService(token){
  if (accion == 'correo'){
        console.log('correo');
    url2 = url_correo;
    data = {
        "usuario": null,
        "requerimiento": 
        {
          "id": 0,
          "Correo": correo,
          "Principal": true,
          "Carnet": id
        },
    }
    getAjax();

  }else if (accion =='telefono'){
    url2 = url_telefono;
    console.log('telefono');
    data = {
        "usuario": null,
        "requerimiento": 
        {
          "id": 0,
          "Telefono": telefono,
          "Principal": true,
          "Carnet": id
        },
    }
    getAjax();

  }else if (accion =='direccion'){
    url2 = url_direccion;
    console.log('direccion');
    data = {
        "usuario": null,
        "requerimiento": 
        {
          "id": 0,
          "Direccion": direccion,
          "Principal": true,
          "Carnet": id
        },
    }
    getAjax();

  }else if (accion =='provincia'){
    url2 = url_direccion;
    //ViewData();
    //Buscar el Valor del Option
    client.request('https://arsyunen.zendesk.com/api/v2/user_fields/360000274534/options.json').then(function(registro) {
      for(var a = 0; a < registro.count; a++){
        if( provincia == registro.custom_field_options[a].value ){
          valor = registro.custom_field_options[a].name;
          //id1    = registro.custom_field_options[a].value;
          var dividir = valor.split('-');

          //Separamos el ID y el Nombre
          //dividir = provincia.split('_');
        }
      }

      data = {
          "usuario": null,
          "requerimiento": 
          {
            "CodigoMunicipio": null,
            "NombreMunicipio": null,
            "CodigoProvincia": dividir[0],
            "NombreProvincia": dividir[1],
            "Principal": true,
            "Carnet": id
          },
      }
      AjaxProvincia(token,data);
    });


  }else if (accion =='municipio'){
    url2 = url_direccion;
    //console.log('municipio');
    data = {
        "usuario": null,
        "requerimiento": 
        {
          "Direccion": direccion,
          "CodigoMunicipio": arrayMuni[0],
          "NombreMunicipio": arrayMuni[1],
          "CodigoProvincia": arrayProv[0],
          "NombreProvincia": arrayProv[1],
          "Principal": true,
          "Carnet": id
        },
    }
    getAjax();
  }  
}


function getAjax(){
  $.ajax({
    "dataType": dataType,
    "async": true,
    "crossDomain": true,
    "url": url2,
    "method": method,
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": 'Bearer '+token
    },
    "data": data,

    beforeSend: function(response){
      console.log('Enviando Actualizacion '+accion+'...'+'afiliado:'+id);
    },
    success: function(response) {
      //showHistorico(response.Resultado);

      if (response.Errores){
        err = 'Error: '+response.Errores[0].NumeroError + ' - '+response.Errores[0].Descripción
        client.invoke('notify', err, "error", 5000);        
      }else{
        client.invoke('notify', "Datos Actualizado Correctamente en el Servidor");

      } 
      console.log('Fin Actualizacion...');
    },
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      //Process error actions
      console.log('Consulta:' + XMLHttpRequest.status + ' ' + 
          XMLHttpRequest.statusText);
      return false;
    }
  });
}
 

//});

function AjaxProvincia(token, data){
  $.ajax({
    "dataType": dataType,
    "async": true,
    "crossDomain": true,
    "url": url2,
    "method": method,
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": 'Bearer '+token
    },
    "data": data,

    beforeSend: function(response){
      console.log('Enviando Actualizacion '+accion+'...'+'afiliado:'+id);
    },
    success: function(response) {
      //showHistorico(response.Resultado);

      if (response.Errores){
        err = 'Error: '+response.Errores[0].NumeroError + ' - '+response.Errores[0].Descripción
        client.invoke('notify', err, "error", 5000);        
      }else{
        client.invoke('notify', "Datos Actualizado Correctamente en el Servidor");

      } 
      console.log('Fin Actualizacion...');
    },
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      //Process error actions
      console.log('Consulta:' + XMLHttpRequest.status + ' ' + 
          XMLHttpRequest.statusText);
      return false;
    }
  });

}

function actualizar_usuario(){

  //Obtenemos el ID del usarios, para buscar y obtener su carnet
  client.get('user').then(function(data){
    //console.dir(data.user.id);

    //Actualizamos el telefnoo
    accion ='telefono';
    GenerarToken();

    url_2 = '/api/v2/users/'+data.user.id+'.json';
    client.request(url_2).then(function(data) {

      telefono = data.user.phone;
      id = data.user.user_fields.carnet;
      direccion = data.user.user_fields.direccion;
      municipio = data.user.user_fields.municipio_select; //ID
      provincia = data.user.user_fields.provincias_select;  // ID_NOMBRE

      //console.log(municipio);
      //Buscar el Valor del Option
      client.request('https://arsyunen.zendesk.com/api/v2/user_fields/360000274534/options.json').then(function(registro) {
        for(var a = 0; a < registro.count; a++){
          if( provincia == registro.custom_field_options[a].value ){
            valor = registro.custom_field_options[a].name;
            arrayProv = valor.split('-');
          }
        }

      //Buscar el Valor del Option
      client.request('https://arsyunen.zendesk.com/api/v2/user_fields/360000281033/options.json').then(function(registro) {
        for(var a = 0; a < registro.count; a++){
          if( municipio == registro.custom_field_options[a].value ){
            valor = registro.custom_field_options[a].name;
            arrayMuni = valor.split('-');
          }
        }

        //Actualizamos la direccion, municipio, comunas
        accion = 'municipio';
        GenerarToken();

      });

      });    
     });

  });
}

function Footer(){
  html = '<footer>\
            <hr>\
              <button class="c-btn c-btn--icon c-btn--pill c-btn--basic c-btn--muted">\
                <svg class="c-btn__icon">\
                  <svg viewBox="0 0 26 26" id="zd-svg-icon-26-zendesk" width="100%" height="100%"><path fill="currentColor" d="M12 8.2v14.5H0zM12 3c0 3.3-2.7 6-6 6S0 6.3 0 3h12zm2 19.7c0-3.3 2.7-6 6-6s6 2.7 6 6H14zm0-5.2V3h12z"></path></svg>\
                </svg>\
              </button>\
              Desarrollado por <a href="http://www.zerviz.cl" target="_blank" >ZerviZ</a> 2018\
          </footer>';

  $("#footer").html(html);  
}
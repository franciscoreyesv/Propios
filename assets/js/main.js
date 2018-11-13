// Initialise the Zendesk JavaScript API client
// https://developer.zendesk.com/apps/docs/apps-v2

//$(document).ready(function(){
/////////////////// CONFIGURACION //////////////////////
var app_ancho = '100%'; 
var app_alto  = '390px';

var ConToken  = true;
var id = '';

//MODAL
var pagina      = 'assets/modal.html';
var modal_ancho = '900px'; 
var modal_alto  = '500px';

//TOKEN AOUTH2
const usuario    =  'zendesk';
const clave      =  '@23nd3$k.arsyunen';
const tipo_grant =  'password';
const tipo_dato  = 'json';
const metodo     = 'POST';

//requestWebService
const dataType = 'json';
const url      = 'https://api.arsyunen.com/afiliados/buscar';
const method   = 'POST';


//////////////////

/////////////////// INICIO //////////////////////
var data_WebService;
var client = ZAFClient.init();
client.on('app.registered', function() {
  client.invoke('resize', { width: app_ancho, height: app_alto });
  ViewData();
  Footer();
});


client.on('ticket.requester.email.changed', function(data) {
  //Inicio y Consultar
  ViewData();
//  console.log('ddddd');
});

/////////////////// LOGICA DEL NEGOCIO //////////////////////

function GenerarToken(){
  $(".loading").show();
  $("#content").hide();

  $.ajax({
    url: "https://api.arsyunen.com/token",
    beforeSend: function(xhr) {
        console.log('Solicitando Token...');
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

        //answerWebService('');
        requestWebService(token);

    },
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      //Process error actions
      //alert('Error: ' + errorThrown);
        console.log(errorThrown);
        console.log('Error Token: ' +XMLHttpRequest.status + ' ' + XMLHttpRequest.statusText);
      return false;
    }
  });
}

function requestWebService(token){
  //console.log("cons-tok: "+token);

  $.ajax({
    "dataType": dataType,
    "async": true,
    "crossDomain": true,
    "url": url,
    "method": method,
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": 'Bearer '+token
    },
    "data": {
      "requerimiento": id
    },

    beforeSend: function(response){
      console.log('Enviando Consulta...'+'afiliado:'+id);
    },
    success: function(response) {

      if (response.Errores){
        err = 'Error: '+response.Errores[0].NumeroError + ' - '+response.Errores[0].Descripción
        client.invoke('notify', err, "error", 5000);  
        $(".loading").hide();      
        console.log(err);
        //showError(response);
      }else{
        answerWebService(response.Resultado);
      } 
            
      console.log('Fin Consulta...');

    },
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      //Process error actions
      ///alert('Error: ' + errorThrown);
      console.log('Consulta:' + XMLHttpRequest.status + ' ' + 
          XMLHttpRequest.statusText);
      //return false;
    }
  });

}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

/**
 * { Permite generar la información que se va a mostrar en el ticket }
 *
 * @class      ViewData (name)
 */
function ViewData() {
  
  //Obtenemos un valor de la Vista
  ArrayCampos = ['ticket.requester.id', 'ticket.form.id'];
  client.get(ArrayCampos).then(function(data) {

    //Buscamos con el Id del Ticket, el Usuario a que pertenece
    //para obtener el CARNET
    
      url_2 = '/api/v2/users/'+data[ArrayCampos[0]]+'.json';
      client.request(url_2).then(function(data) {

        //Este ID lo necesita el WebService para poder traer los datos de ese Usuario
        id = data.user.user_fields.carnet;
        if (!id){
          client.invoke('notify', "No tiene Número de Carnet", "error", 5000);
          $(".loading").hide();
          //return false;
          
        } 

        //$("#img_id").val("Información");
        if (ConToken == true){
          //Genera el Token y Hace la Consulta
          GenerarToken();
        }else{
          //Genera la Consulta
          requestWebService();
        }
      });
    
  });

  //  console.log(requester_data);
}

function answerWebServiceV2(json_data) {
  //console.dir(json_data);      
  showInfo(json_data);
}


/**
 * Muestra la información en la Vista del Ticket
 *
 * @param      {array}  requester_data  Data que se va a mostrar
 */
function answerWebService(requester_data){
  //console.log(requester_data);
    var source = $("#requester-template").html();
    var template = Handlebars.compile(source);
    var html = template(requester_data);
    $("#content").html(html);    
    $(".loading").hide();
    $("#content").show();
}

/**
 * Shows the error.
 */ 
function showError(response) {
  var error_data = {
    'status': response.status,
    'statusText': response.statusText
  };
  var source = $("#error-template").html();
  var template = Handlebars.compile(source);
  var html = template(error_data);
  $("#content").html(html);
  $(".loading").hide();
  $("#content").show();
}


function showModal(){
  client.context().then(create_modal);

};

function create_modal(context){

  var parent_guid = context.instanceGuid;
  var options = {
    location: "modal",
    url: pagina+"#parent_guid=" + parent_guid
  }
  client.invoke('instances.create', options)
};




function requestWebServiceV2(api, type, dataType, id){ 

  urlv2 = '/api/v2/'+ api +'/' + id + '.json';
  var settings = {
    url: urlv2,
    type: type,
    dataType: dataType,
  };

  client.request(settings).then(
    function(data) {
      //data_WebService = data;
      //console.dir(data_WebService);
      answerWebService(data);
    },
    function(response) {
      console.log('error');      
      showError(response);
    }
  );
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

//});
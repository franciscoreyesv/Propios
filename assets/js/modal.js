$(document).ready(function(){
// Initialise the Zendesk JavaScript API client
// https://developer.zendesk.com/apps/docs/apps-v2

/////////////////// CONFIGURACION //////////////////////
var app_ancho = '100%'; 
var app_alto  = '390px';

var ConToken  = true;
var id = '';
let token ='';
var inicio = '';
var fin    = '';


//TOKEN AOUTH2
const usuario    =  'zendesk';
const clave      =  '@23nd3$k.arsyunen';
const tipo_grant =  'password';
const tipo_dato  = 'json';
const metodo     = 'POST';

//requestWebService
const dataType = 'json';
const url      = 'https://api.arsyunen.com/afiliados/planesconsolidados';
const method   = 'POST';

const url_historico = 'https://api.arsyunen.com/afiliados/historico';
const url_nucleo    = 'https://api.arsyunen.com/afiliados/nucleo';

//////////////////

/////////////////// INICIO //////////////////////

var data_WebService;
///var client = ZAFClient.init();
//client.on('app.registered', function() {
  //  client.invoke('resize', { width: app_ancho, height: app_alto });
  //Inicio y Consultar
  //ViewData();
//});
//
    var client = ZAFClient.init();
    client.invoke('resize', { width: '1000px', height: app_alto });
    //Footer();

  //  console.log(' modal: '+modalClient);
    
    client.on('app.registered', init);
  
    function init(){
      var params = parseParams(window.location.hash); //We start the modal client, then parse any parameters in the url
      var pc = getParentClient(params.parent_guid); //Hopefully this includes the parent_guid we want to send when creating modals
      pc.get('ticket').then(function(ticket_data){
        ViewData(ticket_data);
      });  //And like that we now have easy access to the parent ticket modal without guessing which instance the parent is from an array.. Winning!
    };
    
    function parseParams(param_string){
      var param_sub = param_string.replace('#','').split('&');

      var param_obj = _.reduce(param_sub, function(memo, k){
        kv = k.split('=');
        memo[kv[0]] = kv[1];
        return memo;
      }, {});

      return param_obj;  //Might be overbuilt but I like it because it returns a very pretty object
    };


    function getParentClient(parent_guid) {  //Definitely redundant but w/e
      return client.instance(parent_guid)
    }

/////////////////// LOGICA DEL NEGOCIO //////////////////////

function GenerarToken(){

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
        requestWebService(token);
        requestWebServiceHistorico(token);
        requestWebServiceNucleoFamiliar(token);

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

function requestWebServiceHistorico(token){
  f = new Date();
  //console.log("cons-tok: "+token);
  $.ajax({
    "dataType": dataType,
    "async": true,
    "crossDomain": true,
    "url": url_historico,
    "method": method,
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": 'Bearer '+token
    },
    "data": {
      "requerimiento": 
      {
        "carnet": id,
        "desde": (f.getFullYear()-1) +"-" + (f.getMonth() +1) + "-"+f.getDate(),
        "hasta": getFecha(),
      },
    },

    beforeSend: function(response){
      console.log('Enviando Consulta Historico...'+'afiliado:'+id);

    },
    success: function(response) {
      showHistorico(response.Resultado);
      console.log('Fin Consulta Historico...');

    },
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      //Process error actions
      ///alert('Error: ' + errorThrown);
      console.log('Consulta:' + XMLHttpRequest.status + ' ' + 
          XMLHttpRequest.statusText);
      return false;
    }
  });

}



function requestWebServiceNucleoFamiliar(token){
  //console.log("cons-tok: "+token);
  $.ajax({
    "dataType": dataType,
    "async": true,
    "crossDomain": true,
    "url": url_nucleo,
    "method": method,
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": 'Bearer '+token
    },
    "data": {
      "requerimiento": id,
    },

    beforeSend: function(response){
      console.log('Enviando Consulta Nucleo...'+'afiliado:'+id);
    },
    success: function(response) {
      /// console.log(response.Resultado);
      showNucleFamiliar(response.Resultado);
      console.log('Fin Consulta Nucleo...');

    },
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      //Process error actions
      ///alert('Error: ' + errorThrown);
      console.log('Consulta:' + XMLHttpRequest.status + ' ' + 
          XMLHttpRequest.statusText);
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
      //answerWebService(response.Resultado);
      showInfo(response.Resultado);
      console.log('Fin Consulta...');

    },
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      //Process error actions
      ///alert('Error: ' + errorThrown);
      console.log('Consulta:' + XMLHttpRequest.status + ' ' + 
          XMLHttpRequest.statusText);
      return false;
    }
  });

}


/**
 * { Permite generar la información que se va a mostrar en el ticket }
 *
 * @class      ViewData (name)
 */
function ViewData(objecto) {

  if ($.type(objecto) === 'object'){
      
      //Buscamos con el Id del Ticket, el Usuario a que pertenece
      //para obtener el CARNET
      url_2 = '/api/v2/users/'+objecto.ticket.requester.id+'.json';
      client.request(url_2).then(function(data) {

        //console.log(url_2);
        //Este ID lo necesita el WebService para poder traer los datos de ese Usuario
        //console.dir(data);

        id = data.user.user_fields.carnet;
        $('#carnet').val(id);

        console.log("id : " + id);
        if (ConToken == true){
          //Genera el Token y Hace la Consulta
          GenerarToken();
        }else{
          //Genera la Consulta
          requestWebService();
        }
      });

  }else{

    var ArrayCampos = ['ticket.requester.id'];
    //Obtenemos un valor de la Vista
    client.get(ArrayCampos).then(function(data) {

      //console.log(data);
      //Buscamos con el Id del Ticket, el Usuario a que pertenece
      //para obtener el CARNET
      client.request('/api/v2/users/'+data[ArrayCampos[0]]+'.json').then(function(data) {

        //Este ID lo necesita el WebService para poder traer los datos de ese Usuario
        id = data.user.user_fields.carnet;
        if (ConToken == true){
          //Genera el Token y Hace la Consulta
          GenerarToken();
        }else{
          //Genera la Consulta
          requestWebService();
        }

      });
    });
  }
}

/**
 * Muestra la información en la Vista del Ticket
 *
 * @param      {array}  requester_data  Data que se va a mostrar
 */
function showInfo(requester_data){
  var source = $("#requester-template-coberturas").html();
  var template = Handlebars.compile(source);
  //console.log(requester_data[0]);
  var html = template(requester_data[0]);
  $("#content").html(html);    
  $(".loading").hide();    
}

function showHistorico(requester_data){
  var registro = {};
  registro['data']   = requester_data;
  registro['carnet'] = requester_data[0].Carnet;

  var source = $("#requester-template-historico").html();
  var template = Handlebars.compile(source);
  //console.log(template);
  var html = template(registro);
  $("#contentHistorico2").html(html);

  $('.input-daterange input').each(function() {
      $(this).datepicker({
        language: "es",
        clearBtn: true,
        autoclose: true,
        todayHighlight: true,
        toggleActive: true,
        clearDates: true
      });
  });
  $(".loaderHistorico").hide();    
}


function showNucleFamiliar(requester_data){
  var source = $("#requester-template-nucleo-familiar").html();
  var template = Handlebars.compile(source);
  var html = template(requester_data);
  $("#contentNucleoFamiliar").html(html);    
  $(".loaderNucleoFamiliar").hide();
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
  }
});



function showGifSearch(){
    html = '<div class="loading_historico">\
            <div class="loader"></div>\
            <div class="c-tooltip c-arrow c-arrow--l u-va-top">Buscando...</div>\
          </div>';

  $("#gifsearch").html(html);
  $("#gifsearch").show();  

}

function hideGifSearch(){
  $("#gifsearch").hide();  
}



  function search(){
    inicio = $('#start').val();
    fin    = $('#end').val();
    id     = $('#carnet').val();
    GenerarToken2();
  }



function GenerarToken2(){

const usuario    =  'zendesk';
const clave      =  '@23nd3$k.arsyunen';
const tipo_grant =  'password';
const tipo_dato  = 'json';
const metodo     = 'POST';

  $.ajax({
    url: "https://api.arsyunen.com/token",
    beforeSend: function(xhr) {
        console.log('Solicitando Token...');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
    },
    dataType: 'json',
    type: 'POST',
    data: {
        username: usuario,
        password: clave,
        grant_type: tipo_grant
    },
    beforeSend: function(){
        showGifSearch();
    },
    success: function(response) {
        token = response.access_token;
        expiresIn = response.expires_in;
        //console.log('token: '+token);
        //console.log('Exp: '+ expiresIn);
        requestWebServiceHistorico2(token);
        $(".loading_historico").hide();

    },
    complete: function(){
        //hideGifSearch();
    },
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      //Process error actions
      //alert('Error: ' + errorThrown);
      console.log('Error Token: ' +XMLHttpRequest.status + ' ' + 
          XMLHttpRequest.statusText);
      return false;
    }
  });



function getFormatFecha(fecha){
  f = fecha.split('/');
  f1 = f[2] +"-" + f[1] + "-"+f[0];
  return f1;
}

function requestWebServiceHistorico2(token){

//requestWebService
const dataType = 'json';
const url_historico = 'https://api.arsyunen.com/afiliados/historico';
const method   = 'POST';

//const id = '52032';

  $.ajax({
    "dataType": dataType,
    "async": true,
    "crossDomain": true,
    "url": url_historico,
    "method": method,
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": 'Bearer '+token
    },
    "data": {
      "requerimiento": 
      {
        "carnet": id,
        "desde": getFormatFecha(inicio),
        "hasta": getFormatFecha(fin),
      },
    },
    beforeSend: function(response){
      console.log('Enviando Consulta Historico2...'+'afiliado:'+id);

    },
    success: function(response) {
      //console.log(response.Resultado);
      showHistorico2(response.Resultado);
      console.log('Fin Consulta Historico2...');

    },
    complete: function(){
        hideGifSearch();
    },    
    'error': function (XMLHttpRequest, textStatus, errorThrown) {
      //Process error actions
      ///alert('Error: ' + errorThrown);
    
      var client = ZAFClient.init();
      err = XMLHttpRequest.status + ' ' + XMLHttpRequest.statusText;
      client.invoke('notify', err, "error", 5000);  
      console.log('Consulta:' + err);
      return false;
    }
  });



function showHistorico2(requester_data){
  var registro = {};
  if (requester_data != '' ){ 
      registro['data']   = requester_data;
      registro['carnet'] = requester_data[0].Carnet; 
  }

  var source = $("#requester-template-historico").html();
  var template = Handlebars.compile(source);
  //console.log(template);
  var html = template(registro);
  $("#contentHistorico2").html(html);

  $('.input-daterange input').each(function() {
      $(this).datepicker({
        language: "es",
        clearBtn: true,
        autoclose: true,
        todayHighlight: true,
        toggleActive: true,
        clearDates: true
      });
  });

  $(".loaderHistorico").hide();    
}

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


}

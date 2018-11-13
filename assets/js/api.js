$(document).ready(function(){

//include("js/main.js");
/**
 * API CONFIGURATION
 */ 
const API_USERNAME               = 'zendesk';
const API_PASSWORD               = '@23nd3$k.arsyunen';
const API_GRANT_TYPE             = 'password';

const RESOURCE_URL               = 'token';

const API_ENDPOINT               = 'https://api.arsyunen.com/';
const API_ENDPOINT_TOKEN         = 'token';
const API_ENDPOINT_USER          = 'usuarios/';
const API_ENDPOINT_AFFILIATE     = 'afiliados/';

var API_TESTCARD;
var dataSample={};
/**
 * AXIOS INSTANCE CONFIGURATION
 */ 
const HTTP = axios.create({
    baseURL: API_ENDPOINT
});
  
HTTP.interceptors.request.use(function(request) {
    return auth.getToken().then(function(response) {
        const token = response ? response.access_token : '';
        request.headers.Authorization = `Bearer ${token}`;
        return Promise.resolve(request);
    }).catch(function(error) {
        console.log('Hubo un error obteniendo el token del api');
        console.log(error);
    });
}, function(error) {
    return Promise.reject(error);
});


HTTP.interceptors.response.use(function (response) {
    if (response.data.Errores !== null || response.data.Resultado === false) {
        let errors = [];

        if (Array.isArray(response.data.Errores)) {
            errors = response.data.Errores.map(error => error.Descripción);
        } else {
            errors.unshift(response.data.Errores);
        }

        return Promise.reject({
            custom: true,
            errores: errors,
        });
    }
    return response;
  }, function (error) {
    return Promise.reject(error);
  });

/**
 * API EXPOSED METHODS
 */ 

const auth = {  
    getToken: function () {
        const url = `${API_ENDPOINT}${API_ENDPOINT_TOKEN}`;
        const request = `grant_type=${API_GRANT_TYPE}&username=${API_USERNAME}&password=${API_PASSWORD}`;    
        return new Promise(function(resolve, reject) {
            axios.post(url, request)
             .then(function(response) {
                 resolve(response.data);
             })
             .catch(function(error) {
                 reject(error);
             });
         });
    }
};

const affiliate = {
    searchProfile: function(user, yunenCard) {
        const url = `${API_ENDPOINT_AFFILIATE}Buscar`;
        const request = {
            usuario: user,
            requerimiento: yunenCard
        };

        return new Promise(function(resolve, reject) {
           HTTP.post(url, request)
            .then(function(response) {
                resolve(response.data.Resultado);
            })
            .catch(function(error) {
                reject(error);
            });
        });
    },    
};

/**
 * USING API METHODS
var dataSample  = {
    user: null,
    affiliateYunenCard: API_TESTCARD
};
 */ 

function dataSamplev2(user, id){
    dataSample  = {
        user: null,
        affiliateYunenCard: id
    };

//    console.dir(dataSample);
}

function displayResponse(data) {
    const responseContainer = document.getElementById('jesus');
    if (responseContainer) {
        const formattedData =  JSON.stringify(data, null, 9);
        responseContainer.innerHTML = '<div class="c-callout c-callout--error"><button class="c-callout__close"></button>'+data+'</div>';
;
    }
}

function displayLoader(message) {
    const responseContainer = document.getElementById('loading');
    if (responseContainer) {
        responseContainer.innerHTML = '<div class="loader"></div>';//'<div class="c-callout c-callout--error"><button class="c-callout__close"></button>' +  message +  '</div>'; 
    }
}

function include(filename)
{
    var head = document.getElementsByTagName('head')[0];

    var script = document.createElement('script');
    script.src = filename;
    script.type = 'text/javascript';

    head.appendChild(script)
}

function initialize() {

    displayLoader('Llamando API');
    console.dir('initialize');
    console.dir(dataSample);
            affiliate.searchProfile(dataSample.user, dataSample.affiliateYunenCard)
                .then(function(response) {
                    //displayResponse(response);
                        console.dir('oooooo');

                    answerWebService(response);
                })    
                .catch(function(error) {
                    console.log('Error buscando perfil');
                    //console.log(error);
                    displayResponse(error);
                });

/*
    const btnSearchProfile = document.getElementById('btnSearchProfile');
    if(btnSearchProfile) {
        btnSearchProfile.addEventListener('click', function() {
            displayLoader('Llamando API: Buscar perfil');
            affiliate.searchProfile(dataSample.user, dataSample.affiliateYunenCard)
                .then(function(response) {
                    //displayResponse(response);
                    answerWebService(response);
                })    
                .catch(function(error) {
                    console.log('Error buscando perfil');
                    //console.log(error);
                    displayResponse(error);
                });
        });
    }

    */
}

/**
 * ////
 */

// Initialise the Zendesk JavaScript API client
// https://developer.zendesk.com/apps/docs/apps-v2

/////////////////// CONFIGURACION //////////////////////
var app_ancho = '100%'; 
var app_alto = '390px';

//MODAL
var pagina = 'assets/modal_pedidos.html';
var modal_ancho = '900px'; 
var modal_alto = '500px';

///////////////////


/////////////////// INICIO //////////////////////
var data_WebService;
var client = ZAFClient.init();

client.on('app.registered', function() {
  client.invoke('resize', { width: app_ancho, height: app_alto });
  ViewData();
});

/////////////////// LOGICA DEL NEGOCIO //////////////////////
/**
 * { Permite generar la información que se va a mostrar en el ticket }
 *
 * @class      ViewData (name)
 */
function ViewData() {


  //Obtenemos un valor de la Vista
  ArrayCampos = ['ticket.requester.id', 'ticket.form.id'];
  //getCampo(ArrayCampos);
  client.get(ArrayCampos).then(function(data) {

  
    client.request('/api/v2/users/'+data[ArrayCampos[0]]+'.json').then(function(data) {
      //console.log(data.user.user_fields.carnet);
      //console.log('jesus');
      dataSamplev2('', data.user.user_fields.carnet);
      //console.log(dataSample);

        // Configuracion de la API
        var api = 'tickets';
        var type = 'GET';   //'POST', 'PUT'
        var dataType = 'json';

        initialize();
    });
    
    //console.log(data[ArrayCampos[0]]);

    //requestWebService(api, type, dataType, data[ArrayCampos[0]]);
    //console.log('Jesús'); 
    //Request WebService
    //requester_data = WebService(data[ArrayCampos[0]]);
  });

  //  console.log(requester_data);
}

function answerWebService(json_data) {
  //console.dir(json_data);      
  showInfo(json_data);
}


function requestWebService(api, type, dataType, id){ 

  urlv2 = '/api/v2/'+ api +'/' + id + '.json';
  var settings = {
    url: urlv2,
    type: type,
    dataType: dataType,
  };

  //console.log(settings);

  client.request(settings).then(
    function(data) {
      //console.log('WebService');
      //console.log(data);
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

/**
 * Obtiene el valor de un campo
 *
 * @param      {var}  nombre  Variable
 */
/*
function getCampo(ArrayCampos){

  client.get(ArrayCampos).then(function(data) {
    //console.dir(data[ArrayCampos[0]]);

    // Configuracion de la API
    var api = 'tickets';
    var type = 'GET';   //'POST', 'PUT'
    var dataType = 'json';

    requester_data = requestWebService(api, type, dataType, data[ArrayCampos[0]]);
    //console.log('Jesús'); 
    //console.log(requester_data);   
    //Request WebService
    //requester_data = WebService(data[ArrayCampos[0]]);
   
  });
}
*/



/**
 * Muestra la información en la Vista del Ticket
 *
 * @param      {array}  requester_data  Data que se va a mostrar
 */
function showInfo(requester_data){
  var source = $("#requester-template").html();
  var template = Handlebars.compile(source);
  var html = template(requester_data);
  $("#content").html(html);    
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

function showModal(){
  client.invoke('instances.create', {
    location: 'modal',
    url: pagina
  }).then(function(modalContext) {
    // The modal is on the screen now!
    var modalClient = client.instance(modalContext['instances.create'][0].instanceGuid);
    modalClient.invoke('resize', { width: modal_ancho, height: modal_alto });
    modalClient.on('modal.close', function() {
      // The modal has been closed.
    });
  });

}

});

/**
 * 
 */

Handlebars.registerHelper('formatDate', function(options) {

  var cdate = new Date(options);
  var options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  };

  date = cdate.toLocaleDateString("es-ES", options);
  return date;
});


Handlebars.registerHelper('getBoolean', function(options) {

  if (options == true){
    nombre = "Sí"; 
  }else{
    nombre = "No"; 
  }
  return nombre;
});



function getFecha(){
  f = new Date();
  return f.getFullYear() +"-" + (f.getMonth() +1) + "-"+f.getDate();
}

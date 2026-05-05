   jQuery(function($) {
      $.mask.definitions['~']='[+-]';
      $('#data').mask('99/99/9999');

      $('#data2').mask('99/99/9999');
      $('#data3').mask('99/99/9999');
      $('#data4').mask('99/99/9999');
      $('#data5').mask('99/99/9999');
      $('#data6').mask('99/99/9999');
      $('#data7').mask('99/99/9999');

      $('#cep').mask('99999-999');
      $('#cep2').mask('99999-999');
      $('#cep3').mask('99999-999');
      $('#cep4').mask('99999-999');

//      $('#cpf').mask('999.999.999-99');
//      $('#cpf2').mask('999.999.999-99');

//$('#cpf').mask('999.999.999-99').validacpf();
$('#cpf').mask('99999999999').validacpf();
$('#cpf2').mask('999.999.999-99').validacpf();

      $('#cnpj').mask('99.999.999/9999-99').validacnpj();
      $('#phone').mask('(99) 9999-9999');
      $('#celular').mask('(99) 9999-9999?9');
	  $('#whatsapp').mask('(99) 9999-9999?9');

//$("#celular").focus(function(){$(this).mask("(99) 9999-9999?9",{completed:function(){$(this).mask("(99) 99999-9999");}})});
$("#celular2").focus(function(){$(this).mask("(99) 9999-9999?9",{completed:function(){$(this).mask("(99) 99999-9999");}})});
$("#celular3").focus(function(){$(this).mask("(99) 9999-9999?9",{completed:function(){$(this).mask("(99) 99999-9999");}})});
$("#celular4").focus(function(){$(this).mask("(99) 9999-9999?9",{completed:function(){$(this).mask("(99) 99999-9999");}})});
$("#celular5").focus(function(){$(this).mask("(99) 9999-9999?9",{completed:function(){$(this).mask("(99) 99999-9999");}})});
      
      $('#phoneext').mask("(999) 999-9999? x99999");
      $("#tin").mask("99-9999999");
      $("#ssn").mask("999-99-9999");
      $("#product").mask("a*-999-a999",{placeholder:" ",completed:function(){alert("You typed the following: "+this.val());}});
      $("#eyescript").mask("~9.99 ~9.99 999");
   });
// currencyFormat
function currencyFormat(fld, milSep, decSep, e) {
  var sep = 0;
  var key = '';
  var i = j = 0;
  var len = len2 = 0;
  var strCheck = '0123456789';
  var aux = aux2 = '';
  var whichCode = (window.Event) ? e.which : e.keyCode;

  if (whichCode == 13) return true;  // Enter
  if (whichCode == 8) return true;  // Delete
  key = String.fromCharCode(whichCode);  // Get key value from key code
  if (strCheck.indexOf(key) == -1) return false;  // Not a valid key
  len = fld.value.length;
  for(i = 0; i < len; i++)
  if ((fld.value.charAt(i) != '0') && (fld.value.charAt(i) != decSep)) break;
  aux = '';
  for(; i < len; i++)
  if (strCheck.indexOf(fld.value.charAt(i))!=-1) aux += fld.value.charAt(i);
  aux += key;
  len = aux.length;
  if (len == 0) fld.value = '';
  if (len == 1) fld.value = '0'+ decSep + '0' + aux;
  if (len == 2) fld.value = '0'+ decSep + aux;
  if (len > 2) {
    aux2 = '';
    for (j = 0, i = len - 3; i >= 0; i--) {
      if (j == 3) {
        aux2 += milSep;
        j = 0;
      }
      aux2 += aux.charAt(i);
      j++;
    }
    fld.value = '';
    len2 = aux2.length;
    for (i = len2 - 1; i >= 0; i--)
    fld.value += aux2.charAt(i);
    fld.value += decSep + aux.substr(len - 2, len);
  }
  return false;
}



//cpf
jQuery.fn.validacpf = function(){    
    this.change(function(){
        CPF = $(this).val();
        if(!CPF){ return false;}
        erro     = new String;
        cpfv     = CPF;
        if(cpfv.length == 14 || cpfv.length == 11){
            cpfv = cpfv.replace('.', '');
            cpfv = cpfv.replace('.', '');
            cpfv = cpfv.replace('-', '');
    
            var nonNumbers = /\D/;
        
            if(nonNumbers.test(cpfv)){
                erro = "A verificacao de CPF suporta apenas números!";
            }else{
                if (cpfv == "00000000000" ||
                    cpfv == "11111111111" ||
                    cpfv == "22222222222" ||
                    cpfv == "33333333333" ||
                    cpfv == "44444444444" ||
                    cpfv == "55555555555" ||
                    cpfv == "66666666666" ||
                    cpfv == "77777777777" ||
                    cpfv == "88888888888" ||
                    cpfv == "99999999999") {
                                                        
                    erro = "Número de CPF inválido!"
                }
                var a = [];
                var b = new Number;
                var c = 11;
    
                for(i=0; i<11; i++){
                    a[i] = cpfv.charAt(i);
                    if (i < 9) b += (a[i] * --c);
                }
                if((x = b % 11) < 2){
                    a[9] = 0
                }else{
                    a[9] = 11-x
                }
                b = 0;
                c = 11;
                for (y=0; y<10; y++) b += (a[y] * c--);
        
                if((x = b % 11) < 2){
                    a[10] = 0;
                }else{
                    a[10] = 11-x;
                }
                if((cpfv.charAt(9) != a[9]) || (cpfv.charAt(10) != a[10])){
                    erro = "Número de CPF inválido.";
                }
            }
        }else{
            if(cpfv.length == 0){
                return false;
            }else{
                erro = "Número de CPF inválido.";
            }
        }
        if (erro.length > 0){
            $(this).val('');
            alert(erro);
            setTimeout(function(){$(this).focus();},100);
            return false;
        }
        return $(this);
    });
}


//cnpj
jQuery.fn.validacnpj = function(){
  this.change(function(){
    CNPJ = $(this).val();
    if(!CNPJ){ return false;}
    erro = new String;
    if(CNPJ == "00.000.000/0000-00"){ erro += "CNPJ inválido\n\n";}
    CNPJ = CNPJ.replace(".","");
    CNPJ = CNPJ.replace(".","");
    CNPJ = CNPJ.replace("-","");
    CNPJ = CNPJ.replace("/","");

    var a = [];
    var b = new Number;
    var c = [6,5,4,3,2,9,8,7,6,5,4,3,2];
    for(i=0; i<12; i++){
      a[i] = CNPJ.charAt(i);
      b += a[i] * c[i+1];
    }
    if((x = b % 11) < 2){
      a[12] = 0
    }else{
      a[12] = 11-x
    }
    b = 0;
    for(y=0; y<13; y++){
      b += (a[y] * c[y]);
    }
    if((x = b % 11) < 2){
      a[13] = 0;
    }else{
      a[13] = 11-x;
    }
    if((CNPJ.charAt(12) != a[12]) || (CNPJ.charAt(13) != a[13])){ erro +="CNPJ inválido, digite novamente!";}
    if (erro.length > 0){
      $(this).val('');
      alert(erro);
      setTimeout(function(){ $(this).focus()},50);        
    }
    return $(this);
  });
}
var navegador = navigator.userAgent.toLowerCase(); //Cria e atribui à variável global 'navegador' (em caracteres minúsculos) o nome e a versão do navegador

//Cria uma variável global chamada 'xmlhttp'
var xmlhttp; 



//Função que inicia o objeto XMLHttpRequest

function objetoXML() {

	if (navegador.indexOf('msie') != -1) { //Internet Explorer

		var controle = (navegador.indexOf('msie 5') != -1) ? 'Microsoft.XMLHTTP' : 'Msxml2.XMLHTTP'; //Operador ternário que adiciona o objeto padrão do seu navegador (caso for o IE) à variável 'controle'

		try {

			xmlhttp = new ActiveXObject(controle); //Inicia o objeto no IE

		} catch (e) { }

	} else { //Firefox, Safari, Mozilla

		xmlhttp = new XMLHttpRequest(); //Inicia o objeto no Firefox, Safari, Mozilla

	}

}

//Função que envia o formulário

function enviarForm(url, campos, destino) {

	//Atribui à variável 'elemento' o elemento que irá receber a página postada
	var elemento = document.getElementById(destino); 

	//Executa a função objetoXML()
	objetoXML(); 

	//Se o objeto de 'xmlhttp' não estiver true
	if (!xmlhttp) {

		//Insere no 'elemento' o texto atribuído
		elemento.innerHTML = 'Impossível iniciar o objeto XMLHttpRequest.'; 

		return;

	} else { 

		//Insere no 'elemento' o texto atribuído
		elemento.innerHTML = 'Carregando...'; 

	}

	xmlhttp.onreadystatechange = function () {

		//Se a requisição estiver completada
		if (xmlhttp.readyState == 4 || xmlhttp.readyState == 0) { 

			//Se o status da requisição estiver OK
			if (xmlhttp.status == 200) {

				//Insere no 'elemento' a página postada
				elemento.innerHTML = xmlhttp.responseText; 

			} else { 

				//Insere no 'elemento' o texto atribuído
				elemento.innerHMTL = 'Página não encontrada!'; 

			}

		}

	}

	//Abre a página que receberá os campos do formulário
	xmlhttp.open('POST', url+'?'+campos, true);

	//Envia o formulário com dados da variável 'campos' (passado por parâmetro)
	xmlhttp.send(campos); 

}

<?
include "config123.php";
//$link = @mysql_connect ($host, $user, $pass);
//$linkdatabase = @mysql_select_db ($database);
$link = mysqli_connect($host, $user, $pass, $database);// or die (mysqli_error($link));
mysqli_query($link,"SET NAMES 'UTF8'");
mysqli_query($link,'SET character_set_connection=UTF8');
mysqli_query($link,'SET character_set_client=UTF8');
mysqli_query($link,'SET character_set_results=UTF8');
@mysqli_query($link,"SET SESSION sql_mode=''");
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////


//mysqli_query($link,"

//");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `area123_admin` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `username` varchar(30) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `password` longtext COLLATE latin1_general_ci NOT NULL,
  `grupo` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `email` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `name` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `resposta` longtext COLLATE latin1_general_ci NOT NULL,
  `sexo` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `ultimo` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `deptos` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `notificar` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=1 ;
");


mysqli_query($link,"INSERT INTO `area123_admin` (`id`, `username`, `password`, `grupo`, `email`, `name`, `resposta`, `sexo`, `ultimo`, `deptos`, `notificar`) VALUES
(1, '', '0c7540eb7e65b553ec1ba6b20de79608', '1|1|1|1|||||', 'admin', 'Administrador', '', '1', '0000-00-00 00:00:00', '', '1');
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `area123_clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` int(8) unsigned zerofill NOT NULL DEFAULT '00000000',
  `email` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `senha` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `name` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `sexo` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `nascimento` date NOT NULL DEFAULT '0000-00-00',
  `cpf` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `empresa` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `cnpj` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `endereco` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cidade` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `estado` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cep` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `pais` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `fone1` varchar(25) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `fone2` varchar(25) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `msn` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `icq` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `skype` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `aim` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `email2` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `nome_tec` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  `email_tec` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  `email_cob` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  `nome_cob` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  `impostos` tinyint(3) DEFAULT NULL,
  `lingua` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `moeda` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `email_html` char(1) COLLATE latin1_general_ci DEFAULT NULL,
  `newsletter` char(1) COLLATE latin1_general_ci DEFAULT NULL,
  `obs` mediumtext COLLATE latin1_general_ci NOT NULL,
  `status` varchar(50) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cupom` varchar(50) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `termos` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `crm` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `crmobs` longtext COLLATE latin1_general_ci NOT NULL,
  `vip` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `conheceu` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  `nota` char(2) COLLATE latin1_general_ci DEFAULT NULL,
  `notaobs` longtext COLLATE latin1_general_ci,
  `ultimo` datetime DEFAULT NULL,
  `permissao` char(1) COLLATE latin1_general_ci DEFAULT NULL,
  `inicio` datetime DEFAULT '0000-00-00 00:00:00',
  `expiracao` datetime DEFAULT NULL,
  `tipo` varchar(2) COLLATE latin1_general_ci DEFAULT NULL,
  `prioridade` varchar(10) COLLATE latin1_general_ci DEFAULT '1',
  `oferta` int(3) DEFAULT NULL,
  `ip` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  `patrocinador` varchar(10) COLLATE latin1_general_ci NOT NULL,
  `indicador` varchar(10) COLLATE latin1_general_ci NOT NULL,
  `classe` varchar(10) COLLATE latin1_general_ci NOT NULL,
  `operadora2` varchar(30) COLLATE latin1_general_ci NOT NULL,
  `posicao` int(20) NOT NULL,
  `numerouser` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `free2` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `free1` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `free0` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `afiliado` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `afiliados123_status` varchar(1) COLLATE latin1_general_ci NOT NULL,
  `dinheiro123_status` varchar(1) COLLATE latin1_general_ci NOT NULL,
  `dinheiro123_vencimento` date NOT NULL,
  `area_image` longtext COLLATE latin1_general_ci NOT NULL,
  `bairro` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `endereconumero` varchar(10) COLLATE latin1_general_ci NOT NULL,
  `endereco2` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `endereconumero2` varchar(10) COLLATE latin1_general_ci NOT NULL,
  `bairro2` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `cidade2` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `estado2` varchar(10) COLLATE latin1_general_ci NOT NULL,
  `cep2` varchar(20) COLLATE latin1_general_ci NOT NULL,
  `pais2` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `rg` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `ie` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `juridica` char(1) COLLATE latin1_general_ci NOT NULL,
  `empresaid` varchar(10) COLLATE latin1_general_ci NOT NULL,
  `empregos_titulo` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `empregos_categoria` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `estadocivil` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `nacionalidade` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `escolaridade` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `empregos_validade` date NOT NULL,
  `empregos_resumo` longtext COLLATE latin1_general_ci NOT NULL,
  `area_image_extras` longtext COLLATE latin1_general_ci NOT NULL,
  `flags` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `numposts` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `grupolinear` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `acessos` bigint(20) NOT NULL,
  `acessosunicos` bigint(20) NOT NULL,
  `vezeslogou` bigint(20) NOT NULL,
  `referencia` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo01` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo02` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo03` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo04` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo05` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo06` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo07` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo08` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo09` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo10` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo11` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo12` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo13` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo14` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo15` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo16` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo17` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo18` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo19` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `campo20` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `codigo_interno` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `pontos` int(11) NOT NULL DEFAULT '0',
  `dominioproprio` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `dominioproprioup` char(1) COLLATE latin1_general_ci NOT NULL,
  `binariobalance` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `numero` (`numero`),
  UNIQUE KEY `email` (`email`),
  KEY `numero_2` (`numero`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=2 ;
");
mysqli_query($link,"INSERT INTO `area123_clientes` (`id`, `numero`, `email`, `senha`, `name`, `sexo`, `nascimento`, `cpf`, `empresa`, `cnpj`, `endereco`, `cidade`, `estado`, `cep`, `pais`, `fone1`, `fone2`, `msn`, `icq`, `skype`, `aim`, `email2`, `nome_tec`, `email_tec`, `email_cob`, `nome_cob`, `impostos`, `lingua`, `moeda`, `email_html`, `newsletter`, `obs`, `status`, `cupom`, `termos`, `crm`, `crmobs`, `vip`, `conheceu`, `nota`, `notaobs`, `ultimo`, `permissao`, `inicio`, `expiracao`, `tipo`, `prioridade`, `oferta`, `ip`, `patrocinador`, `indicador`, `classe`, `operadora2`, `posicao`, `numerouser`, `free2`, `free1`, `free0`, `afiliado`, `afiliados123_status`, `dinheiro123_status`, `dinheiro123_vencimento`, `area_image`, `bairro`, `endereconumero`, `endereco2`, `endereconumero2`, `bairro2`, `cidade2`, `estado2`, `cep2`, `pais2`, `rg`, `ie`, `juridica`, `empresaid`, `empregos_titulo`, `empregos_categoria`, `estadocivil`, `nacionalidade`, `escolaridade`, `empregos_validade`, `empregos_resumo`, `area_image_extras`, `flags`, `numposts`, `grupolinear`, `acessos`, `acessosunicos`, `vezeslogou`, `referencia`, `campo01`, `campo02`, `campo03`, `campo04`, `campo05`, `campo06`, `campo07`, `campo08`, `campo09`, `campo10`, `campo11`, `campo12`, `campo13`, `campo14`, `campo15`, `campo16`, `campo17`, `campo18`, `campo19`, `campo20`, `codigo_interno`, `pontos`, `dominioproprio`, `dominioproprioup`, `binariobalance`) VALUES
(1, 44563453, 'demo', 'demo', 'Coloque seu nome', '1', '0000-00-00', '', '', '', '', 'Belo Horizonte', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, 'pt-br', 'real', '', '', '', 's', 'cupom', 't', 'c', 'crmobs', 'v', 'conheceu', 'no', '', '2014-12-01 19:00:29', '2', '2014-01-28 22:38:49', '0000-00-00 00:00:00', '1', NULL, NULL, NULL, '', '', '', '', 77, 'associadonome', '', '', '', '', '', '1', '2015-01-01', '44563453_1394820930Axé Bahia 2003 - Essa é a Nova Moda.mp3|44563453_1384806436MR1.zip|44563453_1384806338carandai_agrishow.jpg', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Sou um grande profissional em Marketing', '', '', '', '', '2012-08-25', 'Estou a procura de um emprego onde eu possa colocar em prática os conhecimentos adquiridos na faculdade.', '', '', '0', '5', 14, 1, 685, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ásdfadsf''sdef', 0, '', '', 'd');
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `area123_clientes_layout` (
  `id_c_l` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_numero` varchar(20) COLLATE latin1_general_ci NOT NULL,
  `titulo` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `palavras_chave` longtext COLLATE latin1_general_ci NOT NULL,
  `descricao` longtext COLLATE latin1_general_ci NOT NULL,
  `html` varchar(1) COLLATE latin1_general_ci NOT NULL,
  `topo_html` longtext COLLATE latin1_general_ci NOT NULL,
  `rodape_html` longtext COLLATE latin1_general_ci NOT NULL,
  `empresa_html` longtext COLLATE latin1_general_ci NOT NULL,
  `contato_html` longtext COLLATE latin1_general_ci NOT NULL,
  `background` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `topo_linha1` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `sobre_empresa` longtext COLLATE latin1_general_ci NOT NULL,
  `contato` longtext COLLATE latin1_general_ci NOT NULL,
  `logotipo` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `minilogotipo` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `topo_fundo` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `rodape_linha1` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `rodape_linha2` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `botao_d` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `botao_e` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `localizacao` longtext COLLATE latin1_general_ci NOT NULL,
  `inicial_html` longtext COLLATE latin1_general_ci NOT NULL,
  `duvidas` longtext COLLATE latin1_general_ci NOT NULL,
  `termos` longtext COLLATE latin1_general_ci NOT NULL,
  `privacidade` longtext COLLATE latin1_general_ci NOT NULL,
  `css` longtext COLLATE latin1_general_ci NOT NULL,
  `logo_html` longtext COLLATE latin1_general_ci NOT NULL,
  `facebook` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `twitter` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `dominioproprio` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `domup` tinyint(1) NOT NULL DEFAULT '0',
  `tema_css` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `bg_color` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `sacemail` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `pgtoanonimo` char(1) COLLATE latin1_general_ci NOT NULL,
  UNIQUE KEY `id_c_l` (`id_c_l`),
  UNIQUE KEY `cliente_numero` (`cliente_numero`),
  KEY `cliente_numero_27` (`cliente_numero`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=1 ;
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `area123_config` (
  `id` int(11) NOT NULL DEFAULT '0',
  `keycode` longtext COLLATE latin1_general_ci NOT NULL,
  `fullpath` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `titulo` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `descricao` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `palavraschave` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `base` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `email` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `fone` varchar(50) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `endereco` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `contador` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `tema` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `bugs` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `sugestao` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `termosdeuso` longtext COLLATE latin1_general_ci NOT NULL,
  `sobrenos` longtext COLLATE latin1_general_ci NOT NULL,
  `confirma_cadastro` varchar(1) COLLATE latin1_general_ci NOT NULL,
  `useronline` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `v` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `sitepasta` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '/',
  `mesmouser` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `versao` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `modo` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `sistema_c` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `nomecurto_c` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `sitedofabricante_c` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `manual_c` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `suporte_c` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `copyright_c` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `rodape_c` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `twitter` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `facebook` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `mesmocpf` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `theme` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `google` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `instagram` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `linkedin` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `youtube` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `skype` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `pinterest` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `dribbble` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `stumbleupon` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `delicious` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `vimeo` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `digg` varchar(250) COLLATE latin1_general_ci NOT NULL,
  UNIQUE KEY `id_2` (`id`),
  KEY `id` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"INSERT INTO `area123_config` (`id`, `keycode`, `fullpath`, `titulo`, `descricao`, `palavraschave`, `base`, `email`, `fone`, `endereco`, `contador`, `tema`, `bugs`, `sugestao`, `termosdeuso`, `sobrenos`, `confirma_cadastro`, `useronline`, `v`, `sitepasta`, `mesmouser`, `versao`, `modo`, `sistema_c`, `nomecurto_c`, `sitedofabricante_c`, `manual_c`, `suporte_c`, `copyright_c`, `rodape_c`, `twitter`, `facebook`, `mesmocpf`, `theme`, `google`, `instagram`, `linkedin`, `youtube`, `skype`, `pinterest`, `dribbble`, `stumbleupon`, `delicious`, `vimeo`, `digg`) VALUES
(1, 'V1d0ak5XRnNiRmhsUnpscFRUQTBkdz09', '', '', 'coloque a descricao aqui', 'coloque palavras chave aqui', '', 'email@decontato123.com', '(33) 3333-3333', 'Empresa123 LTDAR\r\nJardim America,\r\n16400-000 Belo Horizonte - MG', '', 'modelo', '1', '1', '', '', '0', '', '1', '', '1', '5.0', '0', '', '', '', '', '', '', '', 'twitter', 'facebook', '1', 'cerulean', 'google', 'instagram', 'linkedin', 'youtube', 'skype', '', '', '', '', '', '');
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `area123_lang` (
  `lang` varchar(5) COLLATE latin1_general_ci NOT NULL,
  `lingua` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `pais` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `charset` varchar(20) COLLATE latin1_general_ci NOT NULL,
  `moeda` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `moedasimbolo` varchar(10) COLLATE latin1_general_ci NOT NULL,
  `cotacao` varchar(20) COLLATE latin1_general_ci NOT NULL,
  `status` char(1) COLLATE latin1_general_ci NOT NULL,
  UNIQUE KEY `lang` (`lang`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");


mysqli_query($link,"INSERT INTO `area123_lang` (`lang`, `lingua`, `pais`, `charset`, `moeda`, `moedasimbolo`, `cotacao`, `status`) VALUES
('af', 'Africâno', '', '', '', '', '', ''),
('ar-ae', 'Árabe (U.A.E.)', '', '', '', '', '', ''),
('ar-bh', 'Árabe (Bahrain)', '', '', '', '', '', ''),
('ar-dz', 'Árabe (Argélia)', '', '', '', '', '', ''),
('ar-eg', 'Árabe (Egito)', '', '', '', '', '', ''),
('ar-iq', 'Árabe (Iraque)', '', '', '', '', '', ''),
('ar-jo', 'Árabe (Jordânia)', '', '', '', '', '', ''),
('ar-kw', 'Árabe (Kuwait)', '', '', '', '', '', ''),
('ar-lb', 'Árabe (Líbano)', '', '', '', '', '', ''),
('ar-ly', 'Árabe (Líbia)', '', '', '', '', '', ''),
('ar-ma', 'Árabe (Marrocos)', '', '', '', '', '', ''),
('ar-om', 'Árabe (Omã)', '', '', '', '', '', ''),
('ar-qa', 'Árabe (Catar)', '', '', '', '', '', ''),
('ar-sa', 'Árabe (Arábia Saudita)', '', '', '', '', '', ''),
('ar-sy', 'Árabe (Síria)', '', '', '', '', '', ''),
('ar-tn', 'Árabe (Tunísia)', '', '', '', '', '', ''),
('ar-ye', 'Árabe (Iêmen)', '', '', '', '', '', ''),
('be', 'Bielo-russo', '', '', '', '', '', ''),
('bg', 'Búlgaro', '', '', '', '', '', ''),
('ca', 'Catalão', '', '', '', '', '', ''),
('cs', 'Tcheco', '', '', '', '', '', ''),
('da', 'Dinamarquês', '', '', '', '', '', ''),
('de', 'Alemão (Standard)', '', '', '', '', '', ''),
('de-at', 'Alemão (Áustria)', '', '', '', '', '', ''),
('de-ch', 'Alemão (Suíça)', '', '', '', '', '', ''),
('de-li', 'Alemão (Liechtenstein)', '', '', '', '', '', ''),
('de-lu', 'Alemão (Luxemburgo)', '', '', '', '', '', ''),
('el', 'Grego', '', '', '', '', '', ''),
('en-au', 'Inglês (Austrália)', '', '', '', '', '', ''),
('en-bz', 'Inglês (Belize)', '', '', '', '', '', ''),
('en-ca', 'Inglês (Canadá)', '', '', '', '', '', ''),
('en-gb', 'Inglês (Reino Unido)', '', '', '', '', '', ''),
('en-ie', 'Inglês (Irlanda)', '', '', '', '', '', ''),
('en-jm', 'Inglês (Jamaica)', '', '', '', '', '', ''),
('en-nz', 'Inglês (Nova Zelândia)', '', '', '', '', '', ''),
('en-tt', 'Inglês (Trinidad)', '', '', '', '', '', ''),
('en-us', 'Inglês (Estados Unidos)', '', '', 'Dollar', 'US$', '', '1'),
('en-za', 'Inglês (África do Sul)', '', '', '', '', '', ''),
('es', 'Espanhol (Espanha)', '', '', 'Euro', '£', '', '1'),
('es-ar', 'Espanhol (Argentina)', '', '', '', '', '', ''),
('es-bo', 'Espanhol (Bolívia)', '', '', '', '', '', ''),
('es-cl', 'Espanhol (Chile)', '', '', '', '', '', ''),
('es-co', 'Espanhol (Colômbia)', '', '', '', '', '', ''),
('es-cr', 'Espanhol (Costa Rica)', '', '', '', '', '', ''),
('es-do', 'Espanhol (República Dominicana)', '', '', '', '', '', ''),
('es-ec', 'Espanhol (Equador)', '', '', '', '', '', ''),
('es-gt', 'Espanhol (Guatemala)', '', '', '', '', '', ''),
('es-hn', 'Espanhol (Honduras)', '', '', '', '', '', ''),
('es-mx', 'Espanhol (México)', '', '', '', '', '', ''),
('es-ni', 'Espanhol (Nicarágua)', '', '', '', '', '', ''),
('es-pa', 'Espanhol (Panamá)', '', '', '', '', '', ''),
('es-pe', 'Espanhol (Peru)', '', '', '', '', '', ''),
('es-pr', 'Espanhol (Porto Rico)', '', '', '', '', '', ''),
('es-py', 'Espanhol (Paraguai)', '', '', '', '', '', ''),
('es-sv', 'Espanhol (El Salvador)', '', '', '', '', '', ''),
('es-uy', 'Espanhol (Uruguai)', '', '', '', '', '', ''),
('es-ve', 'Espanhol (Venezuela)', '', '', '', '', '', ''),
('et', 'Estoniano', '', '', '', '', '', ''),
('eu', 'Basco', '', '', '', '', '', ''),
('fa', 'Farsi', '', '', '', '', '', ''),
('fi', 'Finlandês', '', '', '', '', '', ''),
('fo', 'Faroês', '', '', '', '', '', ''),
('fr', 'Francês (França)', '', '', '', '', '', ''),
('fr-be', 'Francês (Bélgica)', '', '', '', '', '', ''),
('fr-ca', 'Francês (Canadá)', '', '', '', '', '', ''),
('fr-ch', 'Francês (Suíça)', '', '', '', '', '', ''),
('fr-lu', 'Francês (Luxemburgo)', '', '', '', '', '', ''),
('ga', 'Irlandês', '', '', '', '', '', ''),
('gd', 'Gaélico (Escócia)', '', '', '', '', '', ''),
('he', 'Hebraico', '', '', '', '', '', ''),
('hi', 'Hindi', '', '', '', '', '', ''),
('hr', 'Croata', '', '', '', '', '', ''),
('hu', 'Húngaro', '', '', '', '', '', ''),
('id', 'Indonésio', '', '', '', '', '', ''),
('is', 'Islandês', '', '', '', '', '', ''),
('it', 'Italiano (Standard)', '', '', '', '', '', ''),
('it-ch', 'Italiano (Suíça)', '', '', '', '', '', ''),
('ja', 'Japonês', '', '', '', '', '', ''),
('ji', 'Iídiche', '', '', '', '', '', ''),
('ko', 'Coreano', '', '', '', '', '', ''),
('lt', 'Lituano', '', '', '', '', '', ''),
('lv', 'Letão', '', '', '', '', '', ''),
('mk', 'Macedônio (FYROM)', '', '', '', '', '', ''),
('ms', 'Malaio', '', '', '', '', '', ''),
('mt', 'Maltês', '', '', '', '', '', ''),
('nl', 'Dutch (Standard)', '', '', '', '', '', ''),
('nl-be', 'Holandês (Bélgica)', '', '', '', '', '', ''),
('no', 'Norueguês (Nynorsk)', '', '', '', '', '', ''),
('pl', 'Polonês', '', '', '', '', '', ''),
('pt', 'Português (Portugal)', '', '', 'Euro', '£', '', ''),
('pt-br', 'Português (Brasil)', '', '', 'Real', 'R$', '', '1'),
('rm', 'Reto-românico', '', '', '', '', '', ''),
('ro', 'Romeno', '', '', '', '', '', ''),
('ro-mo', 'Romeno (República da Moldávia)', '', '', '', '', '', ''),
('ru', 'Russo', '', '', '', '', '', ''),
('ru-mo', 'Russo (República da MoldÁvia)', '', '', '', '', '', ''),
('sb', 'Sorbian', '', '', '', '', '', ''),
('sk', 'Eslovaco', '', '', '', '', '', ''),
('sl', 'Esloveno', '', '', '', '', '', ''),
('sq', 'Albanês', '', '', '', '', '', ''),
('sr', 'Sérvio (latino)', '', '', '', '', '', ''),
('sv', 'Sueco', '', '', '', '', '', ''),
('sv-fi', 'Sueco (Finlândia)', '', '', '', '', '', ''),
('sx', 'Sutu', '', '', '', '', '', ''),
('sz', 'Sami (lapão)', '', '', '', '', '', ''),
('th', 'Tailandês', '', '', '', '', '', ''),
('tn', 'Tswana', '', '', '', '', '', ''),
('tr', 'Turco', '', '', '', '', '', ''),
('ts', 'Tsonga', '', '', '', '', '', ''),
('uk', 'Ucraniano', '', '', '', '', '', ''),
('ur', 'Urdu', '', '', '', '', '', ''),
('ve', 'Venda', '', '', '', '', '', ''),
('vi', 'Vietnamita', '', '', '', '', '', ''),
('xh', 'Xosa', '', '', '', '', '', ''),
('zh-cn', 'Chinês (RPC)', '', '', '', '', '', ''),
('zh-hk', 'Chinês (Hong Kong SAR)', '', '', '', '', '', ''),
('zh-sg', 'Chinês (Cingapura)', '', '', '', '', '', ''),
('zh-tw', 'Chinês (Taiwan)', '', '', '', '', '', ''),
('zu', 'Zulu', '', '', '', '', '', '');
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `area123_layout` (
  `layout_sistema` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `lang` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT 'pt-br',
  `franquia` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `layout_id` int(11) NOT NULL AUTO_INCREMENT,
  `layout_nome` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `layout_descricao` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `layout_codigo` longtext COLLATE latin1_general_ci NOT NULL,
  `layout_layout` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `layout_arquivo` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  UNIQUE KEY `layout_id` (`layout_id`),
  KEY `lang` (`lang`)
  ) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=1154 ;
");


mysqli_query($link,"INSERT INTO `area123_layout` (`layout_sistema`, `lang`, `franquia`, `layout_id`, `layout_nome`, `layout_descricao`, `layout_codigo`, `layout_layout`, `layout_arquivo`) VALUES
('', 'pt-br', '0', 68, 'Clientes: Pagamentos - dados adicionais', 'Este código será inserido na final da página de pagamentos, ele é opcional, use caso queira adicionar alguma instrução extra.', 'Selecione uma das formas de pagamentos e ap&oacute;s efetuar o pagamento voc&ecirc; pode enviar a confirma&ccedil;&atilde;o clicando <a href=''clientes/pagamentos123_confirmar.php''>AQUI</a>.', 'pagamentos', ''),
('', 'pt-br', '0', 408, 'Aberto: Formulário de cadastro - OBS', 'Dados para serem adicionados no formulário de cadastro', '', 'cadastrarobs', ''),
('', 'pt-br', '0', 898, 'Aberto: Abertura (Opcional)', 'Se você colocar conteúdo aqui será exibido uma mensagem de entrada ao site, ideal para sites adultos.', '', 'abertura', ''),
('', 'pt-br', '0', 24, 'Aberto: Dúvidas', 'FAQ de uso do site', '<ol class=''breadcrumb''>\r\n  <li><a href=''./''><span class=''glyphicon glyphicon-home''></span></a></li>\r\n  <li class=''active''>Dúvidas frequentes</li>\r\n</ol>\r\n\r\n\r\n\r\n<div class=''col-xs-12 col-sm-6 col-lg-6''>\r\n<img src=''images123/duvidas.jpg'' width=''100%''  class=''img-thumbnail''>\r\n</div>\r\n\r\n<div class=''col-xs-12 col-sm-6 col-lg-6''>\r\n\r\n\r\n\r\n\r\n<div class=''alert alert-success'' role=''alert''>\r\nAbaixo tem as principais d&uacute;vidas questionadas pelos clientes. Caso ainda fique alguma d&uacute;vida utilize a op&ccedil;&atilde;o contato acima que iremos lhe esclarecer o mais rápido poss&iacute;vel.\r\n</div>\r\n\r\n<div class=''panel panel-info''>\r\n                <div class=''panel-heading''>\r\n                  <h3 class=''panel-title''>Este sistema funciona em qualquer dispositivo ?</h3>\r\n                </div>\r\n                <div class=''panel-body''>\r\n<p class=''text-justify''>\r\nSim, ele foi desenvolvido com o que há em mais novo de layout de sites, sendo responsivo para qualquer dispositivo como Desktop, Notebook, iPag, iPhone, Smartphone, SmartTV etc.\r\n</p>\r\n                </div>\r\n</div>\r\n\r\n<div class=''panel panel-info''>\r\n                <div class=''panel-heading''>\r\n                  <h3 class=''panel-title''>A administração é toda online ?</h3>\r\n                </div>\r\n                <div class=''panel-body''>\r\n<p class=''text-justify''>\r\nSim, você pode administrar de qualquer lugar a qualquer hora totalmente online.\r\n</p>\r\n                </div>\r\n</div>\r\n\r\n<div class=''panel panel-info''>\r\n                <div class=''panel-heading''>\r\n                  <h3 class=''panel-title''>Como administrador posso personalizar o layout?</h3>\r\n                </div>\r\n                <div class=''panel-body''>\r\n<p class=''text-justify''>\r\nSim, o layout é todo editável, você pode adicionar texto, estilos, imagens cores, formatos etc.\r\n</p>\r\n                </div>\r\n</div>\r\n\r\n\r\n<div class=''panel panel-info''>\r\n                <div class=''panel-heading''>\r\n                  <h3 class=''panel-title''>Este sistema possui formas de pagamentos automatizadas ?</h3>\r\n                </div>\r\n                <div class=''panel-body''>\r\n<p class=''text-justify''>\r\nSim, este sistema possui inúmeras formas de pagamentos, a maioria automatizada.\r\n</p>\r\n                </div>\r\n\r\n</div>\r\n\r\n\r\n\r\n\r\n</div>', 'faq', ''),
('', 'pt-br', '0', 244, 'Aberto: Formulário de contato', 'Formulário de contato do site, você poderá editar e adicionar dados mas não pode alterar o nome dos campos.', '<ol class=''breadcrumb''>\r\n  <li><a href=''./''><span class=''glyphicon glyphicon-home''></span></a></li>\r\n  <li class=''active''>Fomulário de contato</li>\r\n</ol>\r\n\r\n<div class=''container-fluid''>\r\n\r\n<div class=''col-xs-12 col-sm-6 col-lg-4''>\r\n<br>\r\nUtilize o formulário ao lado e nos envie sua dúvida.<br>\r\nIremos responder o mais rápido possível.\r\n\r\n\r\n<br><br><br>\r\n<address>\r\n  <strong><span class=''glyphicon glyphicon-envelope''></span> Nome, Ltda.</strong><br>\r\n  <abbr title=''Avenida''></abbr>Av Augustina, Sala 600<br>\r\n  Belo Horizonte, MG CEP: 44333-787<br>\r\n</address>\r\n<br>\r\n<address>\r\n  <strong><span class=''glyphicon glyphicon-headphones''></span> Nome, Ltda.</strong><br>\r\n  Fone: (000) 0000-0000<br>\r\n  Fone: (000) 0000-1111\r\n</address>\r\n<br>\r\n<address>\r\n  <strong><span class=''glyphicon glyphicon-play-circle''></span> Nome completo</strong><br>\r\n  <a href=''mailto:none@nonennnn.com.br''>email@emailtestexzy.com</a>\r\n</address>\r\n\r\n</div>\r\n\r\n<div class=''col-xs-12 col-sm-6 col-lg-8''>\r\n<form method=post name=je>\r\n\r\n<div class=''input-group input-group-lg''>\r\n  <span class=''input-group-addon'' style=''min-width: 150px !important;''>Nome</span></span>\r\n  <input  name=''u_name'' type=''text'' class=''form-control'' placeholder=''''>\r\n</div>\r\n<br>\r\n<div class=''input-group input-group-lg''>\r\n  <span class=''input-group-addon'' style=''min-width: 150px !important;''>E-mail</span></span>\r\n  <input  name=''u_email'' type=''text'' class=''form-control'' placeholder=''''>\r\n</div>\r\n<br>\r\n<div class=''input-group input-group-lg''>\r\n  <span class=''input-group-addon'' style=''min-width: 150px !important;''>Assunto</span></span>\r\n  <input  name=''subject'' type=''text'' class=''form-control'' placeholder=''''>\r\n</div>\r\n<br>\r\n<div class=''input-group''>\r\n<span class=''input-group-addon'' style=''min-width: 150px !important;''>Mensagem</span></span>\r\n    <textarea  name=''message'' class=''form-control custom-control'' rows=''6'' style=''resize:none''></textarea>     \r\n</div>\r\n\r\n<br><center>\r\n<button type=''submit'' name=s1 id=''submit'' class=''btn btn-default btn-lg''>\r\nEnviar mensagem\r\n</button>\r\n</center>\r\n\r\n</form>\r\n</div>\r\n\r\n</div><!---fim do container ---->\r\n<br>', 'contato', ''),
('', 'pt-br', '0', 32, 'Aberto: Quem somos ?', 'Descrição da empresa', '<ol class=''breadcrumb''>\r\n  <li><a href=''./''><span class=''glyphicon glyphicon-home''></span></a></li>\r\n  <li class=''active''>Quem somos ?</li>\r\n</ol>\r\n\r\n<div class=''container-fluid''>\r\n   <div class=''col-xs-12 col-sm-4 col-lg-4''>\r\n\r\n<div class=''panel panel-primary''>\r\n  <div class=''panel-heading''><span class=''glyphicon glyphicon-pushpin''></span>&nbsp;&nbsp;&nbsp;&nbsp;Empresa brasileira</div>\r\n<div class=''panel-body''>\r\n<p class=''text-center''>Somos uma empresa brasileira que visa trazer oportunidades aos brasileiros de trabalhar atrav&eacute;s da internet de forma honesta e ter com isso um grande sucesso profissional.</p>\r\n</div>\r\n</div>\r\n\r\n\r\n</div>\r\n<div class=''col-xs-12 col-sm-4 col-lg-4''>\r\n\r\n\r\n<div class=''panel panel-primary''>\r\n  <div class=''panel-heading''><span class=''glyphicon glyphicon-pushpin''></span>&nbsp;&nbsp;&nbsp;&nbsp;Nossa equipe</div>\r\n<div class=''panel-body''>\r\n<p class=''text-center''>Nossa equipe &eacute; composta por profissionais da área de engenheira, administra&ccedil;&atilde;o e webdesigners especialistas em publicidade e propaganda.<br><br></p>\r\n</div>\r\n</div>\r\n\r\n\r\n</div>\r\n<div class=''col-xs-12 col-sm-4 col-lg-4''>\r\n\r\n\r\n<div class=''panel panel-primary''>\r\n  <div class=''panel-heading''><span class=''glyphicon glyphicon-pushpin''></span>&nbsp;&nbsp;&nbsp;&nbsp;Nossa visão</div>\r\n<div class=''panel-body''>\r\n<p class=''text-center''>Estamos antenado nas grande mudanças ocorridas nos últimos tempos, sempre buscando inovação para o futuro sem perder o ensinamentos do passado.<br><br></p>\r\n</div>\r\n</div>\r\n\r\n</div>\r\n\r\n<br>\r\n<br>\r\n<br>\r\n\r\n</div>', 'quem_somos', '');
");


mysqli_query($link,"INSERT INTO `area123_layout` (`layout_sistema`, `lang`, `franquia`, `layout_id`, `layout_nome`, `layout_descricao`, `layout_codigo`, `layout_layout`, `layout_arquivo`) VALUES 
('', 'pt-br', '0', 136, 'Geral: Folha de estilo', 'Folha de estilo que define as cores das fontes, fundos etc', '/*****************nav topo**********************/\r\n.topo {\r\n\r\n}\r\n\r\n.logo img{\r\nwidth: 100%;\r\nmargin: 5px;\r\n}\r\n.logo-lado {\r\nfont-size: 1em;\r\ntext-transform: uppercase;\r\ncolor: #FFF;\r\npadding-top: 15px;\r\npadding-bottom: 15px;\r\nmin-height: 60px;\r\ntext-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;\r\n\r\n}\r\n\r\n.logo-nav-topo img {\r\nmax-height: 50px;\r\n}\r\n\r\n#sticky_navigation { \r\nwidth: 100%;\r\nz-index: 99999999;\r\n}\r\n\r\n/*****************nav topo**********************/\r\n\r\n\r\n.footer {\r\nmargin-bottom: 0px;\r\n}\r\n\r\n\r\n.carousel-caption-adicional:h2 {\r\n\r\n\r\ntext-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;\r\n\r\ndisplay: inline-block;\r\ncolor: #fff;\r\npadding: 0.5em 2em;\r\nbackground: rgba(255, 255, 255, 0.32);\r\ntext-decoration: none;\r\n\r\n}\r\n\r\n.rodape-menu {\r\nmargin-bottom: 0px;\r\nborder: 0px;\r\n}\r\n.rodape-menu a\r\n{    text-shadow:\r\n    -1px -1px 0 #000,\r\n    1px -1px 0 #000,\r\n    -1px 1px 0 #000,\r\n    1px 1px 0 #000; \r\n}\r\n\r\n.jumbotron {\r\nmargin-bottom: 0px;\r\n}\r\n\r\n\r\n\r\n.departamentos span\r\n{\r\nfont-size: 8em;\r\n}\r\n\r\n.atalhos span\r\n{\r\nfont-size: 4em;\r\n}\r\n\r\n\r\n.atalhos\r\n{\r\npadding: 5px;\r\n}\r\n\r\n\r\n.atalhos-container {\r\npadding-bottom: 15px;\r\n}\r\n\r\n.atalhos-largura {\r\nwidth: 100%;\r\n}\r\n\r\n\r\n\r\n.atalhos-ul {\r\nfloat: none;\r\n}\r\n\r\n\r\n/*-----------------ATALHOS----------------------*/\r\n\r\n.painel-li {\r\npadding: 7px;\r\n}\r\n\r\n\r\n.loja-carrinho\r\n{\r\nfont-size: 18px;\r\n}\r\n.loja-carrinho span\r\n{\r\nfont-size: 50px;\r\n}\r\n\r\n/* para ficar do tamanho do 310 px*/\r\n.slide-img\r\n{\r\n max-height: 600px; \r\n/* min-height: 300px; */\r\n}\r\n\r\n.loja-banner-img\r\n{\r\nmargin-left: 5%; \r\nmargin-top: 5px; \r\nmargin-bottom: 5px; \r\nmax-height: 300px; \r\nmin-height: 300px;\r\n}\r\n\r\n\r\n.rodape-inicio {\r\n/* background: #4cb1ca; */\r\nmargin-left: 0;\r\nfont-size: 1.7em;\r\ntext-transform: uppercase;\r\ncolor: #FFF;\r\npadding-top: 15px;\r\npadding-bottom: 15px;\r\nmin-height:  60px;;\r\n\r\n    text-shadow:\r\n    -1px -1px 0 #000,\r\n    1px -1px 0 #000,\r\n    -1px 1px 0 #000,\r\n    1px 1px 0 #000;\r\n\r\n}\r\n\r\n@media all and (max-width:800px){\r\n\r\n.rodape-inicio {\r\nfont-size: 1.1em;\r\n}\r\n\r\n}\r\n\r\n/*****************itens resultados***********************/\r\n.glyphicon { margin-right:5px; }\r\n.thumbnail\r\n{\r\n    margin-bottom: 20px;\r\n    padding: 0px;\r\n    -webkit-border-radius: 0px;\r\n    -moz-border-radius: 0px;\r\n    border-radius: 0px;\r\n}\r\n\r\n.itemres.list-group-item\r\n{\r\n    float: none;\r\n    width: 100%;\r\n    background-color: #fff;\r\n    margin-bottom: 10px;\r\n\r\npadding: 0px;\r\nborder: 0px;\r\n}\r\n\r\n.itemres:hover\r\n{\r\n	opacity:0.9;\r\n	cursor: pointer;\r\n}\r\n\r\n.itemres.list-group-item:nth-of-type(odd):hover,.item.list-group-itemres:hover\r\n{\r\n	border-color: #428bca;\r\n/*    background: #428bca; */\r\n}\r\n\r\n.itemres.list-group-item .list-group-image\r\n{\r\nmax-width: 450px;\r\nmax-height: 250px;\r\n\r\n    margin-right: 10px;\r\n}\r\n.itemres.list-group-item .thumbnail\r\n{\r\n    margin-bottom: 0px;\r\n}\r\n.itemres.list-group-item .caption\r\n{\r\n    padding: 9px 9px 0px 9px; \r\n}\r\n.itemres.list-group-item:nth-of-type(odd)\r\n{\r\n/*    background: #eeeeee; */\r\n}\r\n\r\n.itemres.list-group-item:before, .itemres.list-group-item:after\r\n{\r\n    display: table;\r\n    content: '' '';\r\n}\r\n\r\n.itemres.list-group-item img\r\n{\r\n    float: left;\r\n}\r\n.itemres.list-group-item:after\r\n{\r\n    clear: both;\r\n}\r\n.list-group-item-text\r\n{\r\n    margin: 0 0 11px;\r\n}\r\n/*****************itens resultados fim***********************/\r\n\r\n\r\n/*--------- loja produtos ----------*/\r\n.produtoscaixa {\r\ndisplay: block; \r\nfloat: center;\r\nmargin: 5% 0 1% 2.6%;\r\nbox-shadow: 0 0 5px #aaa;\r\n-webkit-box-shadow: 0 0 5px #aaa;\r\n-moz-box-shadow: 0 0 5px #aaa;\r\n-o-box-shadow: 0 0 5px #aaa;\r\ntext-align: center;\r\nwidth: 290px ;\r\nfont-weight: bold;\r\n}\r\n\r\n.produtoscaixa:hover{\r\n	background:#4CB1CA;\r\n	-webkit-transition: all 0.4s ease;\r\n	-moz-transition: all 0.4s ease;\r\n	-o-transition: all 0.4s ease;\r\n	transition: all 0.4s ease;\r\n	color:#fff;\r\n}\r\n\r\n.produtoscaixa:hover p.title{\r\n	color: #FFF;\r\n        text-decoration: none;\r\n}\r\n.produtoscaixa:hover span.actual{\r\n	color: #FFF;\r\n}\r\n\r\n.produtoscaixa:hover span.reducedfrom {\r\n	color: #FFF;\r\n}\r\n\r\n/* .produtoscaixa:first-child { margin-left: 0; } */\r\n\r\nh2.head{\r\n	font-size: 1.7em;\r\n	text-transform: uppercase;\r\n	color: #777;\r\n	margin-bottom: 10px;\r\n}\r\n.price{\r\n	padding:10px 0 0 0;\r\n}\r\n.inner_content {\r\n	padding:10px;\r\n	position: relative;\r\n	height: 381px;\r\n}\r\n\r\n.product_image {\r\n	\r\n}\r\n.product_image img{\r\n	display:block;\r\n	border:1px solid #f0f0f0;\r\n  height: 270px;\r\n  width: 270px;\r\n}\r\n\r\n\r\n.sale-box {\r\n	height: 100px;\r\n	right: -5px;\r\n	overflow: hidden;\r\n	position: absolute;\r\n	text-align: center;\r\n	top: -5px;\r\n	width: 100px;\r\n}\r\n.sale-box span.before {\r\n	right: 89px;\r\n	background: #CB3D27;\r\n}\r\n.sale-box span.on_sale {\r\n	background:#4cb1ca;\r\n	color: #FFF;\r\n	display: block;\r\n	left: -9px;\r\n	font-size:1em;\r\n	padding: 5px 0;\r\n	position: relative;\r\n	text-align: center;\r\n	top: 25px;\r\n	-webkit-transform: rotate(45deg);\r\n	-moz-transform: rotate(45deg);\r\n	-ms-transform: rotate(45deg);\r\n	-o-transform: rotate(45deg);\r\n	transform: rotate(45deg);\r\n	width: 140px;\r\n	z-index: 2;\r\n	text-transform:uppercase;\r\n	border-bottom: 2px solid #2892AC;\r\n}\r\n.cart-left{\r\n	width: 80%;\r\n	float: left;\r\n	margin-right: 2.6%;\r\n}\r\np.title{\r\n	color: #777;\r\n	font-size:1em;\r\n}\r\np.title a:hover{\r\n	color:#7DB122;\r\n}\r\n.cart-right {\r\n	float: right;\r\nfont-size:3em;\r\n/*	background: url(images123/cart2.png)2px 0px #7db122;\r\n	border-radius: 100px;\r\n	-webkit-border-radius: 100px;\r\n	-moz-border-radius: 100px;\r\n	-o-border-radius: 100px;\r\n	width: 40px;\r\n	height: 40px;\r\n*/\r\n	text-align: center;\r\n	cursor:pointer;\r\n\r\n}\r\n.cart-right:hover\r\n{\r\ncolor: #fff;\r\n}\r\n.produtoscaixa:hover .cart-right {\r\n	float: right;\r\ncolor: #fff;\r\n/*	background: url(images123/cart3.png)2px 0px #000;\r\n	border-radius: 100px;\r\n	width: 40px;\r\n	height: 40px;\r\n*/\r\n	text-align: center;\r\n\r\n}\r\n\r\n.price1{\r\n	margin-top:-10px;\r\n}\r\nspan.actual{\r\n	color:#7db122;\r\n	font-size:1em;\r\n}\r\nspan.reducedfrom {\r\n	text-decoration: line-through;\r\n	margin-right: 8%;\r\n	color:#555;\r\n}\r\n\r\n\r\n\r\n\r\n.sale-box1 {\r\n	height: 100px;\r\n	left: 0px;\r\n	overflow: hidden;\r\n	position: absolute;\r\n	text-align: center;\r\n	top: 0px;\r\n	width: 100px;\r\n}\r\n.sale-box span.before {\r\n	right: 89px;\r\n	background: #CB3D27;\r\n}\r\n.sale-box1 span.on_sale {\r\n	background: #7DB122;\r\n	color: #FFF;\r\n	display: block;\r\n	left: -35px;\r\n	font-size: 1em;\r\n	padding: 5px 0;\r\n	position: relative;\r\n	text-align: center;\r\n	top: 23px;\r\n	-webkit-transform: rotate(-45deg);\r\n	-moz-transform: rotate(-45deg);\r\n	-ms-transform: rotate(-45deg);\r\n	-o-transform: rotate(-45deg);\r\n	transform: rotate(-45deg);\r\n	width: 140px;\r\n	z-index: 2;\r\n	text-transform:uppercase;\r\n	border-bottom: 2px solid #6B9C15;\r\n}\r\n\r\n\r\n.sale-box3 {\r\n	height: 100px;\r\n	left: 0px;\r\n	overflow: hidden;\r\n	position: absolute;\r\n	text-align: center;\r\n	top: 0px;\r\n	width: 100px;\r\n}\r\n\r\n.sale-box3 span.on_sale {\r\n	background: #ff0000;\r\n	color: #FFF;\r\n	display: block;\r\n	left: -35px;\r\n	font-size: 1em;\r\n	padding: 5px 0;\r\n	position: relative;\r\n	text-align: center;\r\n	top: 23px;\r\n	-webkit-transform: rotate(-45deg);\r\n	-moz-transform: rotate(-45deg);\r\n	-ms-transform: rotate(-45deg);\r\n	-o-transform: rotate(-45deg);\r\n	transform: rotate(-45deg);\r\n	width: 140px;\r\n	z-index: 2;\r\n	text-transform:uppercase;\r\n	border-bottom: 2px solid #bf0000;\r\n}\r\n\r\n.top-box{\r\n	margin-bottom:2%;\r\n}\r\n.top-box1{\r\n	margin-bottom:4%;\r\n}\r\n.left-banner{\r\n	background: url(images123/t-img1.jpg)no-repeat 0px 0px;\r\n	width:226px;\r\n	height:450px;\r\n}\r\n.top-border{\r\n	border-top:5px solid #4cb1ca;\r\n}\r\n.border{\r\n	box-shadow: 0 0 5px #AAA;\r\n	-webkit-box-shadow: 0 0 5px #AAA;\r\n	-moz-box-shadow: 0 0 5px #AAA;\r\n	-o-box-shadow: 0 0 5px #AAA;\r\n	padding: 15px;\r\n	margin-bottom: 25%;\r\n}\r\n.btn{\r\n	position: relative;\r\n	text-align:center;\r\n	z-index: 9999;\r\n}\r\n.btn a {\r\n	border: none;\r\n	color: #FFF;\r\n	cursor: pointer;\r\n	padding: 12px 20px;\r\n	display: inline-block;\r\n	font-size: 1em;\r\n	outline: none;\r\n	-webkit-transition: all 0.3s;\r\n	-moz-transition: all 0.3s;\r\n	transition: all 0.3s;\r\n	background: #4CB1CA;\r\n	position: absolute;\r\n	top:-90px;\r\n	left: 52px;\r\n}\r\n.btn a:hover{\r\n	background:#39a0b9;\r\n}\r\n\r\n\r\n\r\n.sidebar-bottom{\r\n	box-shadow: 0 0 5px #AAA;\r\n	-webkit-box-shadow: 0 0 5px #AAA;\r\n	-moz-box-shadow: 0 0 5px #AAA;\r\n	-o-box-shadow: 0 0 5px #AAA;\r\n	padding:30px 20px;\r\n\r\n	text-align:center;\r\n}\r\nh2.m_1{\r\n	font-size: 1.7em;\r\n	text-transform: uppercase;\r\n	color: #777;\r\n	/*margin-bottom:15px;*/\r\n}\r\np.m_text{\r\n	color:#888;\r\n	font-size:0.95em;\r\n	margin-bottom:20px;\r\n}\r\n\r\n/*---------loja produtos fim------------*/\r\n\r\n\r\n\r\n/* -------------------------------------------------- */\r\n/* ESTILO DAS FOTOS*/	\r\n	/*	ul.polaroids { width: 90%; margin: 0 0 18px -30px; } */\r\n    ul.polaroids { width: 100%; margin: 0 0 0 0; }\r\n		ul.polaroids li { display: inline; }\r\n		ul.polaroids a { background: #fff; display: inline; float: left; margin: 0 0 27px 30px; width: auto; padding: 10px 10px 15px; text-align: center; font-family: ''Marker Felt'', sans-serif; text-decoration: none; color: #333; font-size: 18px; -webkit-box-shadow: 0 3px 6px rgba(0,0,0,.25); -moz-box-shadow: 0 3px 6px rgba(0,0,0,.25); -webkit-transform: rotate(-2deg); -webkit-transition: -webkit-transform .15s linear; -moz-transform: rotate(-2deg); }\r\n		ul.polaroids img { display: block; width: 150px; margin-bottom: 12px; }\r\n@media only screen and (max-width: 480px) {\r\n		ul.polaroids img { display: block; width: 100%; margin-bottom: 12px; }\r\n}\r\n		\r\n		ul.polaroids a:after { content: attr(title); }\r\n		\r\n		ul.polaroids li:nth-child(even) a { -webkit-transform: rotate(2deg);  -moz-transform: rotate(2deg); }\r\n		ul.polaroids li:nth-child(3n) a { -webkit-transform: none; position: relative; top: -5px;  -moz-transform: none; }\r\n		ul.polaroids li:nth-child(5n) a { -webkit-transform: rotate(5deg); position: relative; right: 5px;  -moz-transform: rotate(5deg); }\r\n		ul.polaroids li:nth-child(8n) a { position: relative; right: 5px; top: 8px; }\r\n		ul.polaroids li:nth-child(11n) a { position: relative; left: -5px; top: 3px; }\r\n		\r\n		ul.polaroids li.messy a { margin-top: -375px; margin-left: 160px; -webkit-transform: rotate(-5deg); -moz-transform: rotate(-5deg); }\r\n		\r\n		ul.polaroids li a:hover { -webkit-transform: scale(1.25); -moz-transform: scale(1.25); -webkit-box-shadow: 0 3px 6px rgba(0,0,0,.5); -moz-box-shadow: 0 3px 6px rgba(0,0,0,.5); position: relative; /* z-index: 5; */ }\r\n		\r\n		code { background: rgba(0,0,0,.5); padding: 2px 3px; color: #fff; text-shadow: 0 1px 1px rgba(0,0,0,.75); -webkit-border-radius: 3px; -moz-border-radius: 3px; }\r\n		\r\n		ol.code { background: rgba(0,0,0,.75); margin-bottom: 18px; border: solid rgba(0,0,0,.75); border-width: 1px 1px 0; -webkit-border-radius: 3px; -moz-border-radius: 3px; -webkit-box-shadow: 0 1px 1px rgba(255,255,255,.5); }\r\n		ol.code li, ol.code li code { font-size: 14px !important; }\r\n		ol.code code { background: none; }\r\n\r\n/* ESTILO DAS FOTOS */\r\n\r\n\r\n\r\n\r\nbutton { \r\nposition: static;\r\n}\r\n\r\n\r\n\r\n\r\n/***************AUTOS CAIXA********************/\r\n\r\n.autos_resultado\r\n{\r\n  height: 220px;\r\n	border:1px solid #f0f0f0;\r\n}\r\n.autos_resultado:hover{\r\n	background:#4CB1CA;\r\n	-webkit-transition: all 0.4s ease;\r\n	-moz-transition: all 0.4s ease;\r\n	-o-transition: all 0.4s ease;\r\n	transition: all 0.4s ease;\r\n	color:#fff;\r\n}\r\n.autos_resultado a:hover{\r\n	background:#4CB1CA;\r\n	-webkit-transition: all 0.4s ease;\r\n	-moz-transition: all 0.4s ease;\r\n	-o-transition: all 0.4s ease;\r\n	transition: all 0.4s ease;\r\n	color:#fff;\r\n}\r\n.autos_resultado img{\r\n	display:block;\r\n	border:1px solid #f0f0f0;\r\n  height: 200px;\r\n  width: 300px;\r\n	display:block;\r\n	border:1px solid #f0f0f0;\r\nmargin: 9px 5px 5px 0px;\r\ntext-align: left;\r\n/* \r\nmargin: 5% 0 1% 2.6%;\r\n*/\r\nbox-shadow: 0 0 5px #aaa;\r\n-webkit-box-shadow: 0 0 5px #aaa;\r\n-moz-box-shadow: 0 0 5px #aaa;\r\n-o-box-shadow: 0 0 5px #aaa;\r\n\r\n\r\n}\r\n\r\n.autos_caixa {\r\ndisplay: block; \r\nfloat: center;\r\nmargin: 5% 0 1% 2.6%;\r\nbox-shadow: 0 0 5px #aaa;\r\n-webkit-box-shadow: 0 0 5px #aaa;\r\n-moz-box-shadow: 0 0 5px #aaa;\r\n-o-box-shadow: 0 0 5px #aaa;\r\nfont-size: 1.2em;\r\n\r\n}\r\n\r\n.autos_caixa:hover{\r\n	background:#C0C0C0;\r\n	-webkit-transition: all 0.4s ease;\r\n	-moz-transition: all 0.4s ease;\r\n	-o-transition: all 0.4s ease;\r\n	transition: all 0.4s ease;\r\n	color:#fff;\r\n\r\n  text-shadow:\r\n    -1px -1px 0 #000,\r\n    1px -1px 0 #000,\r\n    -1px 1px 0 #000,\r\n    1px 1px 0 #000; \r\n\r\n}\r\n\r\n.autos_caixa:hover p{\r\n	color: #FFF;\r\n}\r\n.autos_image img{\r\n	display:block;\r\n	border:1px solid #f0f0f0;\r\nheight: 220px;\r\nwidth: 100%;\r\n}\r\n.autos_content {\r\n	padding:8px;\r\n	position: relative;\r\n	height: 300px;\r\n}\r\n\r\n/***************AUTOS CAIXA********************/\r\n\r\n\r\n.autos_caixa span {\r\nbackground: #7DB122;\r\ncolor: #FFF;\r\ndisplay: block;\r\nleft: -35px;\r\nfont-size: 1em;\r\npadding: 5px 0;\r\nposition: relative;\r\ntext-align: center;\r\ntop: 23px;\r\n-webkit-transform: rotate(-45deg);\r\n-moz-transform: rotate(-45deg);\r\n-ms-transform: rotate(-45deg);\r\n-o-transform: rotate(-45deg);\r\ntransform: rotate(-45deg);\r\nwidth: 140px;\r\nz-index: 2;\r\ntext-transform: uppercase;\r\nborder-bottom: 2px solid #6B9C15;\r\n}\r\n\r\n/**********imobiliaria_categoria************/\r\n\r\n.page-section h2 {\r\nfont-size: 2.5em;\r\nfont-weight: 900;\r\ncolor: #fff;\r\nmargin: 0 0 10px;\r\ntext-shadow: 2px 2px 2px #000;\r\n}\r\n.page-section p.caption {\r\ncolor: #fff;\r\npadding: 20px;\r\ntext-shadow: 1px 1px 1px #000;\r\nopacity: 90;\r\nbackground: rgba(91, 89, 82, 0.4);\r\n}\r\n.page-section p {\r\nfont-size: 1.2em;\r\nfont-weight: 200;\r\nmargin: 0 5% 20px 0;\r\n}\r\n.page-section#south-america {\r\nbackground: url(images123/south-america.jpg) top center no-repeat;\r\n}\r\n.page-section {\r\nwidth: 100%;\r\nmin-height: 440px;\r\npadding: 30px 0;\r\n/* border-bottom: 1px solid #fff; */\r\n}\r\n\r\n\r\n\r\n/*correcao*/\r\n.navbar-nav {\r\nmargin: auto;\r\n}\r\n\r\n\r\n/*===============ultimos cadastros ================*/\r\nmarquee {\r\ndisplay: inline-block;\r\nfont-size: 1.2em;\r\n}\r\nmarquee li {\r\nlist-style: none;\r\nmargin: 0 15px 5px;\r\nfont-weight: bold;\r\n}\r\n/*===============ultimos cadastros fim ================*/\r\n\r\n\r\n\r\n\r\n\r\n\r\n/*---- process ----*/\r\n.anuncie{\r\n	background: url(images123/layout/process-bg.jpg) no-repeat 0px 0px;\r\n	background-size:cover;\r\n	padding: 4em 0 6em;\r\n}\r\n.process-grids{\r\n	padding:2.5em 0;\r\n}\r\n.process-grid{\r\n	padding:4em 0 6em;\r\n}\r\n.process-grid h4{\r\n	text-transform:uppercase;\r\n	font-size:1.6em;\r\n}\r\n.process-grid h4 a{\r\n	color:#FFF;\r\n	text-decoration:none;\r\n	font-weight:500;\r\n}\r\n.process-grid span{\r\n	width:68px;\r\n	height:68px;\r\n	display:inline-block;\r\n	background:url(../images/process-icons.png) no-repeat 0px 0px;\r\n}\r\n.process-grid span.p-icon2{\r\n	background-position:-236px 0px;\r\n}\r\n.process-grid span.p-icon3{\r\n	background-position: -468px 0px;\r\n}\r\n.process-grid span.p-icon4{\r\n	background-position: -709px 0px;\r\n}\r\n.process-grid1{\r\n	background:url(images123/layout/p-bg1.jpg) no-repeat 0px 0px;\r\n	background-size:cover;\r\n}\r\n.process-grid2{\r\n	background:url(images123/layout/p-bg2.jpg) no-repeat 0px 0px;\r\n	background-size:cover;\r\n}\r\n.process-grid3{\r\n	background:url(images123/layout/p-bg3.jpg) no-repeat 0px 0px;\r\n	background-size:cover;\r\n}\r\n.process-grid4{\r\n	background:url(images123/layout/p-bg4.jpg) no-repeat 0px 0px;\r\n	background-size:cover;\r\n}\r\n\r\n\r\n\r\n/****************rede social******************/\r\n.redesocial img{\r\nheight: 36px;	\r\nwidth: 36px;\r\nmargin-top: 7px;\r\nmargin-right: 6px;\r\nmargin-left: 6px;\r\nopacity: 0.8;\r\n}\r\n.redesocial img:hover{\r\nmargin-top: -5px;\r\nheight: 46px;	\r\nwidth: 46px;\r\nmargin-right: 0px;\r\nmargin-left: 2px;\r\nopacity: 1;\r\n}\r\n/****************rede social******************/\r\n\r\n\r\n\r\n/********************host e dominios*************************/\r\n.blue-bar{\r\n	background: url(images123/host/bg-banner-blue.png);\r\n	padding:70px 0px;\r\n	font-family: Modern,Arial, Helvetica, sans-serif;\r\n}\r\n.shrd-hosting {\r\n	height: 319px;\r\n	position: relative;\r\n}\r\n.grdiant {\r\n	height: 100%;\r\n}\r\n.shrd-hosting .img-holder {\r\n	top: 36px;\r\n	left: 44px;\r\n}\r\n.hosting-blurb-wrp .img-holder {\r\n	position: absolute;\r\n}\r\n.ui-buy {\r\n	margin: 3px 0;\r\n	color: #fff;\r\n	padding: 0 0 15px 0;\r\n	margin: 0;\r\n	font-size:50px;\r\n}\r\n.bl-txt{\r\n	color:rgb(185, 220, 250);\r\n}\r\n.img-holder{\r\n	width:195px;\r\n	float:left;\r\n	margin-right: 30px;\r\n}\r\n.text-hosting{\r\n	width: 775px;\r\n	float: left;\r\n}\r\n.ui-subtitle {\r\n	font-size: 20px;\r\n	margin: 0 0 30px 0;\r\n	color: #fff;\r\n}\r\nem.greytext{\r\n	color:rgb(183, 226, 245);\r\n	font-size:18px;\r\n}\r\n\r\n.feature-list{\r\n	width: 32%;\r\n	float: left;\r\n	margin-bottom: 20px;\r\n}\r\n.feature-list li, .feature-list1 li{\r\n	list-style-image: url(images123/host/arrow.png);\r\n	margin-left: 20px;\r\n	margin-bottom: 5px;\r\n	font-size:16px;\r\n	color:#fff;\r\n}\r\n.feature-list1{\r\n	width: 32%;\r\n	float: left;\r\n}\r\n.pricing-wrp{\r\n	width: 335px;\r\n	float: left;\r\n}\r\n.pricing-wrp p{\r\n	color:#fff;\r\n	font-size:25px;\r\n}\r\n.pricing-wrp strong{\r\n	color: rgb(183, 226, 245);\r\n}\r\n.view-plans {\r\n	float: left;\r\n	width:175px;\r\n	margin: 20px 40px 0 0;\r\n}\r\n.button{\r\n	font-size: 18px;\r\n	padding: 8px;\r\n	width: auto;\r\n	height: 42px;\r\n	line-height: 39px;\r\n	border:2px solid rgb(156, 216, 247);\r\n	background:#fff;\r\n	color:#555;\r\n	text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);\r\n}\r\n.button:hover {\r\n	color:#0d97d7;\r\n	text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);\r\n}\r\n.fixbutton {\r\n	width: 410px;\r\n}\r\n.lfloat {\r\n	float: left;\r\n}\r\n.txt-button, .uiButton, .ui-button, .frmButton {\r\n	font-size: 18px;\r\n	padding: 5px;\r\n	font-family: Modern,Arial, Helvetica, sans-serif;\r\n	color: #fff;\r\n	text-shadow: 1px 1px 0px #2662b6;\r\n	text-align: center;\r\n	background: rgb(8, 143, 250);\r\n	border:1px solid rgb(8, 143, 250);\r\n	cursor: pointer;\r\n}\r\nspan.c-btn-win {\r\n	background: url(images123/host/arrow1.png) no-repeat 0 0;\r\n	height: 34px;\r\n	width: 40px;\r\n}\r\n.domain-name{\r\n	text-align: center;\r\n	margin-bottom: 20px;\r\n}\r\n.domain-name h2{\r\n	font-size:50px;\r\n	color:rgb(183, 226, 245);\r\n}\r\n/*-- dropdown -- */\r\n/*search box */\r\n.search-box{\r\n	padding: 38px 30px 30px 45px;\r\n	margin-bottom: 45px;\r\n	border-radius: 77px;\r\n	background-color: #8cd3ef;\r\n	background-color: rgb(255,255,255,0.2);\r\n	background-color: rgba(255,255,255,0.2);\r\n}\r\n/* Domain search box */\r\n.domain-search-box {\r\n	margin-bottom:10px;\r\n	background:#fff;\r\n	border:solid 1px #d1cfcf;\r\n	height:47px;\r\n	padding:0 0 0 20px;\r\n	border-radius:25px;\r\n	-moz-border-radius:25px;\r\n	-webkit-border-radous:25px;\r\n	-o-border-radous:25px;\r\n	-ms-border-radous:25px;\r\n	box-shadow: 0 3px 2px #b7b7b7;\r\n	-moz-box-shadow: 0 3px 2px #b7b7b7;\r\n	-webkit-box-shadow: 0 3px 2px #b7b7b7;\r\n	-o-box-shadow: 0 3px 2px #b7b7b7;\r\n	position:relative;\r\n	z-index:1;\r\n	width: 890px;}\r\n.domains-input {\r\n	background-color:#ffffff;\r\n	outline:none;\r\n	margin:0;\r\n	border:medium none;\r\n	color:#707070;\r\n	font-family: Modern,Arial, Helvetica, sans-serif;\r\n	font-size:19px;\r\n	letter-spacing:1px;\r\n	padding:11px 0 12px 0;\r\n	float:left;\r\n	width: 700px;\r\n	}\r\n#homepage-content .domains-select, .domains-select {\r\n    border-left: 1px solid #CCCCCC;\r\n	float: left;\r\n	font-family: Modern,Arial, Helvetica, sans-serif;\r\n	height: 47px;\r\n	overflow: hidden;\r\n	position: relative;\r\n	width: 113px;\r\n	color:#707070;\r\n	font-size:19px;\r\n	cursor:pointer;}\r\n.domain-submit, .domain-submit-disabled {\r\n    border:none;\r\n	height:47px;\r\n	width:76px;\r\n	text-shadow: 1px 1px 0px #2662b6;\r\n	text-align: center;\r\n	background-color: #236fe2;\r\n	background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#61aaef), color-stop(25%, #61aaef), to(#236fe2));\r\n	background-image: -webkit-linear-gradient(#61aaef, #61aaef 25%, #236fe2);\r\n	background-image: -moz-linear-gradient(top, #61aaef, #61aaef 25%, #236fe2);\r\n	background-image: -ms-linear-gradient(#61aaef, #61aaef 25%, #236fe2);\r\n	background-image: -o-linear-gradient(#61aaef, #61aaef 25%, #236fe2);\r\n	background-image: linear-gradient(#61aaef, #61aaef 25%, #236fe2);\r\n	background-repeat: no-repeat;\r\n	border: 1px solid #5a8ddf;\r\n	-moz-border-radius:0 25px 25px 0;\r\n	-webkit-border-radius:0 25px 25px 0;\r\n	-ms-border-radius:0 25px 25px 0;\r\n	border-radius:0 25px 25px 0;\r\n	display:inline-block;\r\n	color:#ffffff;\r\n	padding:6px 24px;\r\n	font-size:22px;\r\n	font-weight:bold;\r\n	text-decoration:none;\r\n	cursor:pointer;\r\n}\r\n#go_btn.go_btn_readonly{\r\n	cursor:default;\r\n}\r\n#homepage-content .domains-select select, .domains-select select {\r\n	background: none repeat scroll 0 0 transparent;\r\n	border: 0px solid #FFF;\r\n	color: #707070;\r\n	cursor: pointer;\r\n	width:120px;\r\n	height:52px;\r\n	filter: alpha(opacity = 0);\r\n	font-size: 18px;\r\n}\r\nspan#include-free {\r\n	font-size:14px;\r\n}\r\n#region-top #transfer-domain {\r\n	bottom: 0;\r\n	font-size: 11px;\r\n	font-weight: bold;\r\n	left: 0;\r\n	margin: 0;\r\n   text-align: left;\r\n	width: 220px;\r\n	overflow:hidden;}\r\n	.tlds-dd {\r\n	position: absolute;\r\n	background: url(''images123/host/drop-arrow.png'') no-repeat right;\r\n	display: block;\r\n	top: 20px;\r\n	right: 20px;\r\n	width: 30px;\r\n	height: 11px;\r\n}\r\n.brd-fix {\r\n	opacity:0;\r\n	 -ms-filter:''progid:DXImageTransform.Microsoft.Alpha(Opacity=0)'';\r\n	filter: alpha(opacity=0);\r\n	zoom: 1;\r\n}\r\n.tlds {\r\n	position:absolute;\r\n 	top:11px; \r\n 	left:13px;\r\n}\r\n/*--content--*/\r\n\r\n/* Linux Reseller Hosting */\r\n/* PLANS PAGES */\r\n.host-content h2 {\r\n	color: #fff;\r\n	margin: 0;\r\n	font-size:35px;\r\n	padding-bottom: 20px;\r\n}\r\n.host-content h2 em, .content h2 em, .whois-lookup em{\r\n	color: rgb(183, 226, 245);\r\n}\r\n.plans-masthead ol { padding: 0;  list-style-position: inside;}\r\n.plans-masthead li {\r\n	color: #fff;\r\n	margin: 0;\r\n	padding: 0 0 14px 25px;\r\n	background: url(''images123/host/arrow.png'') no-repeat 0 1px;\r\n  list-style: none;\r\n}\r\nol.list{\r\n	float: left;\r\n	width: 342px;\r\n}\r\n.plans-masthead{\r\n	width: 685px;\r\n	float: left;\r\n}\r\n.linux-banner{\r\n	width: 315px;\r\n	float: left;\r\n}\r\n.supports{\r\n	margin: 20px 0;\r\n}\r\n.supports p{\r\n	font-size:13px;\r\n	font-weight:bold;\r\n	color:#fff;\r\n	margin-bottom: 10px;\r\n}\r\n.host-main{\r\n	margin-top: 10px;\r\n}\r\n.grids-hosting{width: 100%; text-align:center; margin:3px 0;}\r\n.plan-list {\r\n	background:#ffffff;\r\n	width: 230px;\r\n	display:inline-block;\r\n	margin: 0;\r\n	padding: 0;\r\n	list-style: none;\r\n	text-align: center;\r\n	border: 1px solid #dedcdc ;\r\n	border-radius: 0 0 6px 6px;\r\n	-moz-border-radius: 0 0 6px 6px;\r\n	-webkit-border-radius: 0 0 6px 6px;\r\n	position: relative;\r\n	margin-right:-4px;\r\n}\r\n.plan-list .p-cutout {display:none; }\r\n.plan-featured .p-cutout {display:block;}\r\n.grids-hosting .plan-list {\r\n	border-radius: 1em;\r\n	-moz-border-radius: 1em;\r\n	-webkit-border-radius: 1em;\r\n	-o-border-radius:1em;\r\n	box-shadow: 0px 0px 10px #999;\r\n	-webkit-box-shadow:  0px 0px 10px #999;\r\n	-moz-box-shadow: 0px 0px 10px #999;\r\n}\r\n.plan-list li{\r\n	margin: 0  0px;\r\n	font-size:22px;\r\n}\r\nli.p-name{\r\n	-webkit-border-top-left-radius: .4em;\r\n	-webkit-border-top-right-radius: .4em;\r\n	-moz-border-top-left-radius: .4em;\r\n	-moz-border-top-right-radius: .4em;\r\n	color: #fff;\r\n	padding: 15px 0;\r\n	border-bottom: 1px solid rgb(10, 137, 255);\r\n	background: -moz-linear-gradient(top,  rgba(1,160,252,1) 0%, rgba(0,154,250,1) 23%, rgba(1,153,254,1) 24%, rgba(0,147,253,1) 43%, rgba(1,112,253,1) 87%, rgba(0,106,254,1) 100%);\r\n	background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(1,160,252,1)), color-stop(23%,rgba(0,154,250,1)), color-stop(24%,rgba(1,153,254,1)), color-stop(43%,rgba(0,147,253,1)), color-stop(87%,rgba(1,112,253,1)), color-stop(100%,rgba(0,106,254,1)));\r\n	background: -webkit-linear-gradient(top,  rgba(1,160,252,1) 0%,rgba(0,154,250,1) 23%,rgba(1,153,254,1) 24%,rgba(0,147,253,1) 43%,rgba(1,112,253,1) 87%,rgba(0,106,254,1) 100%);\r\n	background: -o-linear-gradient(top,  rgba(1,160,252,1) 0%,rgba(0,154,250,1) 23%,rgba(1,153,254,1) 24%,rgba(0,147,253,1) 43%,rgba(1,112,253,1) 87%,rgba(0,106,254,1) 100%);\r\n	background: -ms-linear-gradient(top,  rgba(1,160,252,1) 0%,rgba(0,154,250,1) 23%,rgba(1,153,254,1) 24%,rgba(0,147,253,1) 43%,rgba(1,112,253,1) 87%,rgba(0,106,254,1) 100%);\r\n	background: linear-gradient(to bottom,  rgba(1,160,252,1) 0%,rgba(0,154,250,1) 23%,rgba(1,153,254,1) 24%,rgba(0,147,253,1) 43%,rgba(1,112,253,1) 87%,rgba(0,106,254,1) 100%);\r\n	filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=''#01a0fc'', endColorstr=''#006afe'',GradientType=0 );\r\n}\r\nli.p-name1{\r\n	-webkit-border-top-left-radius: .4em;\r\n	-webkit-border-top-right-radius: .4em;\r\n	-moz-border-top-left-radius: .4em;\r\n	-moz-border-top-right-radius: .4em;\r\n	color: #fff;\r\n	padding: 15px 0;\r\n	border-bottom: 1px solid rgb(28, 122, 19);\r\n	background: rgb(76,176,52);\r\n	background: -moz-linear-gradient(top,  rgba(76,176,52,1) 0%, rgba(69,167,48,1) 47%, rgba(61,155,41,1) 63%, rgba(63,152,44,1) 65%, rgba(49,134,31,1) 100%);\r\n	background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(76,176,52,1)), color-stop(47%,rgba(69,167,48,1)), color-stop(63%,rgba(61,155,41,1)), color-stop(65%,rgba(63,152,44,1)), color-stop(100%,rgba(49,134,31,1)));\r\n	background: -webkit-linear-gradient(top,  rgba(76,176,52,1) 0%,rgba(69,167,48,1) 47%,rgba(61,155,41,1) 63%,rgba(63,152,44,1) 65%,rgba(49,134,31,1) 100%);\r\n	background: -o-linear-gradient(top,  rgba(76,176,52,1) 0%,rgba(69,167,48,1) 47%,rgba(61,155,41,1) 63%,rgba(63,152,44,1) 65%,rgba(49,134,31,1) 100%);\r\n	background: -ms-linear-gradient(top,  rgba(76,176,52,1) 0%,rgba(69,167,48,1) 47%,rgba(61,155,41,1) 63%,rgba(63,152,44,1) 65%,rgba(49,134,31,1) 100%);\r\n	background: linear-gradient(to bottom,  rgba(76,176,52,1) 0%,rgba(69,167,48,1) 47%,rgba(61,155,41,1) 63%,rgba(63,152,44,1) 65%,rgba(49,134,31,1) 100%);\r\n	filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=''#4cb034'', endColorstr=''#31861f'',GradientType=0 );\r\n}\r\nli.p-name2{\r\n	-webkit-border-top-left-radius: .7em;\r\n	-webkit-border-top-right-radius: .7em;\r\n	-moz-border-top-left-radius: .7em;\r\n	-moz-border-top-right-radius: .7em;\r\n	color: #fff;\r\n	padding: 15px 0;\r\n	border-bottom: 1px solid rgb(145, 121, 26);\r\n	background: rgb(239,172,21);\r\n	background: -moz-linear-gradient(top,  rgba(239,172,21,1) 0%, rgba(235,165,18,1) 31%, rgba(237,162,19,1) 32%, rgba(235,160,17,1) 39%, rgba(235,154,19,1) 51%, rgba(232,150,15,1) 58%, rgba(234,145,19,1) 64%, rgba(234,142,15,1) 66%, rgba(231,134,17,1) 78%, rgba(233,132,14,1) 81%, rgba(230,128,17,1) 87%, rgba(229,123,13,1) 100%);\r\n	background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(239,172,21,1)), color-stop(31%,rgba(235,165,18,1)), color-stop(32%,rgba(237,162,19,1)), color-stop(39%,rgba(235,160,17,1)), color-stop(51%,rgba(235,154,19,1)), color-stop(58%,rgba(232,150,15,1)), color-stop(64%,rgba(234,145,19,1)), color-stop(66%,rgba(234,142,15,1)), color-stop(78%,rgba(231,134,17,1)), color-stop(81%,rgba(233,132,14,1)), color-stop(87%,rgba(230,128,17,1)), color-stop(100%,rgba(229,123,13,1)));\r\n	background: -webkit-linear-gradient(top,  rgba(239,172,21,1) 0%,rgba(235,165,18,1) 31%,rgba(237,162,19,1) 32%,rgba(235,160,17,1) 39%,rgba(235,154,19,1) 51%,rgba(232,150,15,1) 58%,rgba(234,145,19,1) 64%,rgba(234,142,15,1) 66%,rgba(231,134,17,1) 78%,rgba(233,132,14,1) 81%,rgba(230,128,17,1) 87%,rgba(229,123,13,1) 100%);\r\n	background: -o-linear-gradient(top,  rgba(239,172,21,1) 0%,rgba(235,165,18,1) 31%,rgba(237,162,19,1) 32%,rgba(235,160,17,1) 39%,rgba(235,154,19,1) 51%,rgba(232,150,15,1) 58%,rgba(234,145,19,1) 64%,rgba(234,142,15,1) 66%,rgba(231,134,17,1) 78%,rgba(233,132,14,1) 81%,rgba(230,128,17,1) 87%,rgba(229,123,13,1) 100%);\r\n	background: -ms-linear-gradient(top,  rgba(239,172,21,1) 0%,rgba(235,165,18,1) 31%,rgba(237,162,19,1) 32%,rgba(235,160,17,1) 39%,rgba(235,154,19,1) 51%,rgba(232,150,15,1) 58%,rgba(234,145,19,1) 64%,rgba(234,142,15,1) 66%,rgba(231,134,17,1) 78%,rgba(233,132,14,1) 81%,rgba(230,128,17,1) 87%,rgba(229,123,13,1) 100%);\r\n	background: linear-gradient(to bottom,  rgba(239,172,21,1) 0%,rgba(235,165,18,1) 31%,rgba(237,162,19,1) 32%,rgba(235,160,17,1) 39%,rgba(235,154,19,1) 51%,rgba(232,150,15,1) 58%,rgba(234,145,19,1) 64%,rgba(234,142,15,1) 66%,rgba(231,134,17,1) 78%,rgba(233,132,14,1) 81%,rgba(230,128,17,1) 87%,rgba(229,123,13,1) 100%);\r\n	filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=''#efac15'', endColorstr=''#e57b0d'',GradientType=0 );\r\n}\r\nli.p-name3{\r\n	-webkit-border-top-left-radius: .4em;\r\n	-webkit-border-top-right-radius: .4em;\r\n	-moz-border-top-left-radius: .4em;\r\n	-moz-border-top-right-radius: .4em;\r\n	color: #fff;\r\n	padding: 15px 0;\r\n	border-bottom: 1px solid rgb(151, 66, 77);\r\n	background: rgb(231,79,78);\r\n	background: -moz-linear-gradient(top,  rgba(231,79,78,1) 0%, rgba(231,79,78,1) 15%, rgba(227,73,73,1) 45%, rgba(220,66,66,1) 64%, rgba(219,64,62,1) 66%, rgba(213,58,56,1) 79%, rgba(208,50,49,1) 100%);\r\n	background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(231,79,78,1)), color-stop(15%,rgba(231,79,78,1)), color-stop(45%,rgba(227,73,73,1)), color-stop(64%,rgba(220,66,66,1)), color-stop(66%,rgba(219,64,62,1)), color-stop(79%,rgba(213,58,56,1)), color-stop(100%,rgba(208,50,49,1)));\r\n	background: -webkit-linear-gradient(top,  rgba(231,79,78,1) 0%,rgba(231,79,78,1) 15%,rgba(227,73,73,1) 45%,rgba(220,66,66,1) 64%,rgba(219,64,62,1) 66%,rgba(213,58,56,1) 79%,rgba(208,50,49,1) 100%);\r\n	background: -o-linear-gradient(top,  rgba(231,79,78,1) 0%,rgba(231,79,78,1) 15%,rgba(227,73,73,1) 45%,rgba(220,66,66,1) 64%,rgba(219,64,62,1) 66%,rgba(213,58,56,1) 79%,rgba(208,50,49,1) 100%);\r\n	background: -ms-linear-gradient(top,  rgba(231,79,78,1) 0%,rgba(231,79,78,1) 15%,rgba(227,73,73,1) 45%,rgba(220,66,66,1) 64%,rgba(219,64,62,1) 66%,rgba(213,58,56,1) 79%,rgba(208,50,49,1) 100%);\r\n	background: linear-gradient(to bottom,  rgba(231,79,78,1) 0%,rgba(231,79,78,1) 15%,rgba(227,73,73,1) 45%,rgba(220,66,66,1) 64%,rgba(219,64,62,1) 66%,rgba(213,58,56,1) 79%,rgba(208,50,49,1) 100%);\r\n	filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=''#e74f4e'', endColorstr=''#d03231'',GradientType=0 );\r\n}\r\n.p-currency {\r\n	font:bold 18px ''Rokkitt'', serif;\r\n	position: relative;\r\n	top: -10px;\r\n	display: inline-block;\r\n}\r\n.p-duration {\r\n	font:bold 15px ''Rokkitt'', serif;\r\n}\r\nli.p-feat {\r\n	font-size: 13px;\r\n	font-weight: normal;\r\n	padding: 14px 0;\r\n	color: #5b5b5b;\r\n	border-bottom: 1px solid #f1f1f1;\r\n}\r\nli.p-feat1 {\r\n	font-size: 18px;\r\n	font-weight: normal;\r\n	padding: 14px 0;\r\n	color: #5b5b5b; \r\n	border-bottom: 1px solid #f1f1f1;\r\n	background:#f1f1f1;\r\n}\r\nli.last {\r\n	border:0;\r\n}\r\nli.m-feat {\r\n	font-size:15px;\r\n	padding: 9px 0; \r\n	color: #5b5b5b;\r\n	border-bottom: 1px solid #f1f1f1;\r\n}\r\nli.n-feat {\r\n	font-size: 12px;\r\n	padding: 9px 0;\r\n	color: #5b5b5b;\r\n	border-bottom: 1px solid #dcdcdc;\r\n}\r\nli.p-feat strong {\r\n	font-size: 17px;\r\n	font-weight: bold;\r\n}\r\nli.p-dropdown {\r\n	padding: 20px 0px 10px;\r\n}\r\nli.p-dropdown select {\r\n	font-family: arial;\r\n	padding:3px; \r\n	border:solid 1px #DCDCDC; \r\n	width: 195px; \r\n	font-weight: normal;\r\n	font-size: 13px;\r\n	color: #555;\r\n	outline: none;\r\n}\r\nli.p-button {\r\n	padding: 12px 0 22px;\r\n}\r\nli.p-button .txt-button {\r\n	font-size: 17px;\r\n	padding: 8px 20px;\r\n}\r\n.plan-featured {\r\n	border: 1px solid #efefef;\r\n	box-shadow: 0px 4px 8px -2px rgb(192, 196, 197);\r\n	-webkit-box-shadow: 0px 4px 8px -2px rgb(192, 196, 197);\r\n	-moz-box-shadow:0px 4px 8px -2px rgb(192, 196, 197);\r\n	z-index: 999;\r\n	position: relative;\r\n	top:-8px;\r\n	padding-bottom: 10px;\r\n}\r\n/******************/\r\n/* Email Hosting */\r\n/****************/\r\n.emails-plan-wrapper{\r\n	height: 311px;\r\n	margin-bottom:20px;\r\n}\r\n.emails-plan-wrapper .plan-details{\r\n	margin-top:82px;\r\n}\r\n.plans-columns-wrp{\r\n	padding:2px 2px 0;\r\n    position:relative;\r\n}\r\n.grids-hosting{\r\n	background:#efefef;\r\n    padding:60px 0 30px 0; \r\n   		border-radius:10px;\r\n	 -moz-border-radius:10px;\r\n	 -webkit-border-radius:10px;\r\n	 font-family: ''Modern'',Arial, Helvetica, sans-serif;\r\n}\r\n.server_loc_tabs{\r\n	border:4px solid rgb(21, 62, 78);\r\n	position:absolute; \r\n	top:-22px; \r\n	 border-radius:6px;\r\n	 -moz-border-radius:6px;\r\n	 -webkit-border-radius:6px;\r\n	 background: #dedede;\r\n}\r\n.server_loc_tabs li{\r\n	background:#fff; \r\n	color:#555;\r\n	font-size:17px;\r\n	line-height:40px;\r\n	padding: 4px 20px 0 70px;\r\n 	float:left;\r\n 	position:relative; \r\n 	cursor:pointer; \r\n 	border-right: 1px solid #666;\r\n 	text-transform: uppercase;\r\n 	list-style: none;\r\n}\r\n.server_loc_tabs ul li.sel{	\r\n	color: #555;\r\n	cursor: default;\r\n	background-color: #f0f0f0;\r\n}\r\n.server_loc_tabs ul li .sel_tab{\r\n	display:none;\r\n}\r\n.server_loc_tabs li.tab_IN{\r\n	background: url(''images123/host/vps.png'') no-repeat 32px 8px #fff;\r\n}\r\n.server_loc_tabs li.tab_US{\r\n	background: url(''images123/host/share.png'') no-repeat 32px 8px #fff;\r\n}\r\n.server_loc_tabs li.tab_UK{\r\n	background: url(''images123/host/dedicated.png'') no-repeat 32px 8px #fff;\r\n}\r\n.server_loc_tabs li.first{\r\n	border-radius:6px 0 0 6px;-moz-border-radius:6px 0 0 6px;-webkit-border-radius:6px 0 0 6px;\r\n}\r\n.server_loc_tabs li.last{\r\n	border-radius:0 6px 6px 0px;-moz-border-radius:0 6px 6px 0px;-webkit-border-radius:0 6px 6px 0px;\r\n}\r\n.plan-featured .p-name, .plan-featured .p-pricing{\r\n	color:#444;\r\n}\r\n/*btm-page*/\r\n/* features section CSS */\r\n.web-hosting-features{\r\n	float:left;\r\n	background: none no-repeat scroll 0 0 #f5f5f5;\r\n	text-align: left;\r\n	width: 100%;\r\n	margin-bottom: 10px;\r\n	font-family: ''Modern'',Arial, Helvetica, sans-serif;\r\n}\r\n.web-hosting-features .features-group{\r\n	background: url(''images123/host/down-arrow.png'') no-repeat scroll 10px center #efefef;\r\n	font-size: 18px;\r\n	font-weight: bold;\r\n	color: #0d5c9c;\r\n	padding: 10px 10px 10px 36px;\r\n	border-bottom: 1px solid #bfbfbf;\r\n	cursor: pointer;\r\n}\r\n.web-hosting-features .features-group.closed{\r\n	background: url(''images123/host/left-arrow.png'') no-repeat scroll 10px center #efefef;\r\n}\r\n.web-hosting-features .features-title{\r\n	margin-bottom: 5px;\r\n	background: #0d5c9c;\r\n	border-radius: 5px;\r\n	font-size: 24px;\r\n	font-weight: bold;\r\n	color:#fff;\r\n	text-shadow: 0px 1px 0px #0d5c9c;\r\n	margin-bottom: 5px;\r\n	padding: 5px 10px;\r\n}\r\n.web-hosting-features ul,li{\r\n	background: none;\r\n}\r\n.web-hosting-features ul{\r\n	padding: 10px 40px;\r\n}\r\n.web-hosting-features li{\r\n	list-style-type: disc;\r\n	padding: 3px 0px;\r\n	font-size:13px;\r\n	color: #444;\r\n}\r\n.features-wrapper{\r\n	margin: 40px 0;\r\n}\r\n.features-wrapper .narrow-right-column{\r\n	padding-top: 0;\r\n	text-align: left;\r\n}\r\n/* domain registration */\r\n.hastab.price_tabs{\r\n	 margin-left:-30px;\r\n	 width:1000px;\r\n	 text-align:left;\r\n}\r\n.hastab.price_tabs .tab{\r\n	 padding-left:30px;\r\n}\r\n#domain-box, #idn-box {\r\n	 min-height: 250px;\r\n}\r\n#domain-box, #idn-box{ \r\n 	position:relative;\r\n}\r\n /* Placeholder*/\r\n.placeholder-wrapper{\r\n 	position:relative;\r\n}\r\n.txt-input{\r\n 	position:absolute;\r\n 	top:0px; \r\n 	left:0px;\r\n 	z-index:1;\r\n}\r\n.placeholder{\r\n 	position:absolute;\r\n 	top:0px; \r\n 	left:0px; \r\n 	z-index:2; \r\n 	padding:20px;  \r\n}\r\n.placeholder-wrapper.ho .txt-input{\r\n 	z-index:2 !important; \r\n}\r\n.placeholder-wrapper.ho .placeholder{\r\n 	z-index:1 !important; \r\n}\r\n.placeholder-txt1{\r\n	color:#6B6B6B; \r\n	font-weight:bold;\r\n}		\r\n.placeholder-txt2{\r\n	color: #555;\r\n	font-size: 12px;\r\n	font-weight: normal;\r\n	padding-top: 5px;\r\n	font-size: 13px;\r\n}\r\n.placeholder-wrapper.ho .txt-input {\r\n	z-index: 2 !important;\r\n}\r\n/* Domain Reg */\r\n#domain-box {\r\n	overflow:hidden;\r\n}\r\n.domain-sbox{ \r\n	width:327px;\r\n}\r\n.sd-tarea {\r\n	border:solid 1px #d1cfcf;\r\n	border-radius:6px;\r\n	-moz-border-radius:6px;\r\n	-webkit-border-radius:6px;\r\n	-ms-border-radius:6px;\r\n	width:287px;\r\n	height:155px;\r\n	padding:20px;\r\n	box-shadow:0 3px 2px #B7B7B7;\r\n	-moz-box-shadow:0 3px 2px #B7B7B7;\r\n	-webkit-box-shadow:0 3px 2px #B7B7B7;\r\n	-ms-box-shadow:0 3px 2px #B7B7B7;\r\n	margin:0 10px 10px 0;\r\n	font-size: 16px;\r\n	font-weight: normal;\r\n	color:#555;\r\n	outline:none;\r\n}\r\n.dataTable2 label {\r\n	font-size:16px;\r\n	color:#fff;\r\n}\r\n.rfloat{\r\n	float:right;\r\n}\r\n.tld-box {\r\n	margin-left:20px; \r\n	display:inline;\r\n}\r\n.alink {\r\n	color:rgb(179, 226, 248);\r\n	display:inline-block;\r\n	padding:5px 0 0 0;\r\n	cursor:pointer;\r\n}\r\n.tld-box table.dataTable2 td {\r\n	width:116px;\r\n	padding:5px 0;\r\n}\r\n.tld-list-wrp {\r\n	background:#fbfcfd;\r\n	border:solid 1px #e1f3cf;\r\n	padding:10px 20px;\r\n	border-radius:0 0 5px 5px;\r\n	-webkit-border-radius:0 0 5px 5px;\r\n	-moz-border-radius:0 0 5px 5px;\r\n}\r\n.tld-list-data td {\r\n	font-size: 20px;\r\n	font-weight: normal;\r\n	color:#555f4b;\r\n	padding:8px 0 8px 50px;\r\n	border-bottom:solid 1px #e1f3cf;\r\n}\r\n.tld-list-data .last td {\r\n	border:none;\r\n}\r\n.tld-list-data .domain-c {\r\n	font-size:14px;\r\n	font-weight:normal;\r\n}\r\n.txt-link {\r\n	font-size:16px;\r\n	font-weight:normal;\r\n	color:#216ee1; \r\n	cursor:pointer;\r\n}\r\n.link-promo {\r\n	font-size:16px; \r\n	text-decoration:none; \r\n	color:#fff;\r\n}\r\n /* bulh domain reg */\r\n.bulk-domain{\r\n	padding: 70px 0;\r\n}\r\n.bulk_domain_reg{\r\n	padding-bottom:30px;\r\n}\r\n.bulk_domain_reg p{\r\n	font-size: 16px;\r\n	color: #555;\r\n	padding: 20px;\r\n	background: rgb(186, 233, 255);\r\n	border: 1px solid rgb(186, 233, 255);\r\n	border-radius:10px;\r\n	-moz-border-radius:10px;\r\n	-webkit-border-radius:10px;\r\n	font-weight: bold;\r\n}\r\n /* IDN search */\r\n.list-heading { \r\n	color:#fff;\r\n	padding:0 0 1px 0;\r\n}\r\n.dname-wrp .dname-option{ \r\n	font-size:13px;\r\n	font-weight:normal;\r\n	color:#777;\r\n	display:block;\r\n	padding-top:3px;\r\n}\r\n.txt-green{ \r\n	color:rgb(123, 205, 243);\r\n}\r\n\r\n/* who is lookup */\r\n.suggestion_form table tr{\r\n  height:50px;	\r\n}\r\n/* domain transfer */\r\n.suggestion_form table select{\r\n	padding:8px 10px;\r\n	font-size:15px;\r\n	border: 1px solid #0073AA;\r\n	border-radius:5px;\r\n    -moz-border-radius:5px;\r\n    -webkit-border-radius:5px;\r\n    -o-border-radius:5px;\r\n    outline:none;\r\n}\r\n.ext{\r\n	color:#DDD;\r\n	font-size:20px;\r\n	font-weight:bold;\r\n}\r\n/* Services-list */\r\n.free-domain {\r\n	font-family: ''Modern'',Arial, Helvetica, sans-serif;\r\n	padding: 40px 0;\r\n}\r\n.services{\r\n	font-family: ''Modern'',Arial, Helvetica, sans-serif;\r\n}\r\n.services_heading{\r\n	padding: 30px 0 20px;\r\n}\r\n.services_heading h2 span{\r\n	color: #08a6f0;\r\n}\r\n.services_heading h2 {\r\n	color: #555;\r\n	padding-bottom: 5px;\r\n	margin: 0;\r\n	font-size:35px;\r\n}\r\n.services_heading p.sub_heading{\r\n	font-weight:bold;\r\n	color: #555;\r\n	font-size:18px;\r\n}\r\n.services_list{\r\n	\r\n}\r\n.services_list h4{\r\n	color: #555;\r\n	font-weight: bold;\r\n	margin-bottom: 9px;\r\n}\r\n.services_grid1{\r\n	float: left;\r\n	width: 50%;\r\n	margin-right: 3%;\r\n}\r\n.services_grid{\r\n	margin-bottom: 30px;\r\n}\r\n.linux_services{\r\n	width:50%;\r\n	float:left;\r\n}\r\n.services_img{\r\n	float:left;\r\n}\r\n.services_desc{\r\n	float:left;\r\n	width:382px;\r\n    padding-left:15px; \r\n}\r\n.services_desc p{\r\n	font-size:13px;\r\n	color:#555;\r\n	line-height:1.6em;\r\n}\r\n.services_grid2{\r\n	float:right;\r\n	padding-right:20px;\r\n}\r\n\r\n/*--email--*/\r\n.email-plan {\r\n	text-align: center;\r\n}\r\n\r\n/*\r\n\r\n@media all and (max-width:1024px) and (min-width:800px){\r\n	.wrap{\r\n		width:940px;\r\n		}\r\n	.header {\r\n		padding:10px 0; \r\n		}\r\n	.nav li:hover li a, .nav li.active li a, .nav li.nav-hover li a {\r\n		margin: 0px;\r\n		width:217px;\r\n	}\r\n	.domain-name h2 {\r\n		font-size:45px;\r\n	}\r\n	.ui-buy {\r\n		font-size:45px;\r\n	}\r\n	.nav-heading .title {\r\n		padding: 5px 0;\r\n	}\r\n	.nav li .sub {\r\n		width:80%;\r\n	}\r\n	.nav li .sub li {\r\n		width: 250px;\r\n	}\r\n	.nav-heading .d-ic-1 {\r\n		width: 216px;\r\n	}\r\n	.nav-heading {\r\n		margin: 0 10px 5px 10px;\r\n	}\r\n	.nav .box-2 .sub {\r\n		left: 160px;\r\n		width:270px;\r\n	}\r\n	.nav .box-2:hover li a, .nav .box-2.active li a {\r\n		width:240px; \r\n	}\r\n	.services_heading {\r\n		padding: 30px 0;\r\n	}\r\n	.suggestion_form {\r\n		padding: 0px;\r\n	}\r\n	#shopping-cart {\r\n		width:37%;\r\n	}	\r\n	.web-hosting-features {\r\n		margin: 0px;\r\n	}\r\n	.support {\r\n		padding: 40px 0;\r\n	}\r\n	.blue-bar {\r\n		padding: 40px 0;\r\n	}\r\n	.bulk-domain {\r\n		padding: 40px 0;\r\n	}\r\n	.domain_prices {\r\n		margin-bottom: 20px;\r\n	}\r\n	.d-pricing h4 {\r\n		margin: 20px 0;\r\n	}\r\n	.content {\r\n		margin: 0px;\r\n	}\r\n	.free-domain {\r\n		padding: 20px 0;\r\n	}\r\n	.search-box {\r\n		padding: 30px 22px 22px 37px;\r\n	}\r\n	.domain-submit, .domain-submit-disabled {\r\n		width: 80px;\r\n	}\r\n	a .menu-mid {\r\n		padding: 8px 42px;\r\n	}\r\n	.domain-search-box {\r\n		width: 96%;\r\n	}\r\n	.domains-input {\r\n		width: 77%;\r\n	}\r\n	#homepage-content .domains-select select, .domains-select select {\r\n		width: 115px;\r\n	}\r\n	.img-holder {\r\n		width:20%;\r\n	}\r\n	.text-hosting {\r\n		width: 76%;\r\n	}\r\n	.feature-list li, .feature-list1 li {\r\n		font-size: 15px;\r\n	}\r\n	.pricing-wrp p {\r\n		font-size: 22px;\r\n	}\r\n	.pricing-wrp {\r\n		width: 38%;\r\n	}\r\n	.grid-a {\r\n		width: 58%;\r\n	}\r\n	.rchosting {\r\n		width: 30%;\r\n	}\r\n	.viewcon-lock {\r\n		width: 30%;\r\n	}\r\n	.footer_grid {\r\n		\r\n	}\r\n	.plans-masthead {\r\n		width: 64%;\r\n	}\r\n	.linux-banner {\r\n		width: 36%;\r\n	}\r\n	.plan-list {\r\n		width: 24%;\r\n	}\r\n	ol.list {\r\n		width: 50%;\r\n	}\r\n	.plans-masthead li {\r\n		font-size: 15px;\r\n	}\r\n	.support-text {\r\n		width: 64%;\r\n	}\r\n	.server_loc_tabs li {\r\n		text-transform: uppercase;\r\n		font-size:16px;\r\n	}\r\n	#highlight{\r\n		margin-bottom: 15px;\r\n	}\r\n}\r\n@media all and (max-width:800px) and (min-width:640px){\r\n	.wrap{\r\n		width:740px;\r\n	}\r\n	.header {\r\n		padding: 10px 0;\r\n	}\r\n	.nav li:hover li a, .nav li.active li a, .nav li.nav-hover li a {\r\n		margin: 0px;\r\n		width:217px;\r\n	}\r\n	.nav .box-2 .sub {\r\n		left: 120px;\r\n		width:270px;\r\n	}\r\n	.nav-heading .title {\r\n		padding: 5px 0;\r\n	}\r\n	.nav li .sub {\r\n		width:100%;\r\n	}\r\n	.nav li .sub li {\r\n		width: 250px;\r\n	}\r\n	.nav-heading .d-ic-1 {\r\n		width: 216px;\r\n	}\r\n	.nav-heading {\r\n		margin: 0 10px 5px 10px;\r\n	}\r\n	.nav .box-2 .sub {\r\n		left: 125px;\r\n		width:240px;\r\n	}\r\n	#subn-1{\r\n		width:87%;\r\n	}\r\n	.nav-heading .title {\r\n		padding: 5px 0;\r\n	}\r\n	a .menu-mid {\r\n		padding: 8px 25px;\r\n	}\r\n	.cart-items {\r\n		margin-right: 38px;\r\n	}\r\n	.domain-search-box {\r\n		width: 95%;\r\n	}\r\n	#homepage-content .domains-select, .domains-select {\r\n		width: 118px;\r\n	}\r\n	.domains-input {\r\n		width: 69%;\r\n	}\r\n	.img-holder {\r\n		width: 18%;\r\n	}\r\n	.text-hosting {\r\n		width: 77%;\r\n	}\r\n	.feature-list {\r\n		width: 34%;\r\n	}\r\n	.feature-list li, .feature-list1 li {\r\n		font-size: 13px;\r\n	}\r\n	.pricing-wrp {\r\n		width: 40%;\r\n	}\r\n	.pricing-wrp p {\r\n		font-size: 20px;\r\n	}\r\n	.view-plans {\r\n		width: 155px;\r\n		margin: 16px 15px 0 0;\r\n	}\r\n	.button {\r\n		font-size:15px;\r\n		font-weight:bold;\r\n	}\r\n	.grid-a {\r\n		width: 55%;\r\n	}\r\n	.grid-left {\r\n		width: 71%;\r\n	}\r\n	.grid-b {\r\n		width: 32%;\r\n		margin-left: 15px;\r\n	}\r\n	.rchosting {\r\n		width: 29%;\r\n	}\r\n	.host-list li {\r\n		font-size: 13px;\r\n	}\r\n	.viewcon-price {\r\n		width: 59%;\r\n	}\r\n	.viewcon-price h5 {\r\n		font-size:18px;\r\n	}\r\n	.viewcon-lock {\r\n		width: 27%;\r\n		margin-top: -34px;\r\n	}\r\n	.viewcon-plans {\r\n		margin: 20px 5px 0 0;\r\n		width: 48%;\r\n	}\r\n	.con-button{\r\n		padding: 8px;\r\n		font-size:15px;\r\n	}\r\n	.viewcon-lock {\r\n		width:20%;\r\n	}\r\n	.viewcon-price {\r\n		width: 80%;\r\n	}\r\n	.footer_grid {\r\n		\r\n	}\r\n	.nav li:hover .sub, .nav li.hover .sub, .nav li.nav-hover .sub {\r\n		\r\n	}\r\n	.nav-heading .d-ic-1 {\r\n		width: 29%;\r\n	}\r\n	.nav li .sub li {\r\n		width: 202px;\r\n	}\r\n	.blue-bar {\r\n		padding: 35px 0;\r\n	}\r\n	.domain-name h2 {\r\n		font-size:40px;\r\n	}\r\n	.search-box {\r\n		padding: 28px 20px 20px 35px;\r\n	}\r\n	.domain-submit, .domain-submit-disabled {\r\n		width: 82px;\r\n	}\r\n	.ui-buy {\r\n		font-size: 40px;\r\n	}\r\n	.nav .box-2 ul {\r\n		width:240px;\r\n	}\r\n	.nav .box-2:hover li a, .nav .box-2.active li a {\r\n		width:210px; \r\n	}\r\n	.nav-heading .d-ic-2 {\r\n		width: 211px;\r\n	}\r\n	.nav li:hover .sub, .nav li.hover .sub, .nav li.nav-hover .sub {\r\n		\r\n	}\r\n	.plans-masthead {\r\n		width: 80%;\r\n	}\r\n	.linux-banner {\r\n		width: 20%;\r\n	}\r\n	.host-content h2 {\r\n		font-size:30px;\r\n		padding: 10px 0 10px;\r\n	}\r\n	.plans-masthead li {\r\n		font-size:13px;\r\n	}\r\n	li.p-dropdown select {\r\n		width:90%;\r\n	}\r\n	.plan-list {\r\n		width: 23%;\r\n	}\r\n	.server_loc_tabs li {\r\n		padding:4px 40px 0 40px;\r\n	}\r\n	.server_loc_tabs li.tab_UK {\r\n		background: url(''images123/host/dedicated.png'') no-repeat 5px 8px #fff;\r\n    }\r\n  .server_loc_tabs li.tab_IN {\r\n		background: url(''images123/host/vps.png'') no-repeat 5px 8px #fff;\r\n    }\r\n    .server_loc_tabs li.tab_US {\r\n		background: url(''images123/host/vps.png'') no-repeat 5px 8px #fff;\r\n    }\r\n    .features-wrapper {\r\n		margin: 35px 0;\r\n	}\r\n	.web-hosting-features {\r\n		margin: 0;\r\n	}\r\n	ol.list {\r\n\r\n		width: 50%;\r\n	}\r\n	.hastab.price_tabs {\r\n		width:0px;\r\n	}\r\n	.content h2, .whois-lookup h2 {\r\n		font-size:30px;\r\n	}\r\n	.rfloat {\r\n		width:53%;\r\n	}\r\n	.hastab.price_tabs {\r\n		width: 41%;\r\n	}\r\n	.sd-tarea {\r\n		width:85%;\r\n		height:100px;\r\n	}\r\n	.price-list-bar ul .first {\r\n		padding: 16px 35px 16px 0px;\r\n		width:14%;\r\n	}\r\n	.price-list-bar ul li {\r\n		width:11%;\r\n		font-size:13px;\r\n		padding: 8px 0 6px 3px;\r\n	}\r\n	#domain-box, #idn-box {\r\n       min-height: 200px;\r\n   }\r\n   .content {\r\n      margin:0;\r\n	}\r\n	.services_grid1 {\r\n		width: 48%;\r\n	}\r\n	.services_grid2 {\r\n	width: 48%;	\r\n	}\r\n	.services_desc {\r\n	 width:75%;\r\n	}\r\n	.services{\r\n		margin: 0 0 20px;\r\n	}\r\n	.services_list {\r\n		padding: 10px 0 10px 0;\r\n	}\r\n	.services_list h4 {\r\n		margin-bottom:3px;\r\n	}\r\n	.bulk-domain {\r\n		padding:35px 0;\r\n	}\r\n	.services_heading h2 {\r\n		font-size:30px;\r\n	}\r\n	.login_form {\r\n		padding:20px;\r\n	}\r\n	.d-pricing h4 {\r\n		font-size:30px;\r\n		margin:15px 0;\r\n	}\r\n	.suggestion_form th label {\r\n		padding-right:10px;\r\n	}\r\n	 .frm-select {\r\n		width:225px;\r\n	}\r\n	.suggestion_form {\r\n		padding:0px;\r\n	}\r\n	.free-domain {\r\n		padding:0;\r\n	}\r\n	.support-text {\r\n		width:75%;\r\n	}\r\n	.ui-heading {\r\n		padding:0;\r\n	}\r\n	.support {\r\n		padding:35px 0;\r\n	}\r\n	#highlight{\r\n		margin-bottom: 10px;\r\n	}\r\n	span.list-heading{\r\n		margin-bottom: 5px;\r\n	}\r\n	.domain_prices {\r\n		margin-bottom: 20px;\r\n	}\r\n	.login_form div {\r\n		margin: 0px;\r\n	}\r\n	.login_form_left {\r\n		width:400px;\r\n	}\r\n	.login_form_right {\r\n		width:300px;\r\n	}\r\n	.suggestion_form form input[type=''text''], .login_form input[type=''text''], .login_form input[type=''password''], .login_form select, .frm-select {\r\n		width: 300px;\r\n		margin: 0 15px 0 0px;\r\n		padding: 7px;\r\n	}\r\n	form td{\r\n		padding-bottom: 12px;\r\n	}\r\n	.suggestion_form table tr {\r\n		height: 0px;\r\n	}\r\n	.suggestion_form table select {\r\n		width: 256px;\r\n	}\r\n	.server_loc_tabs li {\r\n		text-transform: uppercase;\r\n		font-size:14px;\r\n	}\r\n	.web-hosting-features .features-title {\r\n		font-size:20px;\r\n	}\r\n	.web-hosting-features .features-group {\r\n		font-size:16px;\r\n	}\r\n	.server_loc_tabs li {\r\n		padding: 4px 10px 0 39px;\r\n	}\r\n	.services_grid {\r\n		margin-bottom: 20px;\r\n	}\r\n	.nav .box-2 .sub li {\r\n		width: 240px;\r\n	}\r\n	.rh {\r\n		background: url(images123/host/linux.png) no-repeat 0;\r\n		height: 30px !important;\r\n		width: 30px !important;\r\n		float: left;\r\n	}\r\n	.plan-list li {\r\n		font-size: 14px;\r\n	}\r\n	li.p-button .txt-button {\r\n		font-size: 14px;\r\n			padding: 5px 15px;\r\n	}\r\n}\r\n*/\r\n\r\n\r\n\r\n\r\n/***dominios***/\r\n\r\n.domain-name{\r\n	text-align: center;\r\n	margin-bottom: 20px;\r\n}\r\n.domain-name h2{\r\n	font-size:50px;\r\n	color:rgb(183, 226, 245);\r\n}\r\n/*-- dropdown -- */\r\n/*search box */\r\n.search-box{\r\n	padding: 38px 30px 30px 45px;\r\n	margin-bottom: 45px;\r\n	border-radius: 77px;\r\n	background-color: #8cd3ef;\r\n	background-color: rgb(255,255,255,0.2);\r\n	background-color: rgba(255,255,255,0.2);\r\n}\r\n/* Domain search box */\r\n.domain-search-box {\r\n	margin-bottom:10px;\r\n	background:#fff;\r\n	border:solid 1px #d1cfcf;\r\n	height:47px;\r\n	padding:0 0 0 20px;\r\n	border-radius:25px;\r\n	-moz-border-radius:25px;\r\n	-webkit-border-radous:25px;\r\n	-o-border-radous:25px;\r\n	-ms-border-radous:25px;\r\n	box-shadow: 0 3px 2px #b7b7b7;\r\n	-moz-box-shadow: 0 3px 2px #b7b7b7;\r\n	-webkit-box-shadow: 0 3px 2px #b7b7b7;\r\n	-o-box-shadow: 0 3px 2px #b7b7b7;\r\n	position:relative;\r\n	z-index:1;\r\n	width: 890px;}\r\n.domains-input {\r\n	background-color:#ffffff;\r\n	outline:none;\r\n	margin:0;\r\n	border:medium none;\r\n	color:#707070;\r\n	font-family: ''Modern'',Arial, Helvetica, sans-serif;\r\n	font-size:19px;\r\n	letter-spacing:1px;\r\n	padding:11px 0 12px 0;\r\n	float:left;\r\n	width: 679px;}\r\n#homepage-content .domains-select, .domains-select {\r\n    border-left: 1px solid #CCCCCC;\r\n	float: left;\r\n	font-family: ''Modern'',Arial, Helvetica, sans-serif;\r\n	height: 47px;\r\n	overflow: hidden;\r\n	position: relative;\r\n	width: 113px;\r\n	color:#707070;\r\n	font-size:19px;\r\n	cursor:pointer;}\r\n.domain-submit, .domain-submit-disabled {\r\n    border:none;\r\n	height:47px;\r\n	width:76px;\r\n	text-shadow: 1px 1px 0px #2662b6;\r\n	text-align: center;\r\n	background-color: #236fe2;\r\n	background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#61aaef), color-stop(25%, #61aaef), to(#236fe2));\r\n	background-image: -webkit-linear-gradient(#61aaef, #61aaef 25%, #236fe2);\r\n	background-image: -moz-linear-gradient(top, #61aaef, #61aaef 25%, #236fe2);\r\n	background-image: -ms-linear-gradient(#61aaef, #61aaef 25%, #236fe2);\r\n	background-image: -o-linear-gradient(#61aaef, #61aaef 25%, #236fe2);\r\n	background-image: linear-gradient(#61aaef, #61aaef 25%, #236fe2);\r\n	background-repeat: no-repeat;\r\n	border: 1px solid #5a8ddf;\r\n	-moz-border-radius:0 25px 25px 0;\r\n	-webkit-border-radius:0 25px 25px 0;\r\n	-ms-border-radius:0 25px 25px 0;\r\n	border-radius:0 25px 25px 0;\r\n	display:inline-block;\r\n	color:#ffffff;\r\n	padding:6px 24px;\r\n	font-size:22px;\r\n	font-weight:bold;\r\n	text-decoration:none;\r\n	cursor:pointer;\r\n}\r\n#go_btn.go_btn_readonly{\r\n	cursor:default;\r\n}\r\n#homepage-content .domains-select select, .domains-select select {\r\n	background: none repeat scroll 0 0 transparent;\r\n	border: 0px solid #FFF;\r\n	color: #707070;\r\n	cursor: pointer;\r\n	width:120px;\r\n	height:52px;\r\n	filter: alpha(opacity = 0);\r\n	font-size: 18px;\r\n}\r\nspan#include-free {\r\n	font-size:14px;\r\n}\r\n#region-top #transfer-domain {\r\n	bottom: 0;\r\n	font-size: 11px;\r\n	font-weight: bold;\r\n	left: 0;\r\n	margin: 0;\r\n   text-align: left;\r\n	width: 220px;\r\n	overflow:hidden;}\r\n	.tlds-dd {\r\n	position: absolute;\r\n	background: url(''images123/host/drop-arrow.png'') no-repeat right;\r\n	display: block;\r\n	top: 20px;\r\n	right: 20px;\r\n	width: 30px;\r\n	height: 11px;\r\n}\r\n.brd-fix {\r\n	opacity:0;\r\n	 -ms-filter:''progid:DXImageTransform.Microsoft.Alpha(Opacity=0)'';\r\n	filter: alpha(opacity=0);\r\n	zoom: 1;\r\n}\r\n.tlds {\r\n	position:absolute;\r\n 	top:11px; \r\n 	left:13px;\r\n}\r\n\r\n\r\n\r\n\r\n\r\n.sale-box4 {\r\n    height: 140px;\r\n    left: 0px;\r\n    overflow: hidden;\r\n    position: absolute;\r\n    text-align: center;\r\n    top: 0px;\r\n    width: 140px;\r\n}\r\n.sale-box4 span.before {\r\n	right: 89px;\r\n	background: #CB3D27;\r\n}\r\n.sale-box4 span.frete_gratis_selecao {\r\nbackground: #FFCC00;\r\n    color: #FFF;\r\n    display: block;\r\n    left: -40px;\r\n    font-size: 1em;\r\n    padding: 5px 0;\r\n    position: relative;\r\n    text-align: center;\r\n    top: 42px;\r\n    -webkit-transform: rotate(-45deg);\r\n    -moz-transform: rotate(-45deg);\r\n    -ms-transform: rotate(-45deg);\r\n    -o-transform: rotate(-45deg);\r\n    transform: rotate(-45deg);\r\n    width: 200px;\r\n    z-index: 2;\r\n    text-transform: uppercase;\r\n    border-bottom: 2px solid #FF9900;\r\n}', 'css', '');");
mysqli_query($link,"INSERT INTO `area123_layout` (`layout_sistema`, `lang`, `franquia`, `layout_id`, `layout_nome`, `layout_descricao`, `layout_codigo`, `layout_layout`, `layout_arquivo`) VALUES
('', 'pt-br', '0', 31, 'Aberto: Política de privacidade', 'Esta página irá mostrar a política de privacidade do site.', '<ol class=''breadcrumb''>\r\n  <li><a href=''./''><span class=''glyphicon glyphicon-home''></span></a></li>\r\n  <li class=''active''>Política de privacidade</li>\r\n</ol>\r\n\r\n<div class=''container-fluid''>\r\n\r\n<div class=''alert alert-info'' role=''alert''>\r\n<center>Garantia de privacidade ao acessar nosso site</center>\r\n</div>\r\n<br>\r\n<p class=''text-justify''>\r\nAo acessar nosso site não é coletado nenhuma informação pessoal ou técnica lhe garantindo o total sigilo.\r\n</p>\r\n<br>\r\n<p class=''text-justify''>\r\nAo se cadastrar neste site o associado terá total privacidade em rela&ccedil;&atilde;o as todos os dados cadastrados no sistema. Nenhuma informa&ccedil;&atilde;o será passado a terceiros.\r\n</p>\r\n\r\n<br><br><br>\r\n</div>\r\n\r\n', 'privacidade', ''),
('', 'pt-br', '0', 37, 'Aberto: Termos de uso', 'Termos de uso do site', '<ol class=''breadcrumb''>\r\n  <li><a href=''./''><span class=''glyphicon glyphicon-home''></span></a></li>\r\n  <li class=''active''>Termos de uso</li>\r\n</ol>\r\n\r\n<div class=''container-fluid''>\r\n\r\n<div class=''alert alert-info'' role=''alert''>\r\n<center>Os termos de uso visa esclarecer as condições de uso de nosso sistema. Leia atentamente os termos de uso.</center>\r\n</div>\r\n<br>\r\n<p class=''text-justify''>\r\nA informação apresentada pelo site são julgadas exatas, mas não foram \r\nverificadas independentemente. Nós não fazemos nenhuma garantia ou \r\nrepresentação. É de responsabilidade do usuário confirmar independentemente a \r\nexatidão e a integridade.<br>\r\n<br>\r\n<h3>Conduta do Usuário:</h3>\r\n<p class=''text-justify''>\r\nO usuário concorda com termo aplicável ao estado, leis nacionais e estrangeiras, \r\ne regulamentos em relação ao serviço. O usuário concorda não transmitir ou não \r\nafixar a informação que é prejudicial a outros membros. A exclusão deste website \r\nem sua única discrição, pode cancelar a senha do usuário, do cliente ou o uso \r\ndos serviços removendo e rejeitando todos os dados dentro do serviço se o \r\nusuário não cumprir com este acordo. O usuário pode terminar o serviço em cima \r\nda observação a este website em qualquer momento; entretanto, o usuário não \r\nreceberá um reembolso de qualquer parcela das taxas já pagas. Com o \r\ncancelamento, os direitos do usuário usar o serviço, as soluções web, o nome do \r\ndomínio, o projeto e as tecnologias do associado terminarão também.\r\n</p>\r\n<br>\r\n<h3>Indenização:</h3>\r\n<p class=''text-justify''>\r\nO usuário arcará com, subsidiárias, filiais, oficiais, diretores, empregados, \r\nadvogados, e agentes, e de encontro a alguns e todas as reivindicações, custos, \r\ndanos, perdas, responsabilidades, e despesas (taxas incluindo custos dos \r\nadvogados), ou em relação ao uso do usuário ao serviço (índice incluído) ou da \r\nruptura deste acordo.</p>\r\n<br>\r\n<h3>Limitação de responsabilidade:</h3>\r\n<p class=''text-justify''>\r\nEm nenhum evento esta responsabilidade do agregado do website excederá a \r\nquantidade paga realmente pelo usuário no período do mês doze imediatamente \r\nantes do evento que causa tal reivindicação. Em nenhum evento as soluções e1 \r\nserão responsáveis a qualquer um para danos indiretos, punitivos, especiais, \r\nexemplares, incidentais, conseqüências ou outros de qualquer tipo, ou em toda a \r\nmaneira conectada com este serviço, incluindo mas não limitada ao uso ou \r\ninabilidade de usar o serviço ou para qualquer índice obtido ou com do serviço, \r\na mesmo do usuário se as soluções e1 têm sido recomendadas previamente da \r\npossibilidade de tais danos.\r\n</p>\r\n<br>\r\n</div>', 'termos_de_uso', ''),
('', 'pt-br', '0', 799, 'Aberto: Anuncie', 'Página explicando como anunciar em nosso site.', '<ol class=''breadcrumb'' style=''margin-bottom: -5px;''>\r\n  <li><a href=''./''><span class=''glyphicon glyphicon-home''></span></a></li>\r\n  <li class=''active''>Anuncie em nosso site</li>\r\n</ol>\r\n\r\n<div class=''container-fluid anuncie''>\r\n\r\n<div class=''col-xs-12 col-sm-5 col-lg-5''>\r\n<br>\r\n<center><img class=''img-thumbnail'' src=''images123/engravatado.png''></center>\r\n<br><br>\r\n</div>\r\n\r\n<div class=''col-xs-12 col-sm-7 col-lg-7''>\r\n\r\nAnunciar em nosso site é fácil rápido e eficiente:<br><br>\r\n<div class=''alert alert-success'' role=''alert''>\r\n<p>\r\nAnunciar em nosso site é bem fácil, rápido e automático.\r\nTudo poderá ser feito pela internet mesmo para iniciar clique no botão cadastre-se dentro do painel terá todas as opções para vc criar seu anúncio que funcionará como um minisite. \r\n</div>\r\n<br>\r\n\r\n\r\n<div class=''alert alert-success'' role=''alert''>\r\n<p>\r\n:: Estatísticas em tempo real: Veja todos os detalhes de sua campanha;\r\n:: Painel de controle: gerencie seu banner, seus dados pessoais e pagamentos.</p>\r\n</div>\r\n<br>\r\n\r\n<div class=''alert alert-success'' role=''alert''>\r\n\r\n<p>“O mundo virtual complementa o maravilhoso mundo real ampliando-o,\r\n facilitando-o e unindo as relações pessoais e profissionais.” AL Fortes</p>\r\n</div>\r\n\r\n\r\n</div>\r\n\r\n\r\n\r\n<!----------------->\r\n\r\n<div id=''process'' class=''process''>\r\n				<div class=''head-section''>\r\n					<div class=''container''>\r\n						<h3><span>Veja</span> <label>passo a passo.</label></h3>\r\n					</div>\r\n				</div>\r\n				<div class=''container''>\r\n					<div class=''process-grids text-center wow bounce animated'' data-wow-delay=''0.4s'' style=''visibility: visible; -webkit-animation: bounce 0.4s;''>\r\n						<div class=''col-md-3 process-grid process-grid1 wow bounceInUp animated'' data-wow-delay=''0.4s'' style=''visibility: visible; -webkit-animation: bounceInUp 0.4s;''>\r\n							<span class=''p-icon1''> </span>\r\n							<h4><a href=''clientes/''>cadastre-se grátis</a></h4>\r\n						</div>\r\n						<div class=''col-md-3 process-grid process-grid2 wow bounceInDown animated'' data-wow-delay=''0.4s'' style=''visibility: visible; -webkit-animation: bounceInDown 0.4s;''>\r\n							<span class=''p-icon2''> </span>\r\n							<h4><a href=''clientes/''>efetue o login</a></h4>\r\n						</div>\r\n						<div class=''col-md-3 process-grid process-grid3 wow bounceInUp animated'' data-wow-delay=''0.4s'' style=''visibility: visible; -webkit-animation: bounceInUp 0.4s;''>\r\n							<span class=''p-icon3''> </span>\r\n							<h4><a href=''clientes/''>adicione o anúncio</a></h4>\r\n						</div>\r\n						<div class=''col-md-3 process-grid process-grid4 wow bounceInDown animated'' data-wow-delay=''0.4s'' style=''visibility: visible; -webkit-animation: bounceInDown 0.4s;''>\r\n							<span class=''p-icon4''> </span>\r\n							<h4><a href=''clientes/''>ative e sucesso</a></h4>\r\n						</div>\r\n						<div class=''clearfix''> </div>\r\n					</div>\r\n				</div>\r\n			</div>\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n</div>', 'anuncie', ''),
('', 'pt-br', '0', 237, 'Clientes: Ajuda', 'Este é o ajuda geral de funcionamento da área restrita\n', '<div>\r\nAbaixo tem as principais d&uacute;vidas questionadas pelos clientes. Caso ainda fique alguma d&uacute;vida utilize a op&ccedil;&atilde;o contato acima que iremos lhe esclarecer o mais rápido poss&iacute;vel.\r\n</div>\r\n<br>\r\n\r\n<div class=''panel panel-info''>\r\n                <div class=''panel-heading''>\r\n                  <h3 class=''panel-title''>Este sistema funciona em qualquer dispositivo ?</h3>\r\n                </div>\r\n                <div class=''panel-body''>\r\n<p class=''text-justify''>\r\nSim, ele foi desenvolvido com o que há em mais novo de layout de sites, sendo responsivo para qualquer dispositivo como Desktop, Notebook, iPag, iPhone, Smartphone, SmartTV etc.\r\n</p>\r\n                </div>\r\n</div>\r\n\r\n<div class=''panel panel-info''>\r\n                <div class=''panel-heading''>\r\n                  <h3 class=''panel-title''>A administração é toda online ?</h3>\r\n                </div>\r\n                <div class=''panel-body''>\r\n<p class=''text-justify''>\r\nSim, você pode administrar de qualquer lugar a qualquer hora totalmente online.\r\n</p>\r\n                </div>\r\n</div>\r\n\r\n<div class=''panel panel-info''>\r\n                <div class=''panel-heading''>\r\n                  <h3 class=''panel-title''>Como administrador posso personalizar o layout?</h3>\r\n                </div>\r\n                <div class=''panel-body''>\r\n<p class=''text-justify''>\r\nSim, o layout é todo editável, você pode adicionar texto, estilos, imagens cores, formatos etc.\r\n</p>\r\n                </div>\r\n</div>\r\n\r\n\r\n<div class=''panel panel-info''>\r\n                <div class=''panel-heading''>\r\n                  <h3 class=''panel-title''>Este sistema possui formas de pagamentos automatizadas ?</h3>\r\n                </div>\r\n                <div class=''panel-body''>\r\n<p class=''text-justify''>\r\nSim, este sistema possui inúmeras formas de pagamentos, a maioria automatizada.\r\n</p>\r\n                </div>\r\n</div>', 'area_manual', ''),
('', 'pt-br', '0', 242, 'Clientes: Painel - menu geral', 'Este é o menu geral da área restrita aos clientes esta parte irá aparecer para todos os cliente, em geral fica em branco usando apenas o menu interno.', '', 'menu_area', ''),
('', 'pt-br', '0', 23, 'Clientes: Painel - menu  interno', 'Menu interno da área de clientes ele é gerado automaticamente mas caso queira por conteúdo ou desenvolver um específico use este espaço.', '#MENUCLIENTES#\n<!-- O menu pode ser editado no adm > Configuração+ > Layout menu na guia menu de clientes -->', 'menu_clientes', ''),
('', 'pt-br', '0', 140, 'Clientes: Tabelas internas rodapé', 'É o rodapé das tabelas internas.', '\r\n</div>', 'tabelarodape', ''),
('', 'pt-br', '0', 139, 'Clientes: Tabelas internas topo', 'É o topo das tabelas internas.', '<ol class=''breadcrumb'' style=''margin-top: -19px;''>\r\n  <li><a href=''clientes/index.php''><span class=''glyphicon glyphicon-tasks''></span></a></li>\r\n  <li class=''active''>#CABECALHO#</li>\r\n</ol>\r\n<div class=''container-fluid''>\r\n', 'tabelatopo', ''),
('', 'pt-br', '0', '1172', 'Geral: Menu do topo', 'Adicione no layout geral o código #MENUDOTOPO#', '<!------------------------INICIO MENU------------------------------>\r\n <div  id=''sticky_navigation''  class=''navbar navbar-default  navbar-static-top'' style=''margin-bottom: 0px !important;''>\r\n      <div class=''container-fluid''>\r\n\r\n        <div class=''navbar-header text-wrap''>\r\n<a class=''navbar-brand'' href=''./''><span class=''glyphicon glyphicon-home''></span></a>\r\n\r\n<button class=''navbar-toggle'' type=''button'' data-toggle=''collapse'' data-target=''#navbar-main''>\r\n<span class=''icon-bar''></span><span class=''icon-bar''></span><span class=''icon-bar''></span>\r\n</button>\r\n\r\n        </div>\r\n\r\n\r\n        <div class=''navbar-collapse collapse'' id=''navbar-main''>\r\n          <ul class=''nav navbar-nav navbar-right''>\r\n#MENUTOPO##LOGIN#\r\n          </ul>\r\n        </div>\r\n\r\n      </div>\r\n</div>\r\n<!------------------------FIM MENU------------------------------>', 'menudotopo', '');
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `area123_menu` (
  `menu_sistema` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `menu_id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_tipo` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `menu_cat` int(5) NOT NULL,
  `menu_url` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `menu_nome` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `menu_ordem` int(10) NOT NULL,
  `menu_restricao` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `menu_status` int(1) NOT NULL,
  UNIQUE KEY `menu_id` (`menu_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=1690 ;
");


mysqli_query($link,"INSERT INTO `area123_menu` VALUES('', 1, '', 0, '', 'Topo geral do site - coloque a tag no site #MENUTOPO#', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('', 2, '', 0, '', 'Rodapé geral do site - coloque a tag no site #MENURODAPE#', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('', 3, '', 0, '', 'Painel do cliente geral - coloque a tag no site #MENUCLIENTES#', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('', 4, '', 0, '', 'Atalhos do ADM (somente menus)', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('', 5, '', 0, '', 'Menus para o ADM', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1248, '', 1, 'resultado.php', 'Todas', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1251, '', 3, 'clientes/#', 'Configurações', 40, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1252, '', 1251, 'clientes/clientes_editar.php', 'Meu dados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1253, '', 1251, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1254, '', 3, 'clientes/encontros123_edtadulto.php', 'Meu perfil', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1255, '', 1254, 'clientes/encontros123_edtphotos.php', 'Foto principal', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1256, '', 1254, 'clientes/encontros123_photos_extras.php', 'Fotos extras', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1257, '', 1254, 'clientes/encontros123_edtadulto.php', 'Detalhes', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1258, '', 1254, 'clientes/encontros123_excluir.php', 'Excluir perfil', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1259, '', 3, 'clientes/encontros123_ativacao.php', 'Ativação', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1260, '', 1259, 'clientes/encontros123_ativacao.php', 'Status', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1261, '', 1259, 'clientes/pagamentos123_confirmar.php', 'Confirmar pagamento', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1262, '', 1259, 'clientes/pagamentos123_recibos.php', 'Recibos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1263, '', 3, 'clientes/area123_ajuda.php', 'Ajuda', 50, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1683, '', 1677, 'guia123_categorias.php', 'Ver todas as demais', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1275, '', 1267, 'busca_detalhada.php', 'Busca detalhada', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1271, '', 1268, 'quem_somos.php', 'Quem somos ?', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1267, '', 2, '', 'Opções', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1268, '', 2, '', 'Institucional', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1285, '', 2, '', '#FACEBOOK#', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1278, '', 2, '', 'Newsletter', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1273, '', 1268, 'contato.php', 'Contato', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1274, '', 1268, 'duvidas.php', 'Dúvidas', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1276, '', 1267, 'saiba_mais.php', 'Como anunciar ?', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1277, '', 1267, 'parceiros.php', 'Parceiros', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1286, '', 1267, 'clientes/clientes_cadastrar.php', 'Cadastre-se', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1281, '', 1278, '', '#NEWSLETTER#', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1287, '', 1267, 'clientes/index.php', 'Painel do cliente', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1288, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1289, '', 1, 'escritorio.php', 'O ESCRITÓRIO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1290, '', 1, 'atuacao.php', 'ATUAÇÃO', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1292, '', 1, 'jurisprudencia.php', 'JURISPRUDÊNCIA', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1293, '', 1, 'legislacao.php', 'LEGISLAÇÃO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1294, '', 1, 'artigos.php', 'ARTIGOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1295, '', 3, 'clientes/#', 'Configurações', 30, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1296, '', 1295, 'clientes/clientes_editar.php', 'Meus dados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1297, '', 1295, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1298, '', 3, 'clientes/adv123_processos_lista.php', 'Processos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1299, '', 1298, 'clientes/adv123_processos_lista.php', 'Listar processos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1300, '', 1298, 'clientes/adv123_recebimentos.php', 'Dados para recebimento', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1301, '', 3, 'clientes/contabilidade123_contratos_lista.php', 'Contabilidade', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1302, '', 1301, 'clientes/contabilidade123_contratos_lista.php', 'Lista de contratos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1303, '', 3, 'clientes/area123_ajuda.php', 'Ajuda', 35, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dominios123', 1657, '', 1411, 'clientes/clientes_editar.php', 'MEUS DADOS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1306, '', 1, 'index.php', 'Inicial', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1307, '', 1, 'cursos.php', 'Cursos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1308, '', 1, 'agenda.php', 'Agenda', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1309, '', 1, 'noticia.php', 'Notícias', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1310, '', 1, 'parceiros.php', 'Parceiros', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1311, '', 1, 'duvidas.php', 'Dúvidas', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1312, '', 1, 'clientes/clientes_cadastrar.php', 'Cadastre-se', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1313, '', 1, 'contato.php', 'Contato', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1314, '', 1, 'clientes/index.php', 'Painel', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1315, '', 3, 'clientes/#', 'Configurações', 25, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1316, '', 3, 'clientes/alunos123_clientes_contas.php', 'Meus cursos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1317, '', 1316, 'clientes/alunos123_clientes_contas.php', 'Listar', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1318, '', 1316, 'clientes/alunos123_clientes_adicionar.php', 'Adicionar', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1319, '', 3, 'clientes/boletim.php', 'Boletim', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1324, '', 3, 'clientes/area123_ajuda.php', 'Ajuda', 30, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1321, '', 1315, 'clientes/clientes_editar.php', 'Meus dados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1322, '', 1315, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('alunos123', 1323, '', 1315, 'clientes/clientes_foto.php', 'Minha foto', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 32, '', 3, 'clientes/#', 'Configurações', 30, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 55, '', 32, 'clientes/index.php', 'Inicial', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 35, '', 1, 'index.php', 'Inicial', 0, '1|2|3|4', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 36, '', 1, 'funcionamento.php', 'Funcionamento', 0, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 93, '', 2, '', 'INSTITUCIONAL', 6, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 38, '', 1, 'duvidas.php', 'Dúvidas', 0, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 39, '', 1, 'contato.php', 'Contato', 0, '1|2|3|4', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 113, '', 1, 'clientes/clientes_cadastrar.php', 'Cadastre-se', 0, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 94, '', 2, '', 'NOSSOS SERVIÇOS', 4, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 95, '', 2, '', 'NEWSLETTER', 10, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 96, '', 93, 'quem_somos.php', 'QUEM SOMOS ?', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 97, '', 93, 'termos_de_uso.php', 'TERMOS DE USO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 58, '', 32, 'clientes/marketing123_usuario.php', 'Nome de associado', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 57, '', 32, 'clientes/clientes_foto.php', 'Minha foto', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 56, '', 32, 'clientes/clientes_editar.php', 'Meus dados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 59, '', 32, 'clientes/area123_clientes_layout.php', 'Editar mini-site', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 60, '', 32, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 61, '', 3, 'clientes/#', 'Pagamentos', 10, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 62, '', 61, 'clientes/dinheiro123_conta_virtual.php', 'Conta virtual', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 63, '', 61, 'clientes/marketing123_sacar.php', 'Sacar dinheiro', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 64, '', 61, 'clientes/pagamentos123_efetuar.php', 'Efetuar pagamento', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 65, '', 61, 'clientes/pagamentos123_confirmar.php', 'Confirmar pagamento', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 66, '', 61, 'clientes/pagamentos123_recibos.php', 'Recibos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 67, '', 61, 'clientes/dinheiro123_cancelar.php', 'Cancelar', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 68, '', 3, 'clientes/#', 'Minha rede', 10, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 69, '', 68, 'clientes/marketing123_ind_numeros.php', 'Números de indicados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 70, '', 68, 'clientes/dinheiro123_ativos.php', 'Lista de Indicados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 71, '', 68, 'clientes/marketing123_ind_img.php', 'Lista gráfica', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 72, '', 68, 'clientes/marketing123_fotos.php', 'Lista com fotos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 73, '', 68, 'clientes/dinheiro123_rede_total.php', 'Rede total linear', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 74, '', 68, 'clientes/marketing123_linear_grupos.php', 'Rede linear grupos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 75, '', 3, 'clientes/#', 'Divulgação da rede', 25, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 76, '', 75, 'clientes/dinheiro123_email.php', 'Divulgação por e-mail', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 77, '', 75, 'clientes/dinheiro123_banner.php', 'Divulgação por banner', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 78, '', 75, 'clientes/dinheiro123_links.php', 'Divulgação por links', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 79, '', 3, 'clientes/#', 'Material/e-books', 20, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 80, '', 79, 'clientes/mdl123_arquivos.php', 'Arquivos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 81, '', 3, 'clientes/area123_ajuda.php', 'Ajuda', 35, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1628, '', 75, 'clientes/area123_compartilhar.php', 'Compartilhar em redes sociais', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 99, '', 94, 'funcionamento.php', 'FUNCIONAMENTO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 98, '', 93, 'privacidade.php', 'POLÍTICA DE PRIVACIDADE', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 100, '', 94, 'clientes/clientes_cadastrar.php', 'CADASTRE-SE', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1668, '', 94, 'clientes/', 'ESCRITÓRIO VIRTUAL', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1233, '', 1, 'produtos.php', 'Produtos', 0, '1|2|3|4', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1232, '', 1, 'clientes/index.php', 'Painel', 0, '1|2|3|4', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1234, '', 3, 'clientes/loja123_pedidos.php', 'Meus pedidos', 17, '1|2|3|4', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1356, '', 61, 'clientes/marketing123_transferencia.php', 'Transferência', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1325, '', 1, 'index.php', 'Inicial', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1326, '', 1, 'anuncie.php', 'Anuncie', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1648, '', 93, '', '#REDESOCIAL#', 0, '', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1328, '', 1, 'contato.php', 'Contato', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1329, '', 2, '', 'Guia', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1330, '', 2, '', 'Institucional', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1331, '', 2, '', 'Newsletter', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1332, '', 1329, 'parceiros.php', 'Nosso parceiros', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1333, '', 1329, 'anuncie.php', 'Anuncie seu negócio', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1334, '', 1329, 'clientes/index.php', 'Painel de controle', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1335, '', 1330, 'quem_somos.php', 'Quem somos ?', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1336, '', 1330, 'termos_de_uso.php', 'Termos de uso', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1337, '', 1330, 'privacidade.php', 'Política de privacidade', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1676, '', 1331, '', '#NEWSLETTER#', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1340, '', 3, 'clientes/#', 'Configurações', 20, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1341, '', 1340, 'clientes/clientes_editar.php', 'Meus dados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1342, '', 1340, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1343, '', 3, 'clientes/guia123_clientes_guia.php', 'Meus anúncios', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1344, '', 1343, 'clientes/guia123_clientes_guia.php', 'Listar anúncios', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1345, '', 1343, 'clientes/guia123_clientes_adicionar.php', 'Adicionar anúncio', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1346, '', 3, 'clientes/guia123_clientes_planos.php', 'Pagamentos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1353, '', 1346, 'clientes/guia123_clientes_planos.php', 'Listar planos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1349, '', 1346, 'clientes/pgto_adicionar.php', 'Adquirir créditos', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1350, '', 3, 'clientes/area123_ajuda.php', 'Ajuda', 25, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1354, '', 1346, 'clientes/guia123_clientes_pedidos.php', 'Lista de pedidos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 116, '', 3, 'clientes/#', 'Configurações', 1, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 117, '', 3, 'clientes/loja123_pedidos.php', 'Lista de Pedidos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 118, '', 3, 'clientes/#', 'Pagamentos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 119, '', 3, 'clientes/#', 'Material/e-books', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 120, '', 3, 'clientes/area123_ajuda.php', 'Ajuda', 2, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 124, '', 116, 'clientes/clientes_editar.php', 'Meus dados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1629, '', 1, 'index.php', 'INICIAL', 0, '', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 123, '', 116, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1630, '', 1, 'departamentos.php', 'PRODUTOS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1212, '', 118, 'clientes/pagamentos123_confirmar.php', 'Confirmar pagamento', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1213, '', 118, 'clientes/pagamentos123_efetuar.php', 'Efetuar pagamento', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1214, '', 118, 'clientes/pagamentos123_recibos.php', 'Recibos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1215, '', 119, 'clientes/mdl123_arquivos.php', 'Arquivos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('painel123', 1237, '', 1, 'contato.php', 'CONTATO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('painel123', 1238, '', 3, 'clientes/index.php', 'Inicial', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('painel123', 1243, '', 3, 'clientes/suporte123.php', 'Contato', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('painel123', 1240, '', 1238, 'clientes/index.php', 'Instrodução', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('painel123', 1241, '', 1238, 'clientes/clientes_editar.php', 'Dados pessoais', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('painel123', 1242, '', 1238, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('servicos123', 1218, '', 3, 'clientes/#', 'Configurações', 30, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('servicos123', 1219, '', 3, 'clientes/servicos123_servicos.php', 'Orçamento/Pagamento', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('servicos123', 1220, '', 3, 'clientes/servicos123_fotos.php', 'Fotos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('servicos123', 1221, '', 3, 'clientes/area123_ajuda.php', 'Ajuda', 40, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1665, '', 1362, 'clientes/clientes_preferencias.php', 'Preferências', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1664, '', 1362, 'clientes/clientes_editar.php', 'Dados pessoais', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('servicos123', 1225, '', 1218, 'clientes/clientes_editar.php', 'Meus dados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('servicos123', 1226, '', 1218, 'clientes/clientes_foto.php', 'Minha foto', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('servicos123', 1227, '', 1218, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('servicos123', 1228, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('servicos123', 1229, '', 1, 'clientes/index.php', 'MINHA CONTA', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('servicos123', 1230, '', 1, 'clientes/clientes_cadastrar.php', 'CADASTRE-SE', 10, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('servicos123', 1231, '', 1, 'contato.php', 'CONTATO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1357, '', 1, 'parceiros.php', 'Parceiros', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1358, '', 1, 'duvidas.php', 'Dúvidas', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1359, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1360, '', 1, 'clientes/index.php', 'MEUS PROTOCOLOS', 2, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1361, '', 1, 'suporte/', 'CHAT', 3, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1362, '', 3, 'clientes/#', 'Configurações', 30, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1363, '', 3, 'clientes/suporte123_tickets_ver.php', 'Suporte', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1365, '', 1363, 'clientes/suporte123_ticket_adicionar.php', 'Abrir tickets', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1366, '', 1363, 'clientes/suporte123_tickets_ver.php', 'Ver tickets', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1367, '', 1363, 'clientes/suporte123_chat.php', 'Chat', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1368, '', 3, 'clientes/area123_ajuda.php', 'Ajuda', 40, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('modulos123', 1369, '', 1, 'index.php', 'Inicial', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('modulos123', 1370, '', 1, 'parceiros.php', 'Parceiros', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('modulos123', 1371, '', 1, 'noticia.php', 'Notícias', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('modulos123', 1373, '', 1, 'duvidas_frequentes.php', 'Dúvidas', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('modulos123', 1375, '', 1, 'agenda.php', 'Agenda', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('modulos123', 1377, '', 1, 'mural.php', 'Mural', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('modulos123', 1378, '', 1, 'contato.php', 'Contato', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1389, '', 3, 'clientes/index.php', 'INTRODUÇÃO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1382, '', 1, 'clientes/clientes_cadastrar.php', 'CADASTRAR', 5, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1383, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1385, '', 1, 'vagas.php', 'VAGAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1386, '', 1, 'curriculos.php', 'CURRÍCULOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1387, '', 1, 'clientes/index.php', 'PAINEL DE CONTROLE', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1388, '', 1, 'clientes/clientes_cadastrar.php', 'CADASTRE-SE', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1390, '', 1389, 'clientes/clientes_editar.php', 'Meus dados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1391, '', 1389, 'clientes/clientes_foto.php', 'Minha foto', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1392, '', 1389, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1393, '', 3, 'clientes/empregos123_curriculo_cadastrar.php', 'CANDIDATOS', 0, '1', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('baladas123', 1449, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1395, '', 1393, 'clientes/empregos123_curriculo_editar.php', 'Cadastrar/Editar currículo', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1396, '', 1393, 'clientes/empregos123_curriculo_prever.php', 'Ver currículo', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1397, '', 1393, 'clientes/empregos123_curriculo_ativar.php', 'Ativar sua conta', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1398, '', 3, 'clientes/empregos123_vagas_cadastrar.php', 'EMPRESAS', 0, '2', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1399, '', 1398, 'clientes/empregos123_vagas_cadastrar.php', 'Cadastrar vaga', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1400, '', 1398, 'clientes/empregos123_vagas_listar.php', 'Listar vaga', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1401, '', 1398, 'clientes/empregos123_vagas_empresa.php', 'Dados da empresa', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1402, '', 3, 'clientes/suporte123.php', 'AJUDA', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('pedidos123', 1408, '', 1, 'acompanhar.php', 'ACOMPANHAR PEDIDO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('pedidos123', 1407, '', 1, 'pedidos.php', 'EFETUAR PEDIDO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('pedidos123', 1406, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('pedidos123', 1409, '', 1, 'duvidas.php', 'DÚVIDAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('host123', 1410, '', 3, 'clientes/#', 'CONFIGURAÇÕES', 30, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dominios123', 1411, '', 3, 'clientes/#', 'CONFIGURAÇÕES', 30, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('host123', 1412, '', 3, 'clientes/host123_clientes_contas.php', 'HOSPEDAGEM', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('host123', 1413, '', 1412, 'clientes/host123_clientes_contas.php', 'LISTAR CONTAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('host123', 1414, '', 1412, 'clientes/host123_clientes_adicionar.php', 'ADICIONAR CONTA', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dominios123', 1415, '', 3, 'clientes/dominios123_clientes_contas.php', 'DOMÍNIOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dominios123', 1416, '', 1415, 'clientes/dominios123_clientes_contas.php', 'LISTAR DOMÍNIOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dominios123', 1417, '', 1415, 'clientes/dominios123_clientes_buscar_dominio.php', 'ADICIONAR DOMÍNIOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('host123', 1418, '', 3, 'clientes/area123_ajuda.php', 'AJUDA', 40, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dominios123', 1419, '', 3, 'clientes/area123_ajuda.php', 'AJUDA', 40, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('host123', 1420, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dominios123', 1421, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dominios123', 1422, '', 1, 'extensoes.php', 'EXTENSÕES/PREÇOS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('host123', 1423, '', 1, 'planos_de_hospedagem.php', 'PLANOS DE HOSPEDAGEM', 0, '', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('host123', 1424, '', 1, 'duvidas.php', 'DÚVIDAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('host123', 1425, '', 1, 'clientes/index.php', 'PAINEL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dominios123', 1426, '', 1, 'duvidas.php', 'DÚVIDAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dominios123', 1427, '', 1, 'clientes/index.php', 'PAINEL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('host123', 1428, '', 1, 'contato.php', 'CONTATO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dominios123', 1429, '', 1, 'contato.php', 'CONTATO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1430, '', 3, 'clientes/index.php', 'Configurações', 30, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1431, '', 1430, 'clientes/clientes_editar.php', 'Meu dados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1432, '', 3, 'clientes/imb123_clientes_listar.php', 'Meus imóveis', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1433, '', 1432, 'clientes/imb123_clientes_listar.php', 'Listar imóveis', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1434, '', 1432, 'clientes/imb123_clientes_adicionar.php', 'Adicionar novo', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1435, '', 3, 'clientes/imb123_clientes_planos_adquirir.php', 'Créditos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1436, '', 1435, 'clientes/imb123_clientes_planos.php', 'Pedidos de créditos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1437, '', 1435, 'clientes/imb123_clientes_planos_adquirir.php', 'Adquirir créditos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1438, '', 1435, 'clientes/pagamentos123_recibos.php', 'Recibos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1447, '', 1386, 'clientes/empregos123_curriculo_cadastrar.php', 'CADASTRE SEU CURRÍCULO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1440, '', 3, 'clientes/area123_ajudar.php', 'Ajuda', 40, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1441, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1442, '', 1, 'busca_avancada.php', 'BUSCAR', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1443, '', 1, 'anuncie.php', 'ANUNCIAR', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1444, '', 1, 'duvidas.php', 'DÚVIDAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1445, '', 1, 'clientes/index.php', 'MINHA CONTA', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('imb123', 1446, '', 1, 'contato.php', 'CONTATO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('empregos123', 1448, '', 1385, 'clientes/empregos123_vagas_cadastrar.php', 'CADASTRE UMA VAGA', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('baladas123', 1450, '', 1, 'coberturas.php', 'COBERTURAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('baladas123', 1451, '', 1, 'agenda.php', 'AGENDA', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('baladas123', 1452, '', 1, 'mural.php', 'MURAL', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('baladas123', 1453, '', 1, 'parceiros.php', 'PARCEIROS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('baladas123', 1454, '', 1, 'anuncie.php', 'ANUNCIE', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('baladas123', 1455, '', 1, 'chame_nos.php', 'CHAME-NOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1457, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1458, '', 1, 'estoque.php', 'ESTOQUE', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1459, '', 1, 'parceiros.php', 'PARCEIROS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1460, '', 1, 'vender.php', 'VENDER', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1461, '', 1, 'clientes/index.php', 'PAINEL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1462, '', 3, 'clientes/#', 'Configurações', 15, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1463, '', 3, 'clientes/autos123_clientes_autos.php', 'Meus anúncios', 5, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1464, '', 1463, 'clientes/autos123_clientes_autos.php', 'Veículos cadastrados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1465, '', 1463, 'clientes/autos123_clientes_adicionar.php', 'Adicionar veículo', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1466, '', 3, 'clientes/autos123_clientes_planos.php', 'Créditos', 10, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1476, '', 1462, 'clientes/clientes_foto.php', 'Foto/Logo', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1475, '', 1462, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1474, '', 1462, 'clientes/clientes_editar.php', 'Meus dados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1470, '', 3, 'clientes/autos123_funcionamento.php', 'Ajuda', 20, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1471, '', 1466, 'clientes/autos123_clientes_planos.php', 'Lista de pedidos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1472, '', 1466, 'clientes/autos123_clientes_planos_adquirir.php', 'Adquirir créditos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1473, '', 1466, 'clientes/pagamentos123_recibos.php', 'Recibos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1477, '', 1, 'agencias.php', 'AGÊNCIAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1478, '', 1, 'contato.php', 'CONTATO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1479, '', 1, 'index.php', 'INICIAL', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1480, '', 1, 'buscas.php', 'BUSCAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1481, '', 1, 'ultimos.php', 'ULTIMOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1482, '', 1, 'mais_visitados.php', 'MAIS VISITADOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1483, '', 1, 'member_login.php', 'LOGAR', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1484, '', 1, 'register.php', 'CADASTRAR', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1485, '', 2, '', 'CLASSIFICADOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1486, '', 1485, 'buscas.php', 'BUSCAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1487, '', 1485, 'member.php', 'LOGAR', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1488, '', 1485, 'register.php', 'CADASTRAR', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1489, '', 1485, 'wap.php', 'WAP', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1490, '', 1485, 'imagens.php', 'IMAGENS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1491, '', 1485, 'ultimos.php', 'ÚLTIMOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1492, '', 1485, 'mais_visitados.php', 'MAIS VISITADOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1493, '', 1485, 'melhores.php', 'MELHORES', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1494, '', 1485, 'favoritos.php', 'FAVORITOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1495, '', 2, '', 'INSTITUCIONAL', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1496, '', 2, '', 'SAC', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1497, '', 2, '', '#NEWSLETTER#', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('publicidade123', 1498, '', 3, 'clientes/#', 'CONFIGURAÇÕES', 40, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('publicidade123', 1499, '', 3, '#', 'PUBLICIDADE', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('publicidade123', 1500, '', 1499, 'clientes/publicidade123_banner_listar.php', 'LISTAR BANNERS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('publicidade123', 1501, '', 1499, 'clientes/publicidade123_banner_adicionar.php', 'ADICIONAR BANNERS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('publicidade123', 1502, '', 3, 'clientes/area123_ajuda.php', 'AJUDA', 40, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('publicidade123', 1503, '', 1498, 'clientes/clientes_editar.php', 'MEUS DADOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('publicidade123', 1504, '', 1498, 'clientes/clientes_foto.php', 'MINHA FOTO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('publicidade123', 1505, '', 1498, 'clientes/clientes_preferencias.php', 'PREFERÊNCIAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('servicos123', 1663, '', 1, 'duvidas.php', 'DUVIDAS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1510, '', 3, 'clientes/#', 'CONFIGURAÇÕES', 30, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1511, '', 3, 'clientes/encontros123_edicao.php', 'MEU PERFIL', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1512, '', 3, 'clientes/encontros123_ativacao.php', 'ATIVAÇÃO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1513, '', 1512, 'clientes/encontros123_ativacao.php', 'STATUS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1514, '', 1512, 'clientes/pagamentos123_confirmar.php', 'CONFIRMAR PAGAMENTO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1515, '', 1512, 'clientes/pagamentos123_recibos.php', 'RECIBOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1516, '', 3, 'clientes/area123_ajuda.php', 'AJUDA', 40, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1517, '', 1511, 'clientes/encontros123_edicao.php', 'VER MEU PERFIL', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1518, '', 1511, 'clientes/encontros123_edtphotos.php', 'FOTO PRINCIPAL', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1519, '', 1511, 'clientes/encontros123_photos_extras.php', 'FOTOS EXTRAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1520, '', 1511, 'clientes/encontros123_edtgeral.php', 'GERAL', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1521, '', 1511, 'clientes/encontros123_edteuacho.php', 'EXTRAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1522, '', 1511, 'clientes/encontros123_excluir.php', 'EXCLUIR', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('pedidos123', 1523, '', 1, 'contato.php', 'CONTATO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1524, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1525, '', 1, 'busca_detalhada.php', 'BUSCA', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1526, '', 1, 'clientes/index.php', 'MINHA CONTA', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1527, '', 1, 'clientes/clientes_cadastrar.php', 'CADASTRAR', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1528, '', 1, 'duvidas.php', 'DÚVIDAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1529, '', 1, 'contato.php', 'CONTATO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1530, '', 1510, 'clientes/clientes_preferencias.php', 'PREFERÊNCIAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('encontros123', 1531, '', 1510, 'clientes/clientes_editar.php', 'DADOS PESSOAIS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1532, '', 3, 'clientes/index.php', 'Introdução', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1533, '', 3, 'clientes/member.php', 'Classificados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('classificados123', 1534, '', 1533, 'clientes/add_ad_cat.php', 'Adicionar anúncio', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1536, '', 1535, 'clientes/consumo_cliente_consumo.php', 'Bônus Consumo', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1537, '', 1535, 'clientes/consumo_cliente_relatorios.php', 'Bônus Duplicação', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1538, '', 1535, 'clientes/consumo_cliente_estabelecimento.php', 'Bônus Estabelecimento', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1539, '', 3, 'clientes/marketing123_lojista_lancamentos.php', 'MMN Consumo Lojista', 15, '1', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1540, '', 1539, 'clientes/marketing123_lojista_lancamentos.php', 'Lançamentos', 0, '1', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1542, '', 1539, 'clientes/pgto_adicionar.php', 'Adicionar crédito', 0, '1', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1544, '', 68, 'clientes/marketing123_3x3_grafico.php', 'Marketing 3x3', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1545, '', 68, 'clientes/marketing123_2x2_grafico.php', 'Marketing 2x2', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1546, '', 1, 'index.php', 'INICIAL', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1547, '', 1, 'escritorio.php', 'QUEM SOMOS?', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1548, '', 1, 'atuacao.php', 'NOSSO SERVIÇOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1549, '', 1, 'contato.php', 'CONTATOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1550, '', 1, 'clientes/index.php', 'PAINEL DO CLIENTE', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1551, '', 3, 'clientes/index.php', 'Introdução', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1552, '', 3, 'clientes/contabilidade123_contratos_lista.php', 'Contratos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1553, '', 3, 'clientes/area123_arquivos.php', 'Meus arquivos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1554, '', 3, 'suporte123.php', 'Ajuda', 10, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1559, '', 1551, 'clientes/clientes_foto.php', 'Minha foto', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1560, '', 1551, 'clientes/clientes_editar.php', 'Meus dados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1558, '', 1551, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1561, '', 3, 'clientes/pagamentos123_efetuar.php', 'Pagamentos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1562, '', 1561, '', 'Pagamentos avulsos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1563, '', 1561, 'clientes/pagamentos123_confirmar.php', 'Confirmar pagamento', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('contabilidade123', 1564, '', 1561, 'clientes/pagamentos123_recibos.php', 'Recibos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1565, '', 61, 'clientes/pgto_adicionar.php', 'Adicionar crédito', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1566, '', 32, 'clientes/area123_redes_sociais.php', 'Facebook', 0, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('suporte123', 1567, '', 1, 'duvidas.php', 'DÚVIDAS', 1, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1568, '', 68, 'clientes/marketing123_binario_relatorio.php', 'Relatório binário', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1569, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1570, '', 1, 'artigos.php', 'ARTIGOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1571, '', 1, 'fotos.php', 'FOTOS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1572, '', 1, 'forum.php', 'FÓRUM', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1573, '', 1, 'editorias.php', 'EDITORIAS', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1574, '', 1, 'contato.php', 'CONTATO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1575, '', 2, '', 'Sessões', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1576, '', 2, '', 'Institucional', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1577, '', 2, '', '#FACEBOOK#', 0, '1', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1578, '', 2, '', 'NEWSLETTER', 0, '1', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1579, '', 1575, 'index.php', 'Inicial', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1580, '', 1575, 'editorias.php', 'Editorias', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1581, '', 1575, 'artigos.php', 'Artigos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1582, '', 1575, 'fotos.php', 'Fotos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1583, '', 1575, 'forum.php', 'Fórum', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1584, '', 1576, 'quem_somos.php', 'Quem somos ?', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1585, '', 1576, 'termos_de_uso.php', 'Termos de uso', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1586, '', 1576, 'privacidade.php', 'Privacidade', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1587, '', 1576, 'parceiros.php', 'Parceiros', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1590, '', 3, 'clientes/clientes_editar.php', 'Meu cadastro', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1591, '', 3, 'clientes/clientes_foto.php', 'Minha foto', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1592, '', 3, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1596, '', 68, 'clientes/marketing123_upgrade.php', 'Upgrade de plano', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1597, '', 68, 'clientes/marketing123_anuncios_postar.php', 'Anúncios postar', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1598, '', 68, 'clientes/marketing123_anuncios_relatorio.php', 'Anúncios relatório', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1599, '', 61, 'clientes/marketing123_upgrade.php', 'Upgrade', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1600, '', 1, 'contato.php', 'CONTATO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('adv123', 1601, '', 1301, 'clientes/area123_arquivos.php', 'Meus arquivos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1602, '', 61, 'clientes/dinheiro123_dados_recebimentos.php', 'Dados para recebimento', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1603, '', 3, 'clientes/#', 'Configurações', 30, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1604, '', 1603, 'clientes/clientes_editar.php', 'Meus dados', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1605, '', 1603, 'clientes/clientes_preferencias.php', 'Preferências', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1606, '', 3, 'clientes/#', 'Relatórios', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1607, '', 1606, 'clientes/condominio_clientes_despesas.php', 'Despesa mensal', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1608, '', 1606, 'clientes/pgto_receitas.php', 'Receita mensal', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1609, '', 1606, 'clientes/pgto_receitas_pendentes.php', 'Receitas pendentes', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1610, '', 1606, 'clientes/pgto_saldo.php', 'Saldo', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1611, '', 3, 'clientes/mdl_forum.php', 'Forum', 0, '1', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1612, '', 3, 'clientes/mdl123_arquivos.php', 'Ver arquivos/planilhas', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1613, '', 3, 'clientes/', 'Pagamentos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1614, '', 1613, 'clientes/pagamentos123_efetuar.php', 'Efetuar pagamento', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1615, '', 1613, 'clientes/pagamentos123_confirmar.php', 'Confirmar pagamento', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1616, '', 1613, 'clientes/pagamentos123_recibos.php', 'Recibos', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1617, '', 3, 'clientes/area123_ajuda.php', 'Ajuda', 35, '1|2|3|4', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1618, '', 1, 'index.php', 'INICIAL', 0, '0', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1619, '', 1, 'clientes/index.php', 'PAINEL DO CONDÔMINO', 0, '1', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('condominio123', 1620, '', 1, 'contato.php', 'CONTATO', 0, '0', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1625, '', 2, '', 'FACEBOOK', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1626, '', 1625, '', '#FACEBOOK#', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1669, '', 2, '', 'FACEBOOK', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1631, '', 1630, '', '#DEPARTAMENTOS#', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1632, '', 1, 'produtos_ofertas.php', 'OFERTAS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1634, '', 1, 'duvidas.php', 'DÚVIDAS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1635, '', 1, 'contato.php', 'CONTATOS', 0, '', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1636, '', 2, '', 'NEWSLETTER', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1637, '', 2, '', 'NOSSOS SERVIÇOS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1638, '', 2, '', 'ATENDIMENTO', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1639, '', 1638, 'duvidas.php', 'DÚVIDAS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1640, '', 1638, 'contato.php', 'CONTATO', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1641, '', 1637, 'produtos_lista.php', 'LISTA IMPRESSÃO', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1642, '', 1637, 'produtos_tabela.php', 'TABELA DE PREÇOS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1643, '', 1637, 'departamentos.php', 'DEPARTAMENTOS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1644, '', 1638, 'rastrear.php', 'RASTREAR', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1645, '', 1638, 'garantia.php', 'GARANTIA', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1646, '', 1636, '', '#NEWSLETTER#', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1649, '', 95, '', '#NEWSLETTER#', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('autos123', 1650, '', 1, 'clientes/clientes_cadastrar.php', 'CADASTRE-SE', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1653, '', 1, 'clientes/clientes_cadastrar.php', 'Cadastre-se', 0, '', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dominios123', 1658, '', 1411, 'clientes/clientes_preferencias.php', 'PREFERÊNCIAS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('host123', 1659, '', 1410, 'clientes/clientes_editar.php', 'MEUS DADOS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('host123', 1660, '', 1410, 'clientes/clientes_preferencias.php', 'PREFERÊNCIAS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('publicidade123', 1661, '', 1, 'clientes/clientes_cadastrar.php', 'Cadastre-se para anunciar', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('publicidade123', 1662, '', 1, 'contato.php', 'Contato', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1666, '', 93, 'duvidas.php', 'DÚVIDAS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('dinheiro123', 1667, '', 93, 'contato.php', 'CONTATO', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1670, '', 1669, '', '#FACEBOOK#', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('loja123', 1671, '', 1638, 'quem_somos.php', 'QUEM SOMOS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1672, '', 2, '', 'Facebook', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1673, '', 1672, '', '#FACEBOOK#', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1674, '', 1330, 'duvidas.php', 'Dúvidas frequentes', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1675, '', 1330, 'contato.php', 'Formulário de contato', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1677, '', 1, '', 'CATEGORIAS', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1678, '', 1677, '', '#GUIACATNAV#', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1679, '', 1, '', 'DEFINIR CIDADE', 0, '', 0);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('guia123', 1680, '', 1679, '', '#GUIACIDADENAV#', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1684, '', 1578, '', '#NEWSLETTER#', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1685, '', 1576, 'contato.php', 'Fale conosco', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('blog123', 1686, '', 1, 'anuncie.php', 'ANUNCIE', 0, '', 1);
");
mysqli_query($link,"INSERT INTO `area123_menu` VALUES('acompanhantes123', 1689, '', 1, 'anuncie.php', 'Anuncie', 0, '', 1);
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `area123_traducao` (
  `trad` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `pagina` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `af` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-ae` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-bh` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-dz` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-eg` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-iq` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-jo` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-kw` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-lb` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-ly` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-ma` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-om` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-qa` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-sa` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-sy` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-tn` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ar-ye` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `be` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `bg` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ca` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `cs` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `da` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `de` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `de-at` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `de-ch` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `de-li` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `de-lu` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `el` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `en-au` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `en-bz` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `en-ca` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `en-gb` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `en-ie` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `en-jm` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `en-nz` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `en-tt` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `en-us` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `en-za` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-ar` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-bo` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-cl` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-co` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-cr` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-do` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-ec` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-gt` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-hn` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-mx` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-ni` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-pa` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-pe` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-pr` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-py` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-sv` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-uy` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `es-ve` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `et` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `eu` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `fa` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `fi` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `fo` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `fr` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `fr-be` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `fr-ca` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `fr-ch` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `fr-lu` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ga` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `gd` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `he` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `hi` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `hr` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `hu` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `id` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `is` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `it` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `it-ch` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ja` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ji` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ko` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `lt` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `lv` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `mk` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ms` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `mt` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `nl` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `nl-be` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `no` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `pl` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `pt` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `pt-br` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `rm` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ro` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ro-mo` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ru` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ru-mo` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `sb` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `sk` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `sl` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `sq` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `sr` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `sv` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `sv-fi` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `sx` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `sz` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `th` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `tn` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `tr` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ts` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `uk` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ur` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `ve` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `vi` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `xh` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `zh-cn` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `zh-hk` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `zh-sg` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `zh-tw` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `zu` varchar(255) COLLATE latin1_general_ci NOT NULL,
  UNIQUE KEY `trad` (`trad`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"INSERT INTO `area123_traducao` (`trad`, `pagina`, `af`, `ar-ae`, `ar-bh`, `ar-dz`, `ar-eg`, `ar-iq`, `ar-jo`, `ar-kw`, `ar-lb`, `ar-ly`, `ar-ma`, `ar-om`, `ar-qa`, `ar-sa`, `ar-sy`, `ar-tn`, `ar-ye`, `be`, `bg`, `ca`, `cs`, `da`, `de`, `de-at`, `de-ch`, `de-li`, `de-lu`, `el`, `en-au`, `en-bz`, `en-ca`, `en-gb`, `en-ie`, `en-jm`, `en-nz`, `en-tt`, `en-us`, `en-za`, `es`, `es-ar`, `es-bo`, `es-cl`, `es-co`, `es-cr`, `es-do`, `es-ec`, `es-gt`, `es-hn`, `es-mx`, `es-ni`, `es-pa`, `es-pe`, `es-pr`, `es-py`, `es-sv`, `es-uy`, `es-ve`, `et`, `eu`, `fa`, `fi`, `fo`, `fr`, `fr-be`, `fr-ca`, `fr-ch`, `fr-lu`, `ga`, `gd`, `he`, `hi`, `hr`, `hu`, `id`, `is`, `it`, `it-ch`, `ja`, `ji`, `ko`, `lt`, `lv`, `mk`, `ms`, `mt`, `nl`, `nl-be`, `no`, `pl`, `pt`, `pt-br`, `rm`, `ro`, `ro-mo`, `ru`, `ru-mo`, `sb`, `sk`, `sl`, `sq`, `sr`, `sv`, `sv-fi`, `sx`, `sz`, `th`, `tn`, `tr`, `ts`, `uk`, `ur`, `ve`, `vi`, `xh`, `zh-cn`, `zh-hk`, `zh-sg`, `zh-tw`, `zu`) VALUES
('Administracao_on_line', 'login.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Administration Online', '', 'Administración en línea', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Administration en ligne', '', '', '', '', '', '', '', '', '', '', '', '', 'Amministrazione online', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Escritório virtual', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('E_mail', 'login.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'E-mail:', '', 'E-mail:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'E-mail:', '', '', '', '', '', '', '', '', '', '', '', '', 'E-mail:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'E-mail:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Senha', 'login.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Password:', '', 'Contraseña:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mot de passe:', '', '', '', '', '', '', '', '', '', '', '', '', 'Password:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Senha:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Entrar', 'login.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Login', '', 'Inicio de sesión', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Connexion', '', '', '', '', '', '', '', '', '', '', '', '', 'Accesso', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Logar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('criarobs', 'login.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'This will create a new account.', '', 'Esto creará una nueva cuenta.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Cela va créer un nouveau compte.', '', '', '', '', '', '', '', '', '', '', '', '', 'In questo modo si crea un nuovo account.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Esta opção irá criar uma nova conta', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Doacoes_confirmacoes_e_pendencias', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Donations confirmations and disputes', '', 'Donaciones confirmaciones y controversias', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Les dons des confirmations et des litiges', '', '', '', '', '', '', '', '', '', '', '', '', 'Donazioni conferme e controversie', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Doações confirmações e pendências', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Criar', 'login.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Create', '', 'Crear', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Créer', '', '', '', '', '', '', '', '', '', '', '', '', 'Crea', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Criar nova conta', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Novo_cliente_criar_conta', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'New Customer: Create Account', '', 'Nuevo cliente: Crear una cuenta', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nouveau client: Créer un compte', '', '', '', '', '', '', '', '', '', '', '', '', 'Nuovo Cliente: Crea Account', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Criar conta', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('seja_bem_vindo', 'index.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Welcome', '', 'Bienvenido', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Bienvenue', '', '', '', '', '', '', '', '', '', '', '', '', 'Benvenuto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Seja bem vindo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('seja_bem_vinda', 'index.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Welcome', '', 'Bienvenido', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Bienvenue', '', '', '', '', '', '', '', '', '', '', '', '', 'Benvenuto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Seja bem vinda', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Dados_editados_com_sucesso', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Data published successfully!', '', 'Los datos publicados con éxito!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Les données publiées avec succès!', '', '', '', '', '', '', '', '', '', '', '', '', 'I dati pubblicati con successo!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Dados editados com sucesso!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Foto_do_perfil', 'clientes_foto.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Profile picture', '', 'Perfil de imagen', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Profil de la photo', '', '', '', '', '', '', '', '', '', '', '', '', 'Profilo di immagine', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Foto do perfil', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('foto_obs', 'clientes_foto.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'If you have trouble sending a picture here or the color of the picture is not good, send email to us and we will get put to you, remember to put your username so we can identify you.', '', 'Si tiene problemas para enviar una foto o aquí el color de la imagen no es buena, envíe un mensaje a nosotros y que nos pondremos a usted, recuerde poner su nombre de usuario para que podamos identificarle.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Si vous avez des difficultés à envoyer une photo ici ou la couleur de l&#039;image n&#039;est pas bonne, envoyez un courriel à nous et nous mettre à vous, n&#039;oubliez pas de mettre votre nom d&#039;utilisateur afin que nous puissions vous identifier.', '', '', '', '', '', '', '', '', '', '', '', '', 'Se hai problemi a inviare una foto qui o il colore della foto non è buona, inviare e-mail a noi e poi ci mettere a voi, ricordatevi di mettere il vostro nome utente in modo siamo in grado di identificare l&#039;utente.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Caso tenha dificuldade para enviar a foto por aqui ou a cor da foto não ficar boa, envie para o e-mail para nós que iremos acertar e colocar para você, lembre-se de colocar seu nome de usuário para que possamos lhe identificar.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Envio_de_foto', 'clientes_foto.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Transmission of picture:', '', 'Transmisión de imagen:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Transmission de l&#039;image:', '', '', '', '', '', '', '', '', '', '', '', '', 'Trasmissione di foto:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Envio de foto:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nome_de_indicacao', 'marketing123_usuario.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'User indication of', '', 'Indicación de usuario', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indication de l&#039;utilisateur', '', '', '', '', '', '', '', '', '', '', '', '', 'Utente indicazione di', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Usuário de indicação', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('usuario_nao_editado', 'marketing123_usuario.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Username unedited for already exists, please choose another!', '', 'Nombre de usuario sin editar para que ya existe, por favor, elija otra!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nom d&#039;utilisateur existe déjà pour les non éditée, s&#039;il vous plaît choisir un autre!', '', '', '', '', '', '', '', '', '', '', '', '', 'Username inediti per esiste già, si prega di scegliere un altro!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nome de usuário NÃO EDITADO por já existir, favor escolher outro!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('sobre_usuario', 'marketing123_usuario.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'When instead of using the ID number you can create a name to associate to facilitate the indication (no space and no accent):', '', 'En lugar de utilizar el número de ID puede crear un nombre de asociación para facilitar la indicación (sin espacios ni acentos):', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Quand au lieu d&#039;utiliser le numéro d&#039;identification, vous pouvez créer un nom d&#039;association pour faciliter l&#039;indication (sans espace et sans accent):', '', '', '', '', '', '', '', '', '', '', '', '', 'Quando invece di utilizzare il numero ID, è possibile creare un nome da associare ad agevolare l&#039;indicazione (senza spazio e senza accento):', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ao invés de utilizar o número ID você pode criar um nome de associado para facilitar na indicação (sem espaço e sem acento):', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Atualizar', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Update', '', 'Actualizar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mettre à jour', '', '', '', '', '', '', '', '', '', '', '', '', 'Aggiornamento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Atualizar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Caso_ja_tenha_cadastrado_efetue_o_login_clicando_aqui', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'If you have already registered sign in by clicking <b><a  href=index.php> here </ a> </b>.', '', 'Si ya está registrado, haga clic en el signo <b><a href =index.php> aquí </a> </b>.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Si vous êtes déjà inscrit signe en cliquant sur <b><a href =index.php> ici </a> </b>.', '', '', '', '', '', '', '', '', '', '', '', '', 'Se vi siete già registrati nel segno facendo clic <B><a href =index.php> qui </a> </b>.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Caso já tenha cadastrado efetue o login clicando <b><a href=clientes/index.php>aqui</a></b>.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Clientes_cadastrados', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Registered customers', '', 'Clientes registrados', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Clients enregistrés', '', '', '', '', '', '', '', '', '', '', '', '', 'Clienti registrati', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Clientes cadastrados', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Cadastro_de_novo_cliente', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Registration of new customer', '', 'Registro de nuevo cliente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Enregistrement de nouveau client', '', '', '', '', '', '', '', '', '', '', '', '', 'La registrazione di nuovi clienti', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Cadastro de novo cliente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigado_por_efetuar_um_cadastro', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'thanks for making a register! <br> <br> Click below to use the services.', '', 'gracias por hacer un registro! <br> Haga clic a continuación para utilizar los servicios.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'merci de faire un registre! <br> Cliquez ci-dessous pour utiliser les services.', '', '', '', '', '', '', '', '', '', '', '', '', 'grazie per fare un registro! <br> <br> Clicca qui sotto per utilizzare i servizi.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'obrigado por efetuar um cadastro!<br><br>Clique no botão abaixo para utilizar os serviços.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Cadastro_efetuado', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Registration made', '', 'Registro realizado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Inscription faite', '', '', '', '', '', '', '', '', '', '', '', '', 'Registrazione fatto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Cadastro efetuado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Entrar_na_area_de_clientes', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Enter the area of customer', '', 'Entrar en el área de clientes', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Entrez le domaine du client', '', '', '', '', '', '', '', '', '', '', '', '', 'Immettere l&#039;area del cliente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Entrar na área de clientes', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('desculpe_mas_ja_existe_um_cadastro_com_este_e_mail', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Sorry but there is a registration with this email', '', 'Lo sentimos pero no hay un registro con este mensaje de correo electrónico', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Désolé mais il ya un enregistrement auprès de cet e-mail', '', '', '', '', '', '', '', '', '', '', '', '', 'Siamo spiacenti ma non vi è una registrazione con questa e-mail', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'desculpe mas já existe um cadastro com este e-mail', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('clique_aqui_e_faca_login', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '<a href=index.php> Click here </ a> and login or use the option remember password.', '', '<a href=index.php> Haga clic aquí </ a> y de acceso o el uso de la opción de recordar contraseña.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '<a href=index.php> Cliquez ici </ a> et connectez-vous ou utilisez l&#039;option Mémoriser mon mot de passe.', '', '', '', '', '', '', '', '', '', '', '', '', '<a href=index.php> Fai clic qui </ a> e login o utilizzare l&#039;opzione ricordare la password.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '<a href=clientes/index.php>Clique aqui</a> e faça o login ou use a opção lembrar senha.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Dados_de_acesso', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Data access:', '', 'El acceso a los datos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Accès aux données:', '', '', '', '', '', '', '', '', '', '', '', '', 'Accesso ai dati:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Dados de acesso:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('E_mail_usuario', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'E-mail/usuário *', '', 'E-mail/usuário *', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'E-mail/usuário *', '', '', '', '', '', '', '', '', '', '', '', '', 'E-mail/usuário *', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'E-mail/usuário *', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Dados_pessoais', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Personal data:', '', 'Datos personales:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Les données à caractère personnel:', '', '', '', '', '', '', '', '', '', '', '', '', 'I dati personali:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Dados pessoais:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nome', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Name *', '', 'Nombre *', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nom *', '', '', '', '', '', '', '', '', '', '', '', '', 'Nome *', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nome *', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Sexo', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Gender', '', 'Género', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Sexe', '', '', '', '', '', '', '', '', '', '', '', '', 'Genere', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Sexo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Masculino', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Men', '', 'Hombres', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Hommes', '', '', '', '', '', '', '', '', '', '', '', '', 'Uomini', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Masculino', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Feminino', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Women', '', 'Mujer', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Femmes', '', '', '', '', '', '', '', '', '', '', '', '', 'Donna', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Feminino', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nascimento', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Birth', '', 'Nacimiento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Naissance', '', '', '', '', '', '', '', '', '', '', '', '', 'Nascita', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nascimento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('ddmmaaaa', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '(dd / mm / yyyy)', '', '(dd / mm / aaaa)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '(jj / mm / aaaa)', '', '', '', '', '', '', '', '', '', '', '', '', '(gg / mm / aaaa)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '(dd/mm/aaaa)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('CPF', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CPF', '', 'ACB', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CPF', '', '', '', '', '', '', '', '', '', '', '', '', 'CPF', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CPF', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Empresa', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Company', '', 'Compañía', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Entreprise', '', '', '', '', '', '', '', '', '', '', '', '', 'Società', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Empresa', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('CNPJ', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CNPJ', '', 'CNPJ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CNPJ', '', '', '', '', '', '', '', '', '', '', '', '', 'CNPJ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CNPJ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Endereco_principal', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Primary Address:', '', 'Dirección primaria:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Adresse principale:', '', '', '', '', '', '', '', '', '', '', '', '', 'Indirizzo principale:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Endereço principal:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pais', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Country', '', 'País', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pays', '', '', '', '', '', '', '', '', '', '', '', '', 'Paese', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'País', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Estado', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'State', '', 'Estado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'État', '', '', '', '', '', '', '', '', '', '', '', '', 'Stato', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Estado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Cidade', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'City', '', 'Ciudad', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ville', '', '', '', '', '', '', '', '', '', '', '', '', 'Città', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Cidade', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Endereco', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Address', '', 'Dirección', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Adresse', '', '', '', '', '', '', '', '', '', '', '', '', 'Indirizzo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Endereço', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Bairro', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Neighborhood', '', 'Barrio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Neighborhood', '', '', '', '', '', '', '', '', '', '', '', '', 'Quartiere', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Bairro', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('CEP', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CEP', '', 'CEP', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CEP', '', '', '', '', '', '', '', '', '', '', '', '', 'CEP', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CEP', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Fone', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Phone', '', 'Teléfono', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Téléphone', '', '', '', '', '', '', '', '', '', '', '', '', 'Telefono', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Fone', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Endereco_comercial', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Business Address:', '', 'La dirección de la empresa:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Adresse de l&#039;entreprise:', '', '', '', '', '', '', '', '', '', '', '', '', 'Indirizzo:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Endereço comercial:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Celular', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mobile', '', 'Móvil', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mobile', '', '', '', '', '', '', '', '', '', '', '', '', 'Mobile', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Celular', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('pode_informar_depois', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '(you can inform later)', '', '(se puede informar más tarde)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '(vous pouvez en informer la suite)', '', '', '', '', '', '', '', '', '', '', '', '', '(si può informare più tardi)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '(pode informar depois)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Outros_dados', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Other data:', '', 'Otros datos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Autres données:', '', '', '', '', '', '', '', '', '', '', '', '', 'Altri dati:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Outros dados:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Seu_nome_de_indicacao', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Your name to indicate', '', 'Para indicar su nombre', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Votre nom d&#039;indiquer', '', '', '', '', '', '', '', '', '', '', '', '', 'Il tuo nome per indicare', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Seu nome de indicação', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Planos', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Plans *', '', '* Planes', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Plans *', '', '', '', '', '', '', '', '', '', '', '', '', 'Piani *', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Planos *', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nada_encontrado', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nothing found!', '', 'No he encontrado nada!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Rien trouvé!', '', '', '', '', '', '', '', '', '', '', '', '', 'Trovato nulla!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nada encontrado!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Indicacao', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indication', '', 'Indicación', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indication', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicazione', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicação', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Indicacao_aleatoria', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicating random', '', 'Indicando al azar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indication de hasard', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicando casuale', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicação aleatória', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Selecione_o_indicador', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Select the indicator', '', 'Seleccione el indicador', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Sélectionnez l&#039;indicateur', '', '', '', '', '', '', '', '', '', '', '', '', 'Selezionare l&#039;indicatore', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Selecione o indicador', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Como_nos_conheceu', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Like us?', '', 'Al igual que nosotros?', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Comme nous?', '', '', '', '', '', '', '', '', '', '', '', '', 'Come noi?', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Onde conheceu?', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Quero_receber_informativos_promocoes', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'I want to receive newsletters / promotions', '', 'Deseo recibir boletines de noticias y promociones', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Je veux recevoir des bulletins d&#039;information / promotions', '', '', '', '', '', '', '', '', '', '', '', '', 'Voglio ricevere newsletter / promozioni', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Quero receber informativos/promoções', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Termos_de_uso', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Terms of Use', '', 'Términos de Uso', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Conditions d&#039;utilisation', '', '', '', '', '', '', '', '', '', '', '', '', 'Condizioni di Utilizzo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Termos de uso', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Seu_ip', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Your ip', '', 'Tu ip', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Votre ip', '', '', '', '', '', '', '', '', '', '', '', '', 'Il tuo ip', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Seu ip', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Adicionar_cadastro', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Add register', '', 'Añadir registro', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ajouter registre', '', '', '', '', '', '', '', '', '', '', '', '', 'Aggiungi registro', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Adicionar cadastro', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Li_e_concordo_com_os_termos', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'I have read and agree with <a target=_blank href=../termos_de_uso.php> <u> <b> Termos_de_uso </ b> </ u> </ a> (required)', '', 'He leído y estoy de acuerdo con <a target=_blank href=../termos_de_uso.php> <u> <b> Termos_de_uso </ b> </ u> </ a> (requerido)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'J&#039;ai lu et j&#039;accepte avec <a target=_blank href=../termos_de_uso.php> <u> <b> Termos_de_uso </ b> </ u> </ a> (obligatoire)', '', '', '', '', '', '', '', '', '', '', '', '', 'Ho letto e accetto con <a target=_blank href=../termos_de_uso.php> <u> <b> Termos_de_uso </ b> </ u> </ a> (obbligatorio)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ao clicar no botão abaixo você afirma que leu e concordou com os <a target=_blank href=termos_de_uso.php><u><b>termos de uso</b></u></a>', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('sera_arquivado_por_seguranca', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '(will be filed by security)', '', '(será presentada por la seguridad)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '(qui sera déposée par les services de sécurité)', '', '', '', '', '', '', '', '', '', '', '', '', '(sarà presentata da sicurezza)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '(será arquivado por segurança)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Coloque_o_id_ou_usuario_do_indicador', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Set the user id or the indicator (optional)', '', 'Establezca el ID de usuario o el indicador (opcional)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Définir l&#039;identité de l&#039;utilisateur ou de l&#039;indicateur (en option)', '', '', '', '', '', '', '', '', '', '', '', '', 'Impostare l&#039;ID utente o l&#039;indicatore (opzionale)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Coloque o id ou usuário do indicador (opcional)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Atendimento_ao_cliente', 'suporte123.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Customer Service', '', 'Servicio de Atención al Cliente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Service à la clientèle', '', '', '', '', '', '', '', '', '', '', '', '', 'Servizio Clienti', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Atendimento ao cliente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Seu_e_mail', 'suporte123.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Your email:', '', 'Su email:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Votre email:', '', '', '', '', '', '', '', '', '', '', '', '', 'Il tuo indirizzo email:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Seu e-mail:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Assunto', 'suporte123.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Subject:', '', 'Asunto:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Sujet:', '', '', '', '', '', '', '', '', '', '', '', '', 'Oggetto:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Assunto:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Enviar', 'suporte123.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Send', '', 'Enviar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Envoyer', '', '', '', '', '', '', '', '', '', '', '', '', 'Inviare', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Enviar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Mensagem', 'suporte123.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Message:', '', 'Mensaje:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Message:', '', '', '', '', '', '', '', '', '', '', '', '', 'Messaggio:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mensagem:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Manual_do_marketing_de_rede', 'dinheiro123_manual.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Handbook of marketing network', '', 'Manual de la red de comercialización', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Manuel de marketing de réseau', '', '', '', '', '', '', '', '', '', '', '', '', 'Manuale di marketing di rete', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Manual do marketing de rede', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Arquivos_e_books', 'dinheiro123_arquivos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Files / e-books', '', 'Archivos / e-libros', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Files / e-books', '', '', '', '', '', '', '', '', '', '', '', '', 'File / e-books', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Arquivos/e-books', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Acesso_limitado_a_clientes_ativos', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Limited access to active customers.', '', 'Acceso limitado a los clientes activos.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'L&#039;accès limité à l&#039;actif des clients.', '', '', '', '', '', '', '', '', '', '', '', '', 'L&#039;accesso limitato a clienti attivi.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Acesso limitado a clientes ativos.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Divulgacao_por_e_mail', 'dinheiro123_email.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Disclosure by email', '', 'Revelación de información por correo electrónico', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Divulgation par email', '', '', '', '', '', '', '', '', '', '', '', '', 'Informazioni via e-mail', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Divulgação por e-mail', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Coloque_abaixo_o_nome_e_os_emails_dos_seus_amigos', 'dinheiro123_email.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Put down the name and emails of your friends:', '', 'Ponga el nombre y e-mails de tus amigos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mettez le nom et les e-mails de vos amis:', '', '', '', '', '', '', '', '', '', '', '', '', 'Metti il nome ed e-mail dei tuoi amici:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Coloque abaixo o nome e os emails dos seus amigos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
");
mysqli_query($link,"INSERT INTO `area123_traducao` (`trad`, `pagina`, `af`, `ar-ae`, `ar-bh`, `ar-dz`, `ar-eg`, `ar-iq`, `ar-jo`, `ar-kw`, `ar-lb`, `ar-ly`, `ar-ma`, `ar-om`, `ar-qa`, `ar-sa`, `ar-sy`, `ar-tn`, `ar-ye`, `be`, `bg`, `ca`, `cs`, `da`, `de`, `de-at`, `de-ch`, `de-li`, `de-lu`, `el`, `en-au`, `en-bz`, `en-ca`, `en-gb`, `en-ie`, `en-jm`, `en-nz`, `en-tt`, `en-us`, `en-za`, `es`, `es-ar`, `es-bo`, `es-cl`, `es-co`, `es-cr`, `es-do`, `es-ec`, `es-gt`, `es-hn`, `es-mx`, `es-ni`, `es-pa`, `es-pe`, `es-pr`, `es-py`, `es-sv`, `es-uy`, `es-ve`, `et`, `eu`, `fa`, `fi`, `fo`, `fr`, `fr-be`, `fr-ca`, `fr-ch`, `fr-lu`, `ga`, `gd`, `he`, `hi`, `hr`, `hu`, `id`, `is`, `it`, `it-ch`, `ja`, `ji`, `ko`, `lt`, `lv`, `mk`, `ms`, `mt`, `nl`, `nl-be`, `no`, `pl`, `pt`, `pt-br`, `rm`, `ro`, `ro-mo`, `ru`, `ru-mo`, `sb`, `sk`, `sl`, `sq`, `sr`, `sv`, `sv-fi`, `sx`, `sz`, `th`, `tn`, `tr`, `ts`, `uk`, `ur`, `ve`, `vi`, `xh`, `zh-cn`, `zh-hk`, `zh-sg`, `zh-tw`, `zu`) VALUES
('Divulgacao_por_banners', 'dinheiro123_banner.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Disclosure by banners', '', 'Revelación de información por las banderas', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Divulgation de bannières', '', '', '', '', '', '', '', '', '', '', '', '', 'Comunicazione da parte banner', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Divulgação por banners', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Divulgacao_por_links', 'dinheiro123_links.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Disclosure by links', '', 'Revelación de información por los enlaces', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Divulgation des liens', '', '', '', '', '', '', '', '', '', '', '', '', 'Comunicazione da collegamenti', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Divulgação por links', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Estatistica_de_sua_downline', 'marketing123_ind_numeros.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Statistics from your downline', '', 'Las estadísticas de su línea descendente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Statistiques de votre aval', '', '', '', '', '', '', '', '', '', '', '', '', 'Statistiche dal vostro downline', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Estatística de sua downline', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nivel', 'marketing123_ind_numeros.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Level:', '', 'Nivel:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Niveau:', '', '', '', '', '', '', '', '', '', '', '', '', 'Livello:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nível:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ativos', 'marketing123_ind_numeros.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Assets:', '', 'Activo:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Actif:', '', '', '', '', '', '', '', '', '', '', '', '', 'Attivo:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ativos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Inativos', 'marketing123_ind_numeros.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Inactive:', '', 'Inactivo:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Inactif:', '', '', '', '', '', '', '', '', '', '', '', '', 'Inattivo:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Inativos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Total_inscritos', 'marketing123_ind_numeros.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Total registered:', '', 'Total de registrados:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Total des inscriptions:', '', '', '', '', '', '', '', '', '', '', '', '', 'Totale registrati:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Total inscritos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Total', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Total:', '', 'Total:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Total:', '', '', '', '', '', '', '', '', '', '', '', '', 'Totale:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Total:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Indicados_ativos_e_inativos', 'dinheiro123_ativos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicated active and inactive', '', 'Indicada activos e inactivos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indiqué actifs et inactifs', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicata attivi e inattivi', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicados ativos e inativos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Indicados_inativos', 'dinheiro123_ativos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Recomanats inactive', '', 'Recomanats inactivo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Inactifs préférés', '', '', '', '', '', '', '', '', '', '', '', '', 'Inattive preferiti', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicados inativos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Legenda', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Legend:', '', 'Leyenda:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Légende:', '', '', '', '', '', '', '', '', '', '', '', '', 'Legenda:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Legenda:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Rede_completa', 'dinheiro123_rede_total.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Complete network', '', 'Red completa', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Réseau complet', '', '', '', '', '', '', '', '', '', '', '', '', 'Completa rete', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Rede completa', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Indicador', 'dinheiro123_rede_total.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicator:', '', 'Indicador:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicateur:', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicatore:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Indicador:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nenhum_indicado_ativo', 'dinheiro123_rede_total.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'None indicated active', '', 'Ninguno indicado activa', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Aucun indiqué active', '', '', '', '', '', '', '', '', '', '', '', '', 'Nessuno indicato attivi', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nenhum indicado ativo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('indicado_s_ativo', 'dinheiro123_rede_total.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'indicated (s) active (s)', '', 'indicado (s) activo (s)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'indiqué (s) actif (s)', '', '', '', '', '', '', '', '', '', '', '', '', 'indicato (s) attivo (s)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'indicado(s) ativo(s)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Conta_virtual', 'dinheiro123_conta_virtual.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Virtual Account', '', 'Cuenta virtual', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Virtual compte', '', '', '', '', '', '', '', '', '', '', '', '', 'Conto virtuale', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Conta virtual', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ganho_total', 'dinheiro123_conta_virtual.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Total gain', '', 'Ganancia total', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Total gain', '', '', '', '', '', '', '', '', '', '', '', '', 'Totale guadagno', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ganho total', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Desconto_total', 'dinheiro123_conta_virtual.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Discounted total', '', 'Descuento total', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Réduit total', '', '', '', '', '', '', '', '', '', '', '', '', 'Discounted totale', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Desconto total', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Recebido_total', 'dinheiro123_conta_virtual.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Received total', '', 'Recibido total', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Reçu total', '', '', '', '', '', '', '', '', '', '', '', '', 'Ricevuto totale', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Recebido total', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Saldo_a_receber', 'dinheiro123_conta_virtual.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Balance receivable:', '', 'Saldo por cobrar:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Solde à recevoir:', '', '', '', '', '', '', '', '', '', '', '', '', 'Saldo crediti:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Saldo a receber:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ganhos', 'dinheiro123_conta_virtual.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Earnings:', '', 'Ganancias:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Résultats:', '', '', '', '', '', '', '', '', '', '', '', '', 'Rendimenti:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ganhos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Associado', 'dinheiro123_conta_virtual.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Member:', '', 'Usuario:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Membre:', '', '', '', '', '', '', '', '', '', '', '', '', 'Stato:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Associado:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pago', 'dinheiro123_conta_virtual.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pay:', '', 'Pago:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pay:', '', '', '', '', '', '', '', '', '', '', '', '', 'Pay:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pago:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Comissao', 'dinheiro123_conta_virtual.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Commission:', '', 'Comisión:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Commission:', '', '', '', '', '', '', '', '', '', '', '', '', 'Commissione:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Comissão:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Janeiro', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'January', '', 'Enero', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Janvier', '', '', '', '', '', '', '', '', '', '', '', '', 'Gennaio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Janeiro', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Fevereiro', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'February', '', 'Febrero', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Février', '', '', '', '', '', '', '', '', '', '', '', '', 'Febbraio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Fevereiro', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Marco', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'March', '', 'Marzo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mars', '', '', '', '', '', '', '', '', '', '', '', '', 'Mar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Março', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Abril', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'April', '', 'Abril', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Avril', '', '', '', '', '', '', '', '', '', '', '', '', 'Aprile', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Abril', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Maio', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'May', '', 'Mayo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mai', '', '', '', '', '', '', '', '', '', '', '', '', 'Potere', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Maio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Junho', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'June', '', 'Junio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Juin', '', '', '', '', '', '', '', '', '', '', '', '', 'Giugno', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Junho', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Julho', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'July', '', 'Julio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Juillet', '', '', '', '', '', '', '', '', '', '', '', '', 'Luglio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Julho', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Agosto', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'August', '', 'Agosto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Août', '', '', '', '', '', '', '', '', '', '', '', '', 'Agosto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Agosto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Setembro', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'September', '', 'Septiembre', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Septembre', '', '', '', '', '', '', '', '', '', '', '', '', 'Settembre', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Setembro', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Outubro', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'October', '', 'Octubre', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Octobre', '', '', '', '', '', '', '', '', '', '', '', '', 'Ottobre', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Outubro', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Novembro', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'November', '', 'Noviembre', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Novembre', '', '', '', '', '', '', '', '', '', '', '', '', 'Novembre', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Novembro', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Dezembro', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'December', '', 'Diciembre', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Décembre', '', '', '', '', '', '', '', '', '', '', '', '', 'Dicembre', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Dezembro', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Descontos', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Discount:', '', 'Descuento:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Remise:', '', '', '', '', '', '', '', '', '', '', '', '', 'Sconto:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Descontos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Recebidos', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Received:', '', 'Recibido:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Date:', '', '', '', '', '', '', '', '', '', '', '', '', 'Received:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Recebidos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Data', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Date:', '', 'Fecha:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Date:', '', '', '', '', '', '', '', '', '', '', '', '', 'Data:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Data:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Valornome', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Value:', '', 'Valor:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Valeur:', '', '', '', '', '', '', '', '', '', '', '', '', 'Valore:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Valor:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Edicao_de_preferencias', 'clientes_preferencias.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Editing of preferences', '', 'Edición de las preferencias', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Modification des préférences', '', '', '', '', '', '', '', '', '', '', '', '', 'Modifica delle preferenze', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Edição de preferências', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Lingua', 'clientes_preferencias.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Language', '', 'Idioma', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Langue', '', '', '', '', '', '', '', '', '', '', '', '', 'Lingua', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Língua', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Moeda', 'clientes_preferencias.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Currency', '', 'Moneda', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Devise', '', '', '', '', '', '', '', '', '', '', '', '', 'Valuta', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Moeda', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Newsletter', 'clientes_preferencias.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Newsletter', '', 'Newsletter', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Newsletter', '', '', '', '', '', '', '', '', '', '', '', '', 'Newsletter', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Newsletter', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Newsletter_obs', 'clientes_preferencias.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'check to receive newsletters / promotions.', '', 'cheque a recibir los boletines de noticias y promociones.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'chèque à recevoir des bulletins d&#039;information / promotions.', '', '', '', '', '', '', '', '', '', '', '', '', 'verificare di ricevere newsletter / promozioni.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'marque para receber informativos/promoções.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Dados_para_recebimento', 'dinheiro123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Data for receipt', '', 'Datos para la recepción', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Les données pour la réception', '', '', '', '', '', '', '', '', '', '', '', '', 'I dati per il ricevimento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Dados para recebimento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Meu_Saldo', 'dinheiro123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'My Balance:', '', 'Mi Saldo:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ma Balance:', '', '', '', '', '', '', '', '', '', '', '', '', 'La mia bilancia:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Meu Saldo:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Selecione_uma_das_opcoes_abaixo_para_sacar', 'dinheiro123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Select an option below to get the money:', '', 'Seleccione una opción de abajo para obtener el dinero:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Sélectionnez une option ci-dessous pour obtenir de l&#039;argent:', '', '', '', '', '', '', '', '', '', '', '', '', 'Seleziona un&#039;opzione qui sotto per ottenere il denaro:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Selecione uma das opções abaixo para sacar o dinheiro:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Transferencia', 'dinheiro123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Transfer', '', 'Transferencia', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Transfert', '', '', '', '', '', '', '', '', '', '', '', '', 'Trasferimento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Transferência', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Banco', 'dinheiro123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Bank', '', 'Banco', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Banque', '', '', '', '', '', '', '', '', '', '', '', '', 'Banca', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Banco', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Titular', 'dinheiro123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Proprietor', '', 'Titular', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Proprietor', '', '', '', '', '', '', '', '', '', '', '', '', 'Titolare', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Titular', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Agencia', 'dinheiro123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Agency', '', 'Agencia', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Agence', '', '', '', '', '', '', '', '', '', '', '', '', 'Agenzia', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Agência', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Conta', 'dinheiro123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Account', '', 'Cuenta', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Compte', '', '', '', '', '', '', '', '', '', '', '', '', 'Account', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Conta', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Tipo_de_conta', 'dinheiro123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Account Type', '', 'Tipo de cuenta', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Type de compte', '', '', '', '', '', '', '', '', '', '', '', '', 'Tipo di account', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Tipo de conta', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Poupanca', 'dinheiro123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Savings', '', 'Ahorro', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'D&#039;épargne', '', '', '', '', '', '', '', '', '', '', '', '', 'Risparmio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Poupança', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Corrente', 'dinheiro123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Current', '', 'Actual', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Actuel', '', '', '', '', '', '', '', '', '', '', '', '', 'Corrente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Corrente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pagamentos', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Payments', '', 'Pagos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Paiements', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagamenti', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagamentos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Altere_o_valor', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'If necessary change the value and then click the button below.', '', 'Si es necesario cambiar el valor y, a continuación, haga clic en el botón de abajo.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Si nécessaire, modifier la valeur puis cliquez sur le bouton ci-dessous.', '', '', '', '', '', '', '', '', '', '', '', '', 'Se necessario, modificare il valore e quindi fare clic sul bottone qui sotto.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Caso necessário altere o valor e em seguida clique no botão abaixo.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Numero_do_pedido', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Number of Request:', '', 'Número de Solicitud:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Numéro de la demande:', '', '', '', '', '', '', '', '', '', '', '', '', 'Numero di Richiesta:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Número do pedido:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Servico_produto', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Service / product:', '', 'Servicio / producto:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Service / produit:', '', '', '', '', '', '', '', '', '', '', '', '', 'Servizio / prodotto:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Produtos/serviços', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Validadenome', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Validity:', '', 'Validez:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Validité:', '', '', '', '', '', '', '', '', '', '', '', '', 'Validità:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Validade:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Efetuar_pagamento', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Make Payment', '', 'Efectuar pagos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Effectuer un paiement', '', '', '', '', '', '', '', '', '', '', '', '', 'Esegui pagamento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Efetuar pagamento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Confirmacao_de_pagamentos', 'pagamentos123_confirmar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirmation of payments', '', 'Confirmación de los pagos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirmation de paiement', '', '', '', '', '', '', '', '', '', '', '', '', 'La conferma dei pagamenti', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirmação de pagamentos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('pagamento_foi_inserido', 'pagamentos123_confirmar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'The payment was inserted successfully! We <br> <br> next moment we confirmed with the bank and send you a receipt via email.', '', 'El pago se insertó con éxito! Estamos <br> siguiente momento en que confirma con el banco y le enviaremos un recibo por correo electrónico.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Le paiement a été inséré avec succès! Nous <br> prochaine moment, nous avons confirmé auprès de la banque et de vous envoyer un accusé de réception par e-mail.', '', '', '', '', '', '', '', '', '', '', '', '', 'Il pagamento è stato inserito con successo! Noi <br> <br> prossima momento abbiamo confermato con la banca e ti invieremo una ricevuta via e-mail.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'O informativo de pagamento foi inserido com sucesso! Nós próximos instantes estaremos confirmando junto ao banco e lhe enviando um recibo via e-mail.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Valor_pago', 'pagamentos123_confirmar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Amount paid:', '', 'Importe abonado:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Montant payé:', '', '', '', '', '', '', '', '', '', '', '', '', 'Importo versato:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Valor pago:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Data_do_pagamento', 'pagamentos123_confirmar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Date of payment:', '', 'Fecha de pago:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Date de paiement:', '', '', '', '', '', '', '', '', '', '', '', '', 'Data di pagamento:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Data do pagamento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Forma_do_pagamento', 'pagamentos123_confirmar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Form of payment:', '', 'Forma de pago:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mode de paiement:', '', '', '', '', '', '', '', '', '', '', '', '', 'Forma di pagamento:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Forma do pagamento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Verifique_se_o_valor_e_a_data_estao_corretos', 'pagamentos123_confirmar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '* Check if the value and date are correct.', '', '* Compruebe si el valor y la fecha son correctas.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '* Vérifiez si la valeur et la date sont correctes.', '', '', '', '', '', '', '', '', '', '', '', '', '* Controllare se il valore e la data vengono corrette.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '* Verifique se o valor e a data estão corretos.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Banco_de_destino', 'pagamentos123_confirmar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Bank of destination:', '', 'Banco de destino:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Banque de destination:', '', '', '', '', '', '', '', '', '', '', '', '', 'Banca di destinazione:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Banco de destino', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Agencia_do_cliente', 'pagamentos123_confirmar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Guest Agency:', '', 'Guest Agencia:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Guest Agency:', '', '', '', '', '', '', '', '', '', '', '', '', 'Valutazione Agenzia:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Agência do cliente:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Conta_do_cliente', 'pagamentos123_confirmar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Customer Account:', '', 'Cuenta Cliente:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Compte Client:', '', '', '', '', '', '', '', '', '', '', '', '', 'Conto Cliente:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Conta do cliente:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Copie_e_cole_aqui_os_dados_do_recibo', 'pagamentos123_confirmar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Copy and paste here the data of the receipt: (optional)', '', 'Copiar y pegar aquí los datos de la recepción: (opcional)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Copiez et collez ici les données de la réception: (facultatif)', '', '', '', '', '', '', '', '', '', '', '', '', 'Copia e incolla qui i dati di ricevimento: (opzionale)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Copie e cole aqui<br>os dados do recibo<br>(opcional)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Forma', 'pagamentos123_recibos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Form:', '', 'Forma:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Forme:', '', '', '', '', '', '', '', '', '', '', '', '', 'Forma:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Forma:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pago_de', 'pagamentos123_recibos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pay to:', '', 'El pago a:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Payer à:', '', '', '', '', '', '', '', '', '', '', '', '', 'Pay-per:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pago de', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pago_ate', 'pagamentos123_recibos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Paid by:', '', 'Pagado por:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Payé par:', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagato da:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pago até', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Impressao', 'pagamentos123_recibos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Printing:', '', 'Impresión:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Impression:', '', '', '', '', '', '', '', '', '', '', '', '', 'Stampa:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Impressão:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Visualizar', 'pagamentos123_recibos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'View', '', 'Ver', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Affichage', '', '', '', '', '', '', '', '', '', '', '', '', 'Vista', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Visualizar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nenhum_resultado_encontrado', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'No results found!', '', 'No se han encontrado resultados!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Aucun résultat trouvé!', '', '', '', '', '', '', '', '', '', '', '', '', 'Nessun risultato trovato!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nenhum resultado encontrado!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('OBS_recibos', 'pagamentos123_recibos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '<br> <i> <b> NOTE: </ i> </ b> <br> If you have made any payment which is not mentioned here after 2 days, please contact our service informing the data of the payment to it can be confirmed.', '', '<br> <i> <b> NOTA: </ i> </ b> <br> Si ha realizado cualquier pago que no se menciona aquí después de 2 días, por favor contacte con nuestro servicio de información de los datos del pago a puede ser confirmado.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '<br> <i> <b> NOTE: </ i> </ b> <br> Si vous avez effectué un paiement qui n&#039;est pas mentionné ici, après 2 jours, s&#039;il vous plaît contactez notre service d&#039;informer les données de paiement au elle peut être confirmée.', '', '', '', '', '', '', '', '', '', '', '', '', '<br> <i> <b> NOTA: </ i> </ b> <br> Se avete effettuato un pagamento che non è stato menzionato qui, dopo 2 giorni, si prega di contattare il nostro servizio di informare i dati per il pagamento essa può essere confermata.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Caso você tenha efetuado algum pagamento que não está constando aqui após 2 dias, entre em contato com nosso atendimento informando os dados do pagamento para que ele possa ser confirmado.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Recibos', 'pagamentos123_recibos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Receipts', '', 'Recibos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Recettes', '', '', '', '', '', '', '', '', '', '', '', '', 'Ricevute', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Recibos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
");
mysqli_query($link,"INSERT INTO `area123_traducao` (`trad`, `pagina`, `af`, `ar-ae`, `ar-bh`, `ar-dz`, `ar-eg`, `ar-iq`, `ar-jo`, `ar-kw`, `ar-lb`, `ar-ly`, `ar-ma`, `ar-om`, `ar-qa`, `ar-sa`, `ar-sy`, `ar-tn`, `ar-ye`, `be`, `bg`, `ca`, `cs`, `da`, `de`, `de-at`, `de-ch`, `de-li`, `de-lu`, `el`, `en-au`, `en-bz`, `en-ca`, `en-gb`, `en-ie`, `en-jm`, `en-nz`, `en-tt`, `en-us`, `en-za`, `es`, `es-ar`, `es-bo`, `es-cl`, `es-co`, `es-cr`, `es-do`, `es-ec`, `es-gt`, `es-hn`, `es-mx`, `es-ni`, `es-pa`, `es-pe`, `es-pr`, `es-py`, `es-sv`, `es-uy`, `es-ve`, `et`, `eu`, `fa`, `fi`, `fo`, `fr`, `fr-be`, `fr-ca`, `fr-ch`, `fr-lu`, `ga`, `gd`, `he`, `hi`, `hr`, `hu`, `id`, `is`, `it`, `it-ch`, `ja`, `ji`, `ko`, `lt`, `lv`, `mk`, `ms`, `mt`, `nl`, `nl-be`, `no`, `pl`, `pt`, `pt-br`, `rm`, `ro`, `ro-mo`, `ru`, `ru-mo`, `sb`, `sk`, `sl`, `sq`, `sr`, `sv`, `sv-fi`, `sx`, `sz`, `th`, `tn`, `tr`, `ts`, `uk`, `ur`, `ve`, `vi`, `xh`, `zh-cn`, `zh-hk`, `zh-sg`, `zh-tw`, `zu`) VALUES
('Pedido_de_cancelamento', 'dinheiro123_cancelar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Request for cancellation', '', 'Solicitud de cancelación', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Demande d&#039;annulation', '', '', '', '', '', '', '', '', '', '', '', '', 'Richiesta di cancellazione', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pedido de cancelamento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Solicito_o_cancelamento', 'dinheiro123_cancelar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'I request the cancellation of my account and authorize the immediate removal of my data.', '', 'Solicito la cancelación de mi cuenta y autorizar la inmediata eliminación de mis datos.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Je demande l&#039;annulation de mon compte et d&#039;autoriser le retrait immédiat de mes données.', '', '', '', '', '', '', '', '', '', '', '', '', 'I chiedere la cancellazione del mio account e autorizzare l&#039;immediata rimozione dei miei dati.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Solicito o cancelamento de minha conta e autorizo a imediata remoção de meus dados.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('OBS', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Note:', '', 'Nota:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Note:', '', '', '', '', '', '', '', '', '', '', '', '', 'Nota:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'OBS:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Dados_enviados_com_sucesso', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Data sent successfully!', '', 'Datos enviados con éxito!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Les données envoyées avec succès!', '', '', '', '', '', '', '', '', '', '', '', '', 'Dati inviati correttamente!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Dados enviados com sucesso!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Cliques', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Clicks:', '', 'Clics:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Clicks:', '', '', '', '', '', '', '', '', '', '', '', '', 'Clic:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Cliques:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Tamanho', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Size:', '', 'Tamaño:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Taille:', '', '', '', '', '', '', '', '', '', '', '', '', 'Dimensioni:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Tamanho:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Idioma', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Language:', '', 'Idioma:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Idioma:', '', '', '', '', '', '', '', '', '', '', '', '', 'Lingua:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Idioma:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Licenca', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'License:', '', 'Licencia:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Licence:', '', '', '', '', '', '', '', '', '', '', '', '', 'Licenza:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Licença:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Media_de_votos', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Average rating:', '', 'Nota media:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Moyenne des avis:', '', '', '', '', '', '', '', '', '', '', '', '', 'Voto medio:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Média de votos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Adicionado_em', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Added:', '', 'Añadido:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ajouté le:', '', '', '', '', '', '', '', '', '', '', '', '', 'Aggiunto:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Adicionado em:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nao_existem_arquivos_nessa_categoria', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'There are no files in this category', '', 'No hay archivos en esta categoría', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Il n&#039;y a pas de fichiers dans cette catégorie', '', '', '', '', '', '', '', '', '', '', '', '', 'Non ci sono file in questa categoria', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Não existem arquivos nessa categoria', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Voltar', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Back', '', 'Espalda', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Retour', '', '', '', '', '', '', '', '', '', '', '', '', 'Indietro', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Voltar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Avaliar', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Evaluate', '', 'Evaluar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Évaluer', '', '', '', '', '', '', '', '', '', '', '', '', 'Valutare', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Avaliar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Trocar_valor', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Exchange value', '', 'Valor de intercambio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Contre-valeur', '', '', '', '', '', '', '', '', '', '', '', '', 'Controvalore', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Trocar valor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Escolhido', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Chosen', '', 'Elegida', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Choisie', '', '', '', '', '', '', '', '', '', '', '', '', 'Scelto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Escolhido', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('O_valor_da_comissao_e', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'The value of the committee is:', '', 'El valor de la comisión es el siguiente:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'La valeur de la commission est de:', '', '', '', '', '', '', '', '', '', '', '', '', 'Il valore della commissione è il seguente:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'O valor da comissão é:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('O_valor_da_adesao_e', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'The value of membership is:', '', 'El valor de la composición es la siguiente:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'La valeur de la composition est la suivante:', '', '', '', '', '', '', '', '', '', '', '', '', 'Il valore di iscrizione è il seguente:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'O valor da adesão é:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('e_a_primeira_mensalidade_sera_no_mes_que_vem_dia', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'and the first installment will be the month that comes days', '', 'y la primera cuota será el mes que viene día', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'et le premier versement sera le mois qui vient jours', '', '', '', '', '', '', '', '', '', '', '', '', 'e la prima rata sarà il mese che viene giorno', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'e a primeira mensalidade será no mês que vem dia', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('no_valor_de', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'amounting to:', '', 'por valor de:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 's&#039;élevant à:', '', '', '', '', '', '', '', '', '', '', '', '', 'pecuniaria pari a:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'no valor de:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('O_valor_da_mensalidade_e', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'The value of the tuition fee is', '', 'El valor de la matrícula es', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'La valeur des frais de scolarité est', '', '', '', '', '', '', '', '', '', '', '', '', 'Il valore della quota è', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'O valor da mensalidade é', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('O_vencimento_sera_em', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'The salary will be on:', '', 'El salario será de:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Le salaire sera sur:', '', '', '', '', '', '', '', '', '', '', '', '', 'La retribuzione sarà il:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'O vencimento será em:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Cada_mensalidade_custa', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'The monthly cost:', '', 'El costo mensual:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Le coût mensuel:', '', '', '', '', '', '', '', '', '', '', '', '', 'Il costo mensile:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Cada mensalidade custa:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('e_vencera_todo_dia', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'and win every day', '', 'y ganar cada día', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'et de gagner tous les jours', '', '', '', '', '', '', '', '', '', '', '', '', 'e vincere ogni giorno', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'e vencerá todo dia', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Provavelmente_essa_sera', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Probably this will be your only fee to be paid, because the committee with the information you and your indicated they will pay the next and you will receive monthly income.', '', 'Probablemente esta será la única tasa que debe pagarse, porque la comisión la información que usted y su indicado que pagar la próxima y recibirá ingresos mensuales.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Probablement, ce sera votre seule taxe à payer, parce que le comité de l&#039;information que vous et votre indiqué qu&#039;ils sont prêts à payer le prochain, et vous recevrez un revenu mensuel.', '', '', '', '', '', '', '', '', '', '', '', '', 'Probabilmente questa sarà l&#039;unica tassa da pagare, perché la commissione con le informazioni di cui hai indicato il tuo e che pagherà il prossimo, e riceverai reddito mensile.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Provavelmente essa será sua única mensalidade a ser paga, pois a comissão com as indicações que você e seus indicados fizerem irá pagar as próximas mensalidades e você irá receber renda.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('O_pagamento_ja_foi_confirmado_com_sucesso', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'The payment has been confirmed with success!', '', 'El pago ha sido confirmado por el éxito!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Le paiement a été confirmé avec succès!', '', '', '', '', '', '', '', '', '', '', '', '', 'Il pagamento è stato confermato con successo!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'O pagamento já foi confirmado com sucesso!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('O_pagamento_da_adesao_ja_foi_confirmado', 'pagamentos123_efetuar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Payment of membership has been confirmed with success!', '', 'Pago de la adhesión ha sido confirmada por el éxito!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Le paiement de l&#039;adhésion a été confirmée avec succès!', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagamento di adesione è stata confermata con successo!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'O pagamento da adesão já foi confirmado com sucesso!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('pagina_inicial_tabela', 'index.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'WELCOME TO PROFESSIONAL SUCCESS', '', 'BIENVENIDO AL ÉXITO PROFESIONAL', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'BIENVENUE AU SUCCÈS PROFESSIONNEL', '', '', '', '', '', '', '', '', '', '', '', '', 'BENVENUTI AL SUCCESSO PROFESSIONALE', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'SEJA BEM VINDO AO SUCESSO PROFISSIONAL', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('DUVIDAS_FREQUENTES', 'duvidas.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'FREQUENT QUESTIONS', '', 'PREGUNTAS FRECUENTES', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'QUESTIONS FREQUENTES', '', '', '', '', '', '', '', '', '', '', '', '', 'DOMANDE FREQUENTI', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'DÚVIDAS FREQUENTES', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Contato', 'contato.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Contact', '', 'Contacto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Contact', '', '', '', '', '', '', '', '', '', '', '', '', 'Contatto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Contato', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Quem_somos', 'quem_somo.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'About Us', '', 'Sobre Nosotros', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Qui sommes-nous?', '', '', '', '', '', '', '', '', '', '', '', '', 'Chi siamo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Quem somos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Saiba_mais', 'saiba_mais.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Know more', '', 'Saiba_mais', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Saiba_mais', '', '', '', '', '', '', '', '', '', '', '', '', 'Saiba_mais', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Saiba mais', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('POLITICA_DE_PRIVACIDADE', 'privacidade.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'PRIVACY POLICY', '', 'POLÍTICA DE PRIVACIDAD', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'POLITIQUE DE CONFIDENTIALITÉ', '', '', '', '', '', '', '', '', '', '', '', '', 'TUTELA DELLA PRIVACY', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'POLÍTICA DE PRIVACIDADE', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Planos_de_marketing', 'planos_marketing.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Marketing plans', '', 'Planes de comercialización', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Marketing plans', '', '', '', '', '', '', '', '', '', '', '', '', 'Piani di marketing', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Planos de marketing', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('MAPA_DO_SITE', 'mapa_do_site.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'SITEMAP', '', 'MAPA DEL SITIO', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'SITEMAP', '', '', '', '', '', '', '', '', '', '', '', '', 'MAPPA DEL SITO', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'MAPA DO SITE', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('FUNCIONAMENTO', 'funcionamento.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'OPERATION', '', 'FUNCIONAMIENTO', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'FONCTIONNEMENT', '', '', '', '', '', '', '', '', '', '', '', '', 'OPERAZIONE', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'FUNCIONAMENTO', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('E_mail_enviado_com_sucesso', 'contato.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Email sent successfully!', '', 'Correo electrónico enviado con éxito!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'E-mail envoyé avec succès!', '', '', '', '', '', '', '', '', '', '', '', '', 'E-mail inviata con successo!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'E-mail enviado com sucesso!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('ERRO_O_e_mail_nao_foi_enviado', 'contato.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ERROR: The email was sent!', '', 'ERROR: El mensaje de correo ha sido enviado!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ERREUR: L&#039;email a été envoyé!', '', '', '', '', '', '', '', '', '', '', '', '', 'ERRORE: L&#039;email è stata inviata!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ERRO: O e-mail não foi enviado!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Adesao', 'planos_marketing.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Accession:', '', 'Adhesión:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Adhésion:', '', '', '', '', '', '', '', '', '', '', '', '', 'Adesione:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Adesão:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Mensalidade', 'planos_marketing.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Tuition:', '', 'Matrícula:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Frais de scolarité:', '', '', '', '', '', '', '', '', '', '', '', '', 'Corso:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mensalidade:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Desconto_em_produtos', 'planos_marketing.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Discount on products:', '', 'De descuento en productos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Remise sur les produits:', '', '', '', '', '', '', '', '', '', '', '', '', 'Sconto sui prodotti:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Desconto em produtos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obs_planos_marketing', 'planos_marketing.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'When registering you can choose one of the plans listed above. Click <a href=clientes/clientes_cadastrar.php> here </ a> and sign up now.', '', 'Al registrarse usted puede elegir uno de los planes mencionados. <a Href=clientes/clientes_cadastrar.php> haga clic aquí </ a> y regístrate ahora.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Lors de l&#039;enregistrement, vous pouvez choisir l&#039;un des plans mentionnés ci-dessus. <a Href=clientes/clientes_cadastrar.php> Cliquez ici </ a> et connectez-vous dès maintenant.', '', '', '', '', '', '', '', '', '', '', '', '', 'Quando la registrazione è possibile scegliere uno dei piani sopra elencati. Fai clic <a href=clientes/clientes_cadastrar.php> qui </ a> e iscriviti adesso.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ao se cadastrar você poderá escolher um desses planos listados acima. Clique <a href=clientes/clientes_cadastrar.php>aqui</a> e cadastre-se já.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Receba_nossa_newsletter', 'newsletter.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Get our newsletter:', '', 'Recibe nuestro boletín:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Recevez notre newsletter:', '', '', '', '', '', '', '', '', '', '', '', '', 'Scarica la nostra newsletter:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Receba nossa newsletter:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Incluir', 'newsletter.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Include', '', 'Incluir', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Inclure', '', '', '', '', '', '', '', '', '', '', '', '', 'Includi', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Incluir', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Excluir', 'newsletter.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Delete', '', 'Borrar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Supprimer', '', '', '', '', '', '', '', '', '', '', '', '', 'Eliminare', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Excluir', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('seu_e_mail_foi_excluido_de_nossa_newsletter', 'newsletter.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'your e-mail was deleted from our newsletter.', '', 'su e-mail se ha eliminado de nuestro boletín.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'votre e-mail a été supprimé de notre newsletter.', '', '', '', '', '', '', '', '', '', '', '', '', 'la tua e-mail è stato eliminato dalla nostra newsletter.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'seu e-mail foi excluido de nossa newsletter.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Seu_e_mail_foi_confirmado', 'newsletter.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Your email has been confirmed and you will receive our newsletter.', '', 'Tu correo ha sido confirmada y recibirá nuestro boletín de noticias.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Votre email a été confirmé et vous recevrez notre newsletter.', '', '', '', '', '', '', '', '', '', '', '', '', 'Il tuo indirizzo email è stato confermato, e riceverai la nostra newsletter.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Seu e-mail foi confirmado e você receberá nossa newsletter.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Esqueci_minha_senha', 'login.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Forgot password?', '', '¿Has olvidado tu contraseña?', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mot de passe oublié?', '', '', '', '', '', '', '', '', '', '', '', '', 'Hai dimenticato la password?', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Clique aqui para lembrar sua senha!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Seu_status', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Your status:', '', 'Tu estado:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Votre statut:', '', '', '', '', '', '', '', '', '', '', '', '', 'Il tuo status:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Seu status:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('proxima_mensalidade', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'next monthly payment:', '', 'pago mensual siguiente:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Prochain paiement mensuel:', '', '', '', '', '', '', '', '', '', '', '', '', 'prossimo pagamento mensile:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'próxima mensalidade:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Efetuar_pagamento_doacao', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Make Payment', '', 'Hacer un pago', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Effectuer un paiement', '', '', '', '', '', '', '', '', '', '', '', '', 'Effettuare il pagamento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Efetuar pagamento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Seu_ciclo_atual', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Your current cycle:', '', 'Su ciclo actual:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Votre cycle en cours:', '', '', '', '', '', '', '', '', '', '', '', '', 'Il tuo ciclo attuale:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Seu ciclo atual:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Neste_ciclo_voce_ira_doar', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'In this cycle you will donate:', '', 'En este ciclo se donará:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Dans ce cycle, vous pourrez faire un don:', '', '', '', '', '', '', '', '', '', '', '', '', 'In questo ciclo si donerà:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Neste ciclo você irá doar:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('e_ira_receber', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'and will receive:', '', 'y recibirá:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'et recevra:', '', '', '', '', '', '', '', '', '', '', '', '', 'e riceverà:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'e irá receber:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Voce_tem', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'You have', '', 'Ha', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Vous avez', '', '', '', '', '', '', '', '', '', '', '', '', 'Hai', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Você têm', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('convidados_ativos_o_total_deve_ser', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'active guests, the total should', '', 'los huéspedes más activos, el total debe', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'clients actifs, le total devrait', '', '', '', '', '', '', '', '', '', '', '', '', 'gli ospiti più attivi, il totale dovrebbe', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'convidados ativos, o total deve ser', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('pessoas', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'people', '', 'gente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'gens', '', '', '', '', '', '', '', '', '', '', '', '', 'persone', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'pessoas', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Proximo_ciclo', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Next cycle:', '', 'Siguiente ciclo:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Prochain cycle:', '', '', '', '', '', '', '', '', '', '', '', '', 'Prossimo ciclo:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Próximo ciclo:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Sua_proxima_doacao_devera_ser_apos_a', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Your donation will be forthcoming after', '', 'Tu donación será después de las próximas', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Votre don sera fournie après', '', '', '', '', '', '', '', '', '', '', '', '', 'La tua donazione sarà prossima dopo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Sua próxima doação deverá ser após a', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('doacao_recebida_do_ciclo_atual', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'donation received from the current cycle', '', 'la donación recibida del ciclo actual', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'don reçu de l actuel cycle', '', '', '', '', '', '', '', '', '', '', '', '', 'donazione ricevuta dal ciclo attuale', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'doação recebida do ciclo atual', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Valor_da_sua_proxima_doacao', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Value of your next donation:', '', 'Valor de su donación siguiente:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Valeur de votre prochain don:', '', '', '', '', '', '', '', '', '', '', '', '', 'Il valore della tua donazione successiva:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Valor da sua próxima doação:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('ERROR', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ERROR:', '', 'ERROR:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ERROR:', '', '', '', '', '', '', '', '', '', '', '', '', 'ERRORE:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ERROR:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Para_gerar_a_primeira_doacao_e_preciso_ter_no_minimo_dois', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'To generate the first donation must be at least two entries in system and is quoted at second than first indicated.', '', 'Para generar la primera donación debe ser de al sistema y se cotiza a segundo que indicó en primer lugar.menos dos entradas en', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pour générer le premier don doit être d au moins deux entrées dans système et est cité au second que d abord indiqué.', '', '', '', '', '', '', '', '', '', '', '', '', 'Per generare la prima donazione deve essere di almeno due voci sistema ed è quotata al secondo che prima indicato.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Para gerar a primeira doação é preciso ter no minimo dois cadastros no sistema e ser indicado pelo segundo que o primeiro indicou.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Doacoes_a_efetuar_pendente_de_confirmacao', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Donations to make / to be confirmed:', '', 'Donaciones para hacer / ser confirmada:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Les dons à faire / à confirmer:', '', '', '', '', '', '', '', '', '', '', '', '', 'Donazioni di fare / essere confermata:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Doações à efetuar/pendente de confirmação:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('PARA', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '-> FOR:', '', '-> Para:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '-> POUR:', '', '', '', '', '', '', '', '', '', '', '', '', '-> PER:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '--> PARA:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Efetuar_doacao', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Make donation', '', 'Hacer donación', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Make donation', '', '', '', '', '', '', '', '', '', '', '', '', 'Fai la donazione', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Efetuar doação', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Enviar_confirmacao', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Send confirmation', '', 'Enviar confirmación', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Envoyer une confirmation', '', '', '', '', '', '', '', '', '', '', '', '', 'Inviare la conferma', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Enviar confirmação', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Re_Efetuar_doacao', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Re-make donation', '', 'Re-hacer una donación', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Re-faire du don', '', '', '', '', '', '', '', '', '', '', '', '', 'Re-make donazione', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Re-efetuar doação', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('VALOR', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'VALUE:', '', 'VALOR:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'VALEUR:', '', '', '', '', '', '', '', '', '', '', '', '', 'VALORE:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'VALOR:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('DE', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '- DE:', '', '- DE:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '- DE:', '', '', '', '', '', '', '', '', '', '', '', '', '- DE:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '--> DE:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Seus_convidados', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Your guests:', '', 'Sus invitados:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Vos invités:', '', '', '', '', '', '', '', '', '', '', '', '', 'I vostri ospiti:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Seus convidados:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('STATUS', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'STATUS:', '', 'ESTADO:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ÉTAT:', '', '', '', '', '', '', '', '', '', '', '', '', 'STATUS:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'STATUS:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('ATIVO', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ASSETS', '', 'ACTIVOS', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ACTIF', '', '', '', '', '', '', '', '', '', '', '', '', 'ATTIVO', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ATIVO', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('INATIVO', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'INACTIVE', '', 'INACTIVO', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'INACTIFS', '', '', '', '', '', '', '', '', '', '', '', '', 'INATTIVO', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'INATIVO', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Doacoes_efetuadas', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Donations made:', '', 'Las donaciones hechas:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Les dons faits:', '', '', '', '', '', '', '', '', '', '', '', '', 'Donazioni effettuate:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Doações efetuadas:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Doacoes_recebidas', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Donations received:', '', 'Donaciones recibidas:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Les dons reçus:', '', '', '', '', '', '', '', '', '', '', '', '', 'Donazioni ricevute:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Doações recebidas:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
");
mysqli_query($link,"INSERT INTO `area123_traducao` (`trad`, `pagina`, `af`, `ar-ae`, `ar-bh`, `ar-dz`, `ar-eg`, `ar-iq`, `ar-jo`, `ar-kw`, `ar-lb`, `ar-ly`, `ar-ma`, `ar-om`, `ar-qa`, `ar-sa`, `ar-sy`, `ar-tn`, `ar-ye`, `be`, `bg`, `ca`, `cs`, `da`, `de`, `de-at`, `de-ch`, `de-li`, `de-lu`, `el`, `en-au`, `en-bz`, `en-ca`, `en-gb`, `en-ie`, `en-jm`, `en-nz`, `en-tt`, `en-us`, `en-za`, `es`, `es-ar`, `es-bo`, `es-cl`, `es-co`, `es-cr`, `es-do`, `es-ec`, `es-gt`, `es-hn`, `es-mx`, `es-ni`, `es-pa`, `es-pe`, `es-pr`, `es-py`, `es-sv`, `es-uy`, `es-ve`, `et`, `eu`, `fa`, `fi`, `fo`, `fr`, `fr-be`, `fr-ca`, `fr-ch`, `fr-lu`, `ga`, `gd`, `he`, `hi`, `hr`, `hu`, `id`, `is`, `it`, `it-ch`, `ja`, `ji`, `ko`, `lt`, `lv`, `mk`, `ms`, `mt`, `nl`, `nl-be`, `no`, `pl`, `pt`, `pt-br`, `rm`, `ro`, `ro-mo`, `ru`, `ru-mo`, `sb`, `sk`, `sl`, `sq`, `sr`, `sv`, `sv-fi`, `sx`, `sz`, `th`, `tn`, `tr`, `ts`, `uk`, `ur`, `ve`, `vi`, `xh`, `zh-cn`, `zh-hk`, `zh-sg`, `zh-tw`, `zu`) VALUES
('Nenhuma_doacao_recebida_confirmada', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'No donation received confirmed!', '', 'Ningún donativo recibido confirmado!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Aucun don reçues ont confirmé!', '', '', '', '', '', '', '', '', '', '', '', '', 'N. donazione ricevute hanno confermato!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nenhuma doação recebida confirmada!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Em_caso_de_nao_conseguir_confirmar_entre_em_contato_pelo_e_mail', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'If you can not confirm contact by e-mail:', '', 'Si no puede confirmar contacto por e-mail:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Si vous ne pouvez pas confirmer contacter par e-mail:', '', '', '', '', '', '', '', '', '', '', '', '', 'Se non è possibile confermare il contatto via e-mail:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Em caso de não conseguir confirmar entre em contato pelo e-mail:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Confirmo_o_recebimento', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirm receipt', '', 'Confirmar la recepción', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirmer la réception', '', '', '', '', '', '', '', '', '', '', '', '', 'Conferma del ricevimento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirmo o recebimento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ver_dados_da_doacao', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'See data donation', '', 'La donación de los datos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Le don de données', '', '', '', '', '', '', '', '', '', '', '', '', 'La donazione di dati', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ver dados da doação', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Doacoes_recebidas_pendentes_de_confirmacao', 'marketing123_doacoes.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Donations received pending confirmation:', '', 'Donaciones recibidas en espera de la confirmación:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Dons reçus en attente de confirmation:', '', '', '', '', '', '', '', '', '', '', '', '', 'Donazioni ricevute in attesa di conferma:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Doações recebidas pendentes de confirmação:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('simbolo', 'geral', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'US$', '', '€', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '€', '', '', '', '', '', '', '', '', '', '', '', '', '€', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R$', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Operadora', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Operator', '', 'Operadora', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Téléphone Co', '', '', '', '', '', '', '', '', '', '', '', '', 'Telefono cia', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Operadora', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('referencia', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Referência', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo01', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo02', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo03', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo04', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo05', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo06', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo07', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo08', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo09', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo10', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo11', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo12', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo13', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo14', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo15', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo16', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo17', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo18', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo19', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('campo20', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('rg', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'RG', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('codigo_interno', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Cadastro_de_novo_cliente_obs', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Preencha os campos abaixo para efetuar um novo cadastro.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_email', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_sexo', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_nascimento', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_cpf', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_empresa', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_cnpj', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_endereco', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_cidade', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_estado', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_cep', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_pais', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_fone1', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_fone2', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_msn', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_icq', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_skype', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_aim', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_email2', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_nome_tec', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_email_tec', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_email_cob', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_nome_cob', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_impostos', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_lingua', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_moeda', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_obs', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_cupom', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_termos', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Favor marcar que leu e concordou com os termos de uso.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_conheceu', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_nota', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_notaobs', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_permissao', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_tipo', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_prioridade', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_oferta', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_patrocinador', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_indicador', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_classe', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_operadora2', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_area_image', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_bairro', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_endereconumero', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_endereco2', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_endereconumero2', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_bairro2', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_cidade2', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_estado2', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_cep2', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_pais2', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_rg', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_ie', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_juridica', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_empresaid', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_empregos_titulo', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_empregos_categoria', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_estadocivil', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_nacionalidade', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_escolaridade', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_referencia', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo01', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
");
mysqli_query($link,"INSERT INTO `area123_traducao` (`trad`, `pagina`, `af`, `ar-ae`, `ar-bh`, `ar-dz`, `ar-eg`, `ar-iq`, `ar-jo`, `ar-kw`, `ar-lb`, `ar-ly`, `ar-ma`, `ar-om`, `ar-qa`, `ar-sa`, `ar-sy`, `ar-tn`, `ar-ye`, `be`, `bg`, `ca`, `cs`, `da`, `de`, `de-at`, `de-ch`, `de-li`, `de-lu`, `el`, `en-au`, `en-bz`, `en-ca`, `en-gb`, `en-ie`, `en-jm`, `en-nz`, `en-tt`, `en-us`, `en-za`, `es`, `es-ar`, `es-bo`, `es-cl`, `es-co`, `es-cr`, `es-do`, `es-ec`, `es-gt`, `es-hn`, `es-mx`, `es-ni`, `es-pa`, `es-pe`, `es-pr`, `es-py`, `es-sv`, `es-uy`, `es-ve`, `et`, `eu`, `fa`, `fi`, `fo`, `fr`, `fr-be`, `fr-ca`, `fr-ch`, `fr-lu`, `ga`, `gd`, `he`, `hi`, `hr`, `hu`, `id`, `is`, `it`, `it-ch`, `ja`, `ji`, `ko`, `lt`, `lv`, `mk`, `ms`, `mt`, `nl`, `nl-be`, `no`, `pl`, `pt`, `pt-br`, `rm`, `ro`, `ro-mo`, `ru`, `ru-mo`, `sb`, `sk`, `sl`, `sq`, `sr`, `sv`, `sv-fi`, `sx`, `sz`, `th`, `tn`, `tr`, `ts`, `uk`, `ur`, `ve`, `vi`, `xh`, `zh-cn`, `zh-hk`, `zh-sg`, `zh-tw`, `zu`) VALUES
('obrigatorio_campo02', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo03', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo04', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo05', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo06', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo07', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo08', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo09', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo10', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo11', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo12', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo13', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo14', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo15', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo16', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo17', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo18', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo19', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_campo20', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_usuario', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Coloque o usuário por favor.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_senha', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Coloque a senha por favor.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_name', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Coloque o nome por favor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_newsletter', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('captcha', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Captcha', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('captcha_obrigatorio', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Captcha digite as letras ao lado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('minisite', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Seu mini-site', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_minisite', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('minisite_detalhes', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '(não use espaço, acento e nem caracter especial - pode informar depois)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('email_confirmar', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirmar e-mail', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_email_confirmar', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirme seu e-mail por favor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('senha_confirmar', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirmar senha', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('obrigatorio_senha_confirmar', 'clientes_cadastrar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirme sua senha por favor', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('alterar_cidade', 'guia_aberto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'change city', '', 'el cambio de la ciudad', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'alterar cidade', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Selecione', 'guia_aberto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Select', '', 'Seleccione', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Selecione', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Definir_cidade_padrao', 'guia_aberto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Set default city', '', 'Establecer una ciudad predeterminada', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Definir cidade padrão', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Selecione_uma_categoria', 'guia_aberto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Select a category', '', 'Seleccione una categoría', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Selecione uma categoria', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ver_todas', 'guia_aberto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'View all ...', '', 'Ver todo ...', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ver todas...', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Buscar', 'guia_aberto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Search', '', 'búsqueda', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Buscar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('resultado', 'guia_aberto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'result', '', 'resultado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'resultado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('encontrado', 'guia_aberto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'found', '', 'fundar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'encontrado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('mostrando', 'guia_aberto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'showing', '', 'que muestra', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'mostrando', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Inicial', 'guia_aberto', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'initial', '', 'Inicio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Inicial', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('cliente_cadastro_necessario', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Must register an account to add ads!', '', 'Debe registrarse una cuenta para añadir que nadie!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Necessário cadastrar um cliente para poder adicionar anúncios!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Mini_site', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'mini site', '', 'Mini sitio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mini site', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Cliente', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'customer', '', 'cliente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Cliente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ativado', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'On', '', 'en', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ativado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Validade', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'validity:', '', 'Validez:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Validade:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nome_empresa', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Name / company', '', 'Nombre / empresa', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nome/empresa', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('CNPJ_CPF', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CNPJ / CPF', '', 'CNPJ / CPF', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CNPJ/CPF', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Fone2', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Fone2', '', 'Fone2', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Fone', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Fax', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Fax', '', 'Fax', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Fax', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('MSN', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'MSN', '', 'MSN', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'MSN', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Voip', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'voip', '', 'voip', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Voip', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Skype', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Skype', '', 'Skype', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Skype', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Site', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'site', '', 'sitio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Site', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Descricao', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Description', '', 'descripción', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Descrição', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Logotipo', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'logo', '', 'logo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Logotipo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Fotos_extras', 'guia_cadastro_form', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'extra Photos', '', 'Fotos adicionales', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Fotos extras', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Adicao_de_anuncio', 'guia123_adicionar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Adding ad', '', 'Adición de anuncios', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Adição de anúncio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Anuncio_adicionado_com_sucesso', 'guia123_adicionar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ad added successfully!', '', 'Anuncio añadido correctamente!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Anúncio adicionado com sucesso!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Seu_anuncio_aguarda_liberacao_do_administrador', 'guia123_adicionar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Your Ad is awaiting release by the Administrator of this site.', '', 'Su anuncio está en espera de la liberación por el administrador de este sitio.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Seu anuncio está aguardando liberação pelo administrador deste site.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Anuncio_adicionado_com_sucesso_obs', 'guia123_adicionar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Added a new ad in the guide on your site, your approval is required for the ad to be active.', '', 'Se ha añadido una nueva ficha en la guía en su sitio, se requiere su aprobación para el anuncio a estar activo.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Foi adicionado um novo anúncio no guia em seu site, sua aprovação é necessária para o anúncio estar ativo.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Voce_precisa_adquirir_creditos_para_ativar_os_anuncios', 'guia123_clientes_guia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'You need to purchase credits to enable ads', '', 'Usted necesita comprar créditos para permitir anuncios', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Você precisa adquirir créditos para ativar os anúncios', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Adquirir_creditos', 'guia123_clientes_guia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'acquire credits', '', 'adquirir créditos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Adquirir créditos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Credito_atual', 'guia123_clientes_guia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'current Credit', '', 'crédito actual', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Crédito atual', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ilimitados', 'guia123_clientes_guia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'unlimited', '', 'Ilimitado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ilimitados', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('anuncios_com_duracao', 'guia123_clientes_guia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ads lasting', '', 'anuncios duraderos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'anúncios com duração', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Os_anuncios_precisam_ser_previamente_aprovados_pelo_administrador_para_entrarem_no_ar', 'guia123_clientes_guia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ads must be approved by the administrator to enter the air.', '', 'Los anuncios deben ser aprobados por el administrador para entrar en el aire.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Os anúncios precisam ser previamente aprovados pelo administrador para entrarem no ar.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Este_sistema_nao_usa_creditos', 'guia123_clientes_guia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'This system does not use credits!', '', 'Este sistema no utiliza créditos!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Este sistema não usa créditos!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Adicionar_Anuncio', 'guia123_clientes_guia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Add Ad', '', 'Agregar Anuncio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Adicionar Anúncio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Anuncios_cadastrados', 'guia123_clientes_guia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'registered ads', '', 'Anuncios registrados', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Anúncios cadastrados', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nenhum_anuncio_cadastrado_ate_o_momento', 'guia123_clientes_guia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'No announcement yet registered.', '', 'No hay anuncio registrados.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nenhum anúncio cadastrado até o momento.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Seus_creditos', 'guia123_clientes_guia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'his credits', '', 'Sus créditos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Seus créditos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pedido_de_creditos', 'guia123_clientes_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Application for credits', '', 'Las solicitudes de créditos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pedido de créditos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pedido_de_credito_excluido_com_sucesso', 'guia123_clientes_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Credit application successfully deleted!', '', 'Solicitud de crédito eliminado correctamente!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pedido de crédito excluído com sucesso!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pedido_de_credito_inserido_com_sucesso', 'guia123_clientes_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Credit application successfully inserted!', '', 'Solicitud de crédito inserta correctamente!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pedido de crédito inserido com sucesso!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Lista_de_pedidos_de_credito', 'guia123_clientes_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'List of credit applications', '', 'Lista de solicitudes de crédito', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Lista de pedidos de crédito', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nenhum_pedido_efetuado_ate_o_momento', 'guia123_clientes_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'No request made ??to date!', '', 'No hay petición realizados hasta la fecha!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nenhum pedido efetuado até o momento!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pedidos', 'guia123_clientes_planos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'order', '', 'solicitudes', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pedidos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Escolha_de_plano', 'guia123_clientes_planos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Choose a plan', '', 'Elegir un plan', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Escolha de plano', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Escolha_de_plano_OBS', 'guia123_clientes_planos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Below you can choose the plan that best suits your needs. After choosing you will have the options of payment and confirmed that registered their ads became active.', '', 'A continuación puede elegir el plan que mejor se adapte a sus necesidades. Después de la elección usted tendrá las opciones de pago y confirmado que registrado sus anuncios se convirtieron en activo.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Abaixo você poderá escolher o plano que mais se adequa a suas necessidades. Após escolher você terá as opções de pagamento, assim que confirmados seus anúncios cadastrado se tornaram ativos.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Plano', 'guia123_clientes_planos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'plan', '', 'plan de', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Plano', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Anuncios', 'guia123_clientes_planos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ads', '', 'Anuncios', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Anúncios', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Duracao', 'guia123_clientes_planos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Duration', '', 'duración', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Duração', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Efetuar_pedido', 'guia123_clientes_planos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Place Order', '', 'Ponga la orden', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Efetuar pedido', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nenhuma_plano_cadastrado_ate_o_momento', 'guia123_clientes_planos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'No plan yet registered.', '', 'Ningún plan registrados.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nenhuma plano cadastrado até o momento.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
");
mysqli_query($link,"INSERT INTO `area123_traducao` (`trad`, `pagina`, `af`, `ar-ae`, `ar-bh`, `ar-dz`, `ar-eg`, `ar-iq`, `ar-jo`, `ar-kw`, `ar-lb`, `ar-ly`, `ar-ma`, `ar-om`, `ar-qa`, `ar-sa`, `ar-sy`, `ar-tn`, `ar-ye`, `be`, `bg`, `ca`, `cs`, `da`, `de`, `de-at`, `de-ch`, `de-li`, `de-lu`, `el`, `en-au`, `en-bz`, `en-ca`, `en-gb`, `en-ie`, `en-jm`, `en-nz`, `en-tt`, `en-us`, `en-za`, `es`, `es-ar`, `es-bo`, `es-cl`, `es-co`, `es-cr`, `es-do`, `es-ec`, `es-gt`, `es-hn`, `es-mx`, `es-ni`, `es-pa`, `es-pe`, `es-pr`, `es-py`, `es-sv`, `es-uy`, `es-ve`, `et`, `eu`, `fa`, `fi`, `fo`, `fr`, `fr-be`, `fr-ca`, `fr-ch`, `fr-lu`, `ga`, `gd`, `he`, `hi`, `hr`, `hu`, `id`, `is`, `it`, `it-ch`, `ja`, `ji`, `ko`, `lt`, `lv`, `mk`, `ms`, `mt`, `nl`, `nl-be`, `no`, `pl`, `pt`, `pt-br`, `rm`, `ro`, `ro-mo`, `ru`, `ru-mo`, `sb`, `sk`, `sl`, `sq`, `sr`, `sv`, `sv-fi`, `sx`, `sz`, `th`, `tn`, `tr`, `ts`, `uk`, `ur`, `ve`, `vi`, `xh`, `zh-cn`, `zh-hk`, `zh-sg`, `zh-tw`, `zu`) VALUES
('Ilimitado', 'guia123_clientes_planos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'unlimited', '', 'Ilimitado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ilimitado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ilimitada', 'guia123_clientes_planos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Unlimited', '', 'Ilimitado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ilimitada', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('dias', 'guia123_clientes_planos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'days', '', 'días', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'dias', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Atualizacao_de_Anuncios', 'guia123_editar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Update Ads', '', 'Actualizar tu anuncio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Atualização de Anúncios', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Anuncio_atualizado_com_sucesso', 'guia123_editar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ad updated successfully!', '', 'Ad actualiza correctamente!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Anúncio atualizado com sucesso!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Tem_certeza_que_deseja_excluir', 'guia123_editar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Has certeza you want to delete?', '', 'Ha certeza que desea eliminar?', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Tem certeza que deseja excluir ?', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Atualizacqao_de_Anuncio', 'guia123_editar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Update Announcement', '', 'Actualización Anuncio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Atualização de Anúncio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Manter_estado', 'guia123_editar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'maintain state', '', 'mantener el estado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Manter estado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('ou_desmarque_e_selecione_abaixo', 'guia123_editar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'below and select or deselect', '', 'abajo y seleccione o anule la selección', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ou desmarque e selecione abaixo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Manter_categoria', 'guia123_editar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'keep category', '', 'Mantenga categoría', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Manter categoria', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('subcategoria', 'guia123_editar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'subcategory', '', 'subcategoría', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'subcategoria', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Selecione_um_estado', 'guia123_editar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '- Select a state -', '', '- Seleccione un estado -', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '-- Selecione um estado --', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Editar', 'guia123_listar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Edit', '', 'editar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Editar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pagamento_nao_confirmado', 'guia123_menu_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Unconfirmed payment', '', 'Pago sin confirmar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagamento não confirmado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Cobranca_enviada', 'guia123_menu_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'sent collection', '', 'colección enviado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Cobrança enviada', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Aviso_de_suspensao', 'guia123_menu_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Notice of suspension', '', 'Aviso de suspensión', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Aviso de suspensão', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Conta_suspensa', 'guia123_menu_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'account suspended', '', 'cuenta suspendida', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Conta suspensa', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Conta_suspensa_obs', 'guia123_menu_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Account suspended for nonpayment', '', 'La cuenta se suspende por falta de pago', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Conta suspensa por falta de pagamento', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pagamento_nao_confirmado_obs', 'guia123_menu_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '  - Credits not yet released, make payment for their credits can be released <br> - then use the Confirm payment so we can release your credits', '', '  - Créditos aún no liberada, efectuar el pago de sus créditos pueden ser liberados <br> - a continuación, utilizar el pago Confirmar para que podamos liberar sus créditos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ' - Créditos ainda não liberado, efetue o pagamento para que seus créditos possam ser liberados<br> - em seguida use a Confirmar pagamento para que possamos liberar seus créditos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('cancelar_pedido_obs', 'guia123_menu_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '  - If you no longer wish may cancel this request', '', '  - Si usted ya no desea podrá cancelar este pedido', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ' - Caso não queira mais você poderá cancelar este pedido', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Cancelar_pedido', 'guia123_menu_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Cancel request', '', 'Cancelar solicitud', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Cancelar pedido', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Conta_cancelada', 'guia123_menu_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'account canceled', '', 'cuenta cancelado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Conta cancelada', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Conta_excluida', 'guia123_menu_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'excluded account', '', 'cuenta Excluidos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Conta excluida', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pedido_n', 'guia123_menu_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Order n.', '', 'Orden n.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pedido n.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Tem_certeza_que_deseja_cancelar_o_pedido', 'guia123_menu_pedidos.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Are you sure you want to cancel the request', '', '¿Seguro que desea cancelar la solicitud', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Tem certeza que deseja cancelar o pedido', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nome_do_minisite', 'guia123_nome_minisite.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Name minisite', '', 'Nombre minisite', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nome do minisite', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Endereco_de_seu_minisite', 'guia123_nome_minisite.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Address your minisite', '', 'Dirija su minisite', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Endereço de seu minisite', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ativar_agora', 'guia123_pagamentos123.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'activate now', '', 'activar ahora', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ativar agora', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('anuncio_ativar_obs', 'guia123_pagamentos123.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '  - Your ad was registered, however, you must activate using one of your credits by clicking the link above.', '', '  - Tu anuncio se registró, sin embargo, debe activar el uso de una de sus créditos haciendo clic en el enlace de arriba.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ' - Seu anúncio foi cadastrado, no entanto, é preciso ativar utilizando um de seus créditos clicando no link acima.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nenhuma_pendencia', 'guia123_pagamentos123.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'No pending', '', 'No pendiente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nenhuma pendência', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Aguardando_aprovacao', 'guia123_pagamentos123.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'waiting for approval', '', 'a la espera de la aprobación', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Aguardando aprovação', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Aguardando_aprovacao_do_administrador_do_site', 'guia123_pagamentos123.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Awaiting approval of the site administrator.', '', 'En espera de la aprobación del administrador del sitio.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Aguardando aprovação do administrador do site.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('StatusStadus', 'guia123_pagamentos123.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Stadus:', '', 'Stadus:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Stadus:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ver_no_site', 'guia123_pagamentos123.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'View on site', '', 'Ver en el sitio', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ver no site', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pendencias', 'guia123_pagamentos123.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'pendencies:', '', 'pendencias:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pendências:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Plano_escolhido', 'guia123_pagamentos123.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Plan chosen:', '', 'Plan elegido:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Plano escolhido:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ciclo', 'guia123_pagamentos123.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'cycle:', '', 'ciclo:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ciclo:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Numero_de_anuncios_permitidos', 'guia123_pagamentos123.inc.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Number of ads allowed:', '', 'Número de anuncios permitidos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Número de anúncios permitidos:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Anuncio_expirado', 'site.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ad expires on', '', 'Anuncio expira el', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Anúncio expirado em', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Erro_e_mail_nao_enviado', 'site.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Error email not sent to', '', 'Error de correo electrónico no se envía al', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Erro e-mail não enviado para', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Mensagem_enviada_com_sucesso', 'site.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Message sent successfully to', '', 'Mensaje enviado con éxito a', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Mensagem enviada com sucesso para', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Saque_em_andamento', 'marketing123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Saque em andamento:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Saque_ja_solicitado_no_valor_de', 'marketing123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Saque já solicitado no valor de', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('e_maior_que_saldo_disponivel', 'marketing123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'é maior que saldo disponível', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('e_menor_que_minimo_permitido_que_e', 'marketing123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'é menor que mínimo permitido que é', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Sacar', 'marketing123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Sacar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Valor_a_ser_sacado', 'marketing123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Valor a ser sacado:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Nota', 'marketing123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Nota:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Saque_limitado_ao_valor_maximo_do_saldo_restante_que_e', 'marketing123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '- Saque limitado ao valor máximo do saldo restante que é:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('O_valor_minimo_para_saque_e_de', 'marketing123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '- O valor mínimo para saque é de ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('O_valor_meu_saldo_e_o_saldo_total_debitado_do_saque_em_andamento', 'marketing123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '- O valor meu saldo é o saldo total debitado do saque em andamento.<br>', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ao_clicar_para_sacar_o_valor_sera_transferido_por_uma_das_formas_de_pagamentos_abaixo_salvas', 'marketing123_sacar.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '- Ao clicar para sacar o valor será transferido por uma das formas de pagamentos abaixo salvas.<br>', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Confirmacao_de_tranferencia', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirmação de tranferencia', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('O_valor_e_maior_que_o_saldo_de', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'O valor é maior que saldo de ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pedido_numero', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pedido número:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Confirmar_transferencia', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirmar transferência', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ao_clicar_em_confirmar_transferencia_os_valores_serao_transferidos', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ao clicar em confirmar transferência os valores serão transferidos.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Transferencia_nao_permitida_para_ativos', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Transferência não permitida para ativos', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Transferencia_nao_permitida_para_inativo', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Transferência não permitida para inativo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Favor_confira_os_dados_abaixo_se_estiver_tudo_certo_clique_em_confirmar', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Favor confira os dados abaixo, se estiver tudo certo clique em confirmar.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('solicitado_de_seu_saldo_com_a_finalidade', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'solicitado de seu saldo com a finalidade:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Transferencia_para', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Transferência para:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pedido', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pedido', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('O_cliente_ja_pagou_adesao', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'O cliente já pagou adesão!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pagamento_adesao_para', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagamento adesão para:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pagamento_upgrade_para', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagamento upgrade para:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pagamento_mensalidade_para', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagamento mensalidade para:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('O_cliente_e_novo_primeiro_e_preciso_pagar_a_adesao', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'O cliente é novo primeiro é preciso pagar a adesão!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('pedido_pago_por', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'pedido pago por', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('valor_divergente', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'OBS: Valor inserido divergente do valor real do pedido, corrija ou complemente posteriormente.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Confirmar', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Confirmar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ao_clicar_em_confirmar_os_valores_serao_debitados', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ao clicar em confirmar os valores serão debitados.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('associado_nao_encontrado', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'associado não encontrado!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('valor_maior_que_saldo_disponível', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#NAME?', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Transferencia_de', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Transferência de:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pagamento_adesao', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagamento adesão', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pagamento_upgrade', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagamento upgrade', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pagamento_mensalidade', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagamento mensalidade', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pagamento_de_pedido_efetuado', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagamento de pedido efetuado', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Transferencia_ja_solicitada_para_realizar_outra_aguarde', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Transferência já solicitada para realizar outra aguarde 1 minuto!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Comprovante_de_transferencia', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Comprovante de transferência', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Conta_de_debito', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Conta de débito:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Conta_de_credito', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Conta de crédito', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
");
mysqli_query($link,"INSERT INTO `area123_traducao` (`trad`, `pagina`, `af`, `ar-ae`, `ar-bh`, `ar-dz`, `ar-eg`, `ar-iq`, `ar-jo`, `ar-kw`, `ar-lb`, `ar-ly`, `ar-ma`, `ar-om`, `ar-qa`, `ar-sa`, `ar-sy`, `ar-tn`, `ar-ye`, `be`, `bg`, `ca`, `cs`, `da`, `de`, `de-at`, `de-ch`, `de-li`, `de-lu`, `el`, `en-au`, `en-bz`, `en-ca`, `en-gb`, `en-ie`, `en-jm`, `en-nz`, `en-tt`, `en-us`, `en-za`, `es`, `es-ar`, `es-bo`, `es-cl`, `es-co`, `es-cr`, `es-do`, `es-ec`, `es-gt`, `es-hn`, `es-mx`, `es-ni`, `es-pa`, `es-pe`, `es-pr`, `es-py`, `es-sv`, `es-uy`, `es-ve`, `et`, `eu`, `fa`, `fi`, `fo`, `fr`, `fr-be`, `fr-ca`, `fr-ch`, `fr-lu`, `ga`, `gd`, `he`, `hi`, `hr`, `hu`, `id`, `is`, `it`, `it-ch`, `ja`, `ji`, `ko`, `lt`, `lv`, `mk`, `ms`, `mt`, `nl`, `nl-be`, `no`, `pl`, `pt`, `pt-br`, `rm`, `ro`, `ro-mo`, `ru`, `ru-mo`, `sb`, `sk`, `sl`, `sq`, `sr`, `sv`, `sv-fi`, `sx`, `sz`, `th`, `tn`, `tr`, `ts`, `uk`, `ur`, `ve`, `vi`, `xh`, `zh-cn`, `zh-hk`, `zh-sg`, `zh-tw`, `zu`) VALUES
('Finalidade', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Finalidade:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Sua_operacao_foi_concluida_e_sera_processada_nos_proximos_instantes', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Sua operação foi concluída e será processada nos próximos instantes', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('transferencia_obs', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Esta opção permite a você transferir seu saldo ou parte dele para um outro associado.<br>Se você tem saldo suficiente e está indicando um novo associado sugerimos que cobre direto dele e transfira o valor para ele pagar a adesão ou mensalidade.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Transferencia_entre_associados', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Transferência entre associados', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Valor_a_ser_transferido', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Valor a ser transferido', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Valor_maximo_limitado_a_seu_saldo', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ' - valor máximo limitado a seu saldo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Numero_do_associado_ou_numero_do_pedido', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Número do associado ou número do pedido:  ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('ex_digitos', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '8 dígitos ex: 00000000', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Pagamento_de_pedido', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pagamento de pedido', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Transferir', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Transferir', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Ao_clicar_em_transferir_sera_mostrado_os_dados_para_voce_confirmar', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ao clicar em transferir será mostrado os dados para você confirmar. ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Sua_conta_nao_possui_saldo_para_efetuar_transferencia', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Sua conta não possui saldo para efetuar transferência!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('Opcoes_de_transferencias_desabilitadas_pelo_administrador', 'marketing123_transferencia.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Opções de transferências desabilitadas pelo administrador.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
('enviar_senha', 'index.php', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Enviar para meu e-mail', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `area123_useronline` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `ip` varchar(15) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `timestamp` varchar(15) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `ip` (`ip`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=0 ;
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `suporte123_chat_cliente` (
  `ccode` varchar(20) COLLATE latin1_general_ci NOT NULL,
  `assign` smallint(4) DEFAULT '0',
  `online` smallint(4) DEFAULT '0',
  `ip` varchar(20) COLLATE latin1_general_ci DEFAULT NULL,
  `code1` smallint(4) DEFAULT '0',
  `code2` smallint(4) DEFAULT '0',
  `lastact` int(10) DEFAULT '0',
  `name` varchar(110) COLLATE latin1_general_ci DEFAULT NULL,
  `email` varchar(50) COLLATE latin1_general_ci DEFAULT NULL,
  `username` varchar(20) COLLATE latin1_general_ci DEFAULT NULL,
  PRIMARY KEY (`ccode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"INSERT INTO `suporte123_chat_cliente` (`ccode`, `assign`, `online`, `ip`, `code1`, `code2`, `lastact`, `name`, `email`, `username`) VALUES
('1345075666503879', 1, 1, '127.0.0.1', 0, 0, 1349369946, 'te4ste', '', '');
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `suporte123_chat_conf` (
  `bname` varchar(254) COLLATE latin1_general_ci NOT NULL,
  `bvalue` varchar(254) COLLATE latin1_general_ci DEFAULT NULL,
  PRIMARY KEY (`bname`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"INSERT INTO `suporte123_chat_conf` (`bname`, `bvalue`) VALUES
('conf_nome_empresa', 'Empresa'),
('conf_dominio_empresa', 'Site'),
('conf_email_empresa', ''),
('conf_assunto_trans', 'Transcrição do chat'),
('conf_Msg1', 'Aguarde, por favor...'),
('conf_Msg2', 'Localizando um atendente online.'),
('conf_Msg3', 'Desculpe, todos os operadores estão ocupados no momento, por favor tente novamente ou deixe-nos uma mensagem utilizando o formulário abaixo:'),
('conf_Msg4', 'Bem vindo(a) ao nosso suporte ao vivo'),
('conf_Msg5', 'Enviando mensagem'),
('conf_Msg6', 'Obrigado'),
('conf_Msg7', 'Um de nossos representantes irá lhe \r\ncontactar assim que possível.'),
('conf_Msg8', 'Por alguma razão não fomos capazes de enviar sua mensagem.\nPor favor, contacte-nos diretamente usando nosso endereço de email\ne desculpe-nos por este inconveniente.'),
('conf_Msg9', 'Nome de usuário'),
('conf_Msg10', 'Senha'),
('conf_Msg11', 'Idioma'),
('conf_Msg12', 'Login'),
('conf_Msg13', 'Nome de usuário e/ou senha inválidos'),
('conf_Msg14', 'Nome de usuário e senha conferem.'),
('conf_Msg15', 'Sair'),
('conf_Msg16', 'Notícias'),
('conf_Msg17', 'Configuração'),
('conf_Msg18', 'No Site'),
('conf_Msg19', 'Usuários aguardando assistência'),
('conf_Msg20', 'Atividade de rede'),
('conf_Msg21', 'Cliente à espera'),
('conf_Msg22', 'Usuários online'),
('conf_Msg23', 'Novidades e eventos'),
('conf_Msg24', 'Configurações'),
('conf_Msg25', 'Geral'),
('conf_Msg26', 'Strings'),
('conf_Msg27', 'Staff'),
('conf_Msg28', 'Licença'),
('conf_Msg29', 'Empresa'),
('conf_Msg30', 'Domínio'),
('conf_Msg31', 'Endereço de email para mensagens'),
('conf_Msg32', 'Assunto para mensagens'),
('conf_Msg33', 'Espere por um atendente'),
('conf_Msg34', 'segundos'),
('conf_Msg35', 'Use tradutor de idiomas'),
('conf_Msg36', 'Salvar'),
('conf_Msg37', 'Reload'),
('conf_Msg38', 'Textos e Idiomas'),
('conf_Msg39', 'Se você obteve uma licença, por favor copie e cole aqui.'),
('conf_Msg40', 'Novo'),
('conf_Msg41', 'Atualizar'),
('conf_Msg42', 'Remover'),
('conf_Msg43', 'Power User'),
('conf_Msg44', 'Accesso recusado para usuários normais'),
('conf_Msg45', 'Configuração Salva.'),
('conf_Msg46', 'Responder'),
('conf_Msg47', 'Descartar'),
('conf_Msg48', 'Fechar'),
('conf_Msg49', 'Nome'),
('conf_Msg50', 'Entrar'),
('conf_Msg51', 'ENVIAR'),
('conf_Msg52', 'Admin está digitando ...'),
('conf_Msg53', 'Em espera, favor aguarde ...'),
('conf_Msg54', 'Sistema de suporte ao vivo'),
('conf_Msg55', 'Seu nome'),
('conf_Msg56', 'Seu email'),
('conf_Msg57', 'Mensagem'),
('conf_Msg58', 'DEIXAR MENSAGEM'),
('conf_Msg59', 'Você selecionou um atendente, porém ela(a) está indisponível agora.  Por favor, aguarde e obrigado pela paciência.'),
('conf_Msg60', 'Você pode cancelar a chamada e deixar uma mensagem.'),
('conf_Msg61', 'Em espera'),
('conf_Msg62', 'Tirar da espera'),
('conf_Msg63', 'Por em espera'),
('conf_Msg64', 'Fim de conversa'),
('conf_Msg65', 'Transcrição'),
('conf_Msg66', 'Ainda online?'),
('conf_Msg67', 'Email de origem'),
('conf_Msg68', 'Email de destino'),
('conf_Msg69', 'Cancelar'),
('conf_Msg70', 'Enviar'),
('conf_Msg71', 'Não'),
('conf_Msg72', 'Sim'),
('conf_Msg73', 'Pronto'),
('conf_Msg74', 'Erro ao enviar transcrição do chat'),
('conf_Msg75', 'Pegar email do cliente'),
('conf_Msg76', 'Endereço IP'),
('conf_Msg77', 'Email'),
('conf_Msg78', 'Em chat com'),
('conf_Msg79', 'Cliente'),
('conf_Msg80', 'Cliente está em espera agora'),
('conf_Msg81', 'Cliente está no chat'),
('conf_Msg82', 'Cliente Ainda está online'),
('conf_Msg83', 'Conexão encerrada'),
('conf_Msg84', 'Cliente digita'),
('conf_Msg85', 'Você'),
('conf_Msg86', 'Conectado em'),
('conf_Msg87', 'Use Direita para esquerda'),
('conf_Msg88', 'Enviar email em texto simples'),
('conf_Msg89', 'Erro de conexão'),
('conf_tempo_espera', '60'),
('conf_cliente_linguas', '0'),
('conf_email_cliente', '0'),
('conf_direita_esquerda', '0'),
('conf_email_texto', '1'),
('conf_licensa', ''),
('conf_funcionario0', 'admin:21232f297a57a5a743894a0e4a801fc3:1'),
('adm_login_time', '1353548478'),
('fss_g_admin_134936846889925', 'Bom dia!');
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `suporte123_chat_msg` (
  `ttime` double(25,8) NOT NULL,
  `ccode` varchar(20) COLLATE latin1_general_ci DEFAULT NULL,
  `msg` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  `code1` smallint(4) DEFAULT '0',
  `code2` smallint(4) DEFAULT '0',
  PRIMARY KEY (`ttime`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `suporte123_dpto` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL DEFAULT '',
  `pophost` varchar(200) NOT NULL DEFAULT '',
  `popuser` varchar(200) NOT NULL DEFAULT '',
  `poppass` varchar(200) NOT NULL DEFAULT '',
  `popport` int(10) NOT NULL DEFAULT '25',
  `email` varchar(200) NOT NULL DEFAULT '',
  `assinatura` text NOT NULL,
  `oculto` int(1) NOT NULL DEFAULT '0',
  `dpto_ordem` smallint(5) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10 ;
");

mysqli_query($link,"INSERT INTO `suporte123_dpto` (`id`, `nome`, `pophost`, `popuser`, `poppass`, `popport`, `email`, `assinatura`, `oculto`, `dpto_ordem`) VALUES
(1, 'Financeiro', '', '', '', 587, '', 'Atenciosamente,\r\n Departamento Financeiro\r\n', 0, 0),
(2, 'Suporte', '', '', '', 587, '', 'Atenciosamente,\r\n Departamento de Suporte\r\n', 0, 0),
(3, 'Vendas', '', '', '', 587, '', 'Atenciosamente,\r\n Departamento de Vendas\r\n', 0, 0),
(4, 'SAC', '', '', '', 587, '', 'Atenciosamente,\r\n Serviço de atendimento ao consumidor', 0, 0),
(5, 'Marketing', '', '', '', 587, '', 'Atenciosamente,\r\n Departamento de Marketing', 0, 0),
(6, 'Alertas', '', '', '', 587, '', '', 1, 0);
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `suporte123_msg` (
  `id` int(9) NOT NULL AUTO_INCREMENT,
  `assunto` varchar(200) NOT NULL DEFAULT '',
  `msg` longtext NOT NULL,
  `tipo` varchar(100) NOT NULL DEFAULT '',
  `painel` varchar(100) NOT NULL DEFAULT '',
  `servico` varchar(100) NOT NULL DEFAULT '',
  `atualizadoem` date NOT NULL DEFAULT '0000-00-00',
  `staff` varchar(50) NOT NULL DEFAULT '',
  `depto` varchar(200) NOT NULL DEFAULT '',
  `pasta` varchar(250) NOT NULL,
  `free3` char(1) NOT NULL DEFAULT '',
  `free4` char(1) NOT NULL DEFAULT '',
  `free5` char(1) NOT NULL DEFAULT '',
  `free6` char(1) NOT NULL DEFAULT '',
  `free7` char(1) NOT NULL DEFAULT '',
  UNIQUE KEY `1` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=130 ;

");
mysqli_query($link,"INSERT INTO `suporte123_msg` (`id`, `assunto`, `msg`, `tipo`, `painel`, `servico`, `atualizadoem`, `staff`, `depto`, `pasta`, `free3`, `free4`, `free5`, `free6`, `free7`) VALUES
(67, 'Seja bem vindo: Confirme o cadastro', '#NOME#,\r\n\r\nseja bem vindo ao nosso site, clique no link abaixo para confirmar o cadastro e poder acessar o escritório virtual.\r\n\r\n--------------------------------\r\n#LINKCONFIRMACAO#\r\n--------------------------------\r\n\r\n#ASSINATURA#', 'Confirmação de cadastro', '', '', '2012-07-09', '', '', '', 'f', 'f', 'f', 'f', 'f'),
(121, 'Matrícula em curso', '#NOME#,\r\n\r\nObrigado por cadastrar um curso conosco.\r\n\r\nDados de sua conta:\r\n-------------------\r\nUsuário: #LOGIN#\r\n  Senha: #SENHA#\r\n-------------------\r\n\r\nPara que possamos ativar seu cruso é preciso que você efetue o pagamento da primeira mensalidade.\r\n\r\nOferecemos as opções abaixo:\r\n========================================\r\nO valor é: R$ #VALOR#\r\n========================================\r\n#PAGAMENTO#\r\n========================================\r\n\r\nEfetuado o pagamento iremos ativar sua conta de imediato e enviar as instruções.\r\n\r\nQualquer dúvida estamos a disposição para esclarecer.\r\n\r\nÉ um prazer tê-lo como nosso cliente, seja bem vindo a nossa empresa!\r\n', 'Nova assinatura', '', 'Alunos', '2012-03-23', '', '', 'alunos123', 'f', 'f', 'f', 'f', 'f'),
(122, 'Motivo do não pagamento do curso', '#NOME#,\r\n\r\nem #DATACADASTRO# você se cadastrou em nosso site #SITE#  para um curso.\r\n\r\nAté o momento não verificamos o pagamento.\r\n\r\nPara a liberação de sua conta efetue o pagamento. O seu mês começará a contar a partir da liberação.\r\n\r\nOferecemos 3 opções - depósito/transferência, boleto ou cartão:\r\n====================================\r\nO valor de cada mensalidade é: R$ #VALOR#\r\n====================================\r\n#BANCOS#\r\n------------------------\r\n::Boleto bancário (pagável em qualquer banco, casa lotérica ou home banking)::\r\nhttp://#SITE#/clientes/\r\n------------------------\r\n::Cartão de Crédito::\r\nAcesse sua área restrita no link abaixo e clique em Efetuar Pagamento\r\nhttp://#SITE#/clientes/\r\n========================\r\n\r\n\r\nQualquer dúvida estamos a disposição\r\n\r\nAtenciosamente,\r\n #DEPARTAMENTO#', 'Ver motivo', '', 'Alunos', '2012-03-23', '', '', 'alunos123', 'f', 'f', 'f', 'f', 'f'),
(123, 'Confirmação de pagamento', '#NOME#,\r\n\r\nesta é uma confirmação que você efetuou o pagamento do curso.\r\n\r\nConfirmamos hoje: #HOJE# que foi pago R$ #VALOR#pago referente a #PAGODE# até #PAGOATE#. #OBS#\r\n\r\n==================================\r\nSeu próximo vencimento será em: #VENCIMENTO#\r\nEsta cobrança já está disponível em sua área de cliente\r\n==================================\r\n\r\nÉ um prazer ter você como nosso cliente. \r\n\r\nQualquer dúvida estamos a disposição.\r\n\r\nAtenciosamente,\r\n#DEPARTAMENTO#', 'Confirmação de pagamento', '', 'Alunos', '2012-03-23', '', '', 'alunos123', 'f', 'f', 'f', 'f', 'f'),
(124, 'Matrícula confirmada', '#NOME#,\r\n\r\nsua matricula foi ativada.\r\n\r\nDúvidas adicionais entre em contato conosco\r\n\r\n\r\nAtenciosamente,\r\n Departamento Financeiro', 'Ativação de matrícula', '', 'Alunos', '2012-03-23', '', '', 'alunos123', 'f', 'f', 'f', 'f', 'f'),
(125, 'Cobrança de mensalidade', '#NOME#,\r\n\r\nSegue a cobrança referente a mensalidade.\r\n\r\nOferecemos 3 opções - depósito/transferência, boleto ou cartão:\r\n========================================\r\nO valor de cada mensalidade é: R$ #VALOR#\r\nDesconto/acréscimo.............R$ #DIFERENCA#\r\n----------------------------------------\r\nTotal..........................R$ #TOTAL#\r\n========================================\r\n#PAGAMENTO#\r\n========================================\r\n\r\nConfirmado o pagamento enviaremos um e-mail.\r\n\r\n\r\nQualquer dúvida envie-nos um e-mail para #DESTEMAIL# .\r\n\r\n#ASSINATURA#', 'Cobrança', '', 'Alunos', '2012-03-23', '', '', 'alunos123', 'f', 'f', 'f', 'f', 'f'),
(126, 'Cobrança de mensalidade reenviada', '#NOME#,\r\n\r\naté o momento não confirmamos o pagamento de seu curso que venceu em #VENCIMENTO# no valor de R$ #TOTAL# .\r\n\r\nCaso já tenha pago, envie-nos os dados do pagamento respondendo este e-mail ou via telefone.\r\n\r\nCaso ainda não tenha pago siga as instruções abaixo:\r\n\r\nOferecemos 3 opções - depósito/transferência, boleto ou cartão:\r\n========================================\r\nO valor de cada mensalidade é: R$ #VALOR#\r\nDesconto/acréscimo.............R$ #DIFERENCA#\r\n----------------------------------------\r\nTotal..........................R$ #TOTAL#\r\n========================================\r\n#BANCOS#\r\n------------------------\r\n::Boleto bancário (pagável em qualquer banco, casa lotérica ou home banking)::\r\nhttp://#SITE#/clientes/\r\n------------------------\r\n::Cartão de Crédito::\r\nAcesse sua área restrita no link abaixo e clique em Efetuar Pagamento\r\nhttp://#SITE#/clientes/\r\n========================\r\n\r\nVerificado o pagamento enviaremos a confirmação.\r\n\r\nMantenha seu pagamento em dia para evitar que seu site saia do ar por falta de pagamento.\r\n\r\nQualquer dúvida envie-nos um e-mail.\r\n\r\n\r\nAtenciosamente,\r\n #DEPARTAMENTO#', 'Cobrança reenviada', '', 'Alunos', '2012-03-23', '', '', 'alunos123', 'f', 'f', 'f', 'f', 'f'),
(127, 'Curso suspenso', '#NOME#\r\n\r\nseu curso foi suspenso por falta de pagamento.\r\n\r\nPara regularizar entre em contato conosco.\r\n\r\nAtenciosamente,\r\n#DEPARTAMENTO#', 'Suspensão', '', 'Alunos', '2012-03-23', '', '', 'alunos123', 'f', 'f', 'f', 'f', 'f'),
(128, 'Exclusão de matrícula', '#NOME#,\r\n\r\nem #DATACADASTRO# você foi cadastrado para um curso em nossa escola.\r\n\r\nViemos informar que seu cadastro foi apagado devido ao não pagamento. Caso queira poderá se cadastrar novamente em:\r\nhttp://#SITE#/clientes/\r\n\r\nQualquer dúvida estamos a disposição.\r\n\r\n\r\nAtenciosamente,\r\n#DEPARTAMENTO#', 'Exclusão', '', 'Alunos', '2012-03-23', '', '', 'alunos123', 'f', 'f', 'f', 'f', 'f'),
(52, 'Confirmação de pagamento', '#NOME#,\r\n\r\nconfirmamos o pagamento dos anúncios automotivos.\r\n\r\nQualquer dúvida estamos a disposição por e-mail.\r\n\r\nAtenciosamente,\r\n #DEPARTAMENTO#', 'Confirmação de pagamento', '', 'autos123', '2007-05-28', 'admin', 'Financeiro', 'autos123', 'f', 'f', 'f', 'f', 'f'),
(53, 'Manual dos produtos', 'Este painel visa facilitar o uso do site pelo cliente, automatizando o sistema.\r\n\r\nClientes são os donos dos veículos que utilizam o site para anunciar os veículos podendos colocar a descrição fotos e demais dados após a assinatura. Há dois tipos de clientes, o cliente particular que anuncia um veículo, e o cliente agência, que além de anunciar os veículos ainda terá um site exclusivo para sua agência.\r\n\r\n::Passo a passo de como anunciar um veículo::\r\n\r\n- Acessar o link [Minha conta] http://www.SEUSITE.cm.br/clientes/ ;\r\n- Caso não tenha uma conta, terá opção neste mesmo link de criar uma;\r\n- Após logar no sistema você deve [Adquirir créditos] é um dos links do menu\r\n- Você irá escolher um dos planos e fazer o pedido dele\r\n- Em seguida efetuar o pagamento no link: [Efetuar pagamento]\r\n- Depois [Confirmar pagamento]\r\n- Para cadastrar o veículo clique em [Cadastro de autos] e [Adicionar novo Auto]\r\n- Preencha o maior número de campos possível e submeta\r\n- Vá em: [Cadastro de autos] e clique em [Ativar agora] é necessário ter créditos.\r\n\r\nFeito isso o anúncio estará ativado e estará mostrando no site.\r\n\r\nCaso você queira uma agência (site específico) solicite ao Administrador para liberar, assim terá uma opção para editar o layout dela e um link de acesso. Para editar automaticamente o layout é só enviar os arquivos de imagens no link [Minha agência].\r\n\r\n...........\r\nAdministrador para editar este manual, entre no Adm123 e edite a mensagem 53', 'Manual', '', 'autos123', '2007-05-28', 'admin', 'Suporte', 'autos123', 'f', 'f', 'f', 'f', 'f'),
(112, 'Confirmação de pagamento', '#NOME#,\r\n\r\nesta é uma confirmação que você efetuou o pagamento.\r\n\r\nConfirmamos hoje: #HOJE# que foi pago R$ #VALOR#pago referente a #PAGODE# até #PAGOATE#. #OBS#\r\n\r\n==================================\r\nSeu próximo vencimento será em: #VENCIMENTO#\r\nEsta cobrança já está disponível em sua área de cliente\r\n==================================\r\n\r\nÉ um prazer ter você como nosso cliente. \r\n\r\nQualquer dúvida estamos a disposição.\r\n\r\nAtenciosamente,\r\n#DEPARTAMENTO#', 'Confirmação de pagamento', '', 'Contabilidade', '2009-07-27', 'admin', 'Financeiro', 'contabilidade123', 'f', 'f', 'f', 'f', 'f'),
(113, 'Cobrança de fatura', '#NOME#,\r\n\r\nSegue a cobrança referente a sua mensalidade.\r\n\r\nSua mensalidade tem vencimento em: #VENCIMENTO# \r\n\r\nOferecemos 3 opções - depósito/transferência, boleto ou cartão:\r\n========================================\r\nO valor de cada mensalidade é: R$ #VALOR#\r\n========================================\r\n#PAGAMENTO#\r\n========================================\r\n\r\nConfirmado o pagamento enviaremos um e-mail.\r\n\r\n\r\nQualquer dúvida envie-nos um e-mail para #DESTEMAIL# .\r\n\r\n#ASSINATURA#', 'Cobrança', '', '', '2013-10-17', '', '', 'contabilidade123', 'f', 'f', 'f', 'f', 'f'),
(129, 'Taxa de condominio', '#NOME#\r\n\r\ntaxa de condomínio favor efetuar o pagamento.\r\n\r\n#SITE#/fatura/#NUMERO#A#VALOR#\r\n\r\n#DEPARTAMENTO#\r\n#ASSINATURA#', 'Taxa de condominio', '', '', '2014-09-25', '', '', 'condominio123', 'f', 'f', 'f', 'f', 'f'),
(54, 'Manual de utilização do marketing de rede', 'Manual de utilização do marketing de rede', 'Manual para o cliente', '', 'Dinheiro123', '2007-07-02', 'admin', 'Suporte', 'dinheiro123', 'f', 'f', 'f', 'f', 'f'),
(56, 'Seja bem vindo ao Marketing de rede', '#NOME#,\r\n\r\nrecebemos seu cadastro seja bem vindo a nosso novo e lucrativo negocio.\r\n\r\nA área de login é:\r\n#SITE#clientes/\r\n\r\nÉ um prazer ter você aqui conosco.\r\n\r\n#ASSINATURA#', 'Novo associado', '', '', '2012-07-09', '', '', 'dinheiro123', 'f', 'f', 'f', 'f', 'f'),
(57, 'Novo patrocinador em sua rede', 'Entrou agora um novo patrocinador em sua rede.\r\n\r\nVeja detalhes entrando em sua área de associado.', 'Novo patrocinador', '', 'Dinheiro123', '2007-07-02', '', 'Suporte', 'dinheiro123', '', '', '', '', ''),
(58, 'Novo associado no sistema', 'Entrou um novo associado no sistema.', 'Novo associado no sistema', '', 'Dinheiro123', '2007-07-02', '', 'Suporte', 'dinheiro123', '', '', '', '', ''),
(59, 'Associação ativada', '#NOME#,\r\n\r\nparabéns sua associação foi ativada, agora você faz parte deste lucrativo negócio.\r\n\r\nSeu mini-site:\r\n#MINISITE#\r\n\r\n#ASSINATURA#', 'Ativação de associado', '', '', '2013-11-09', '', '', 'dinheiro123', 'f', 'f', 'f', 'f', 'f'),
(60, 'Downline ativada', '#NOME#,\r\n\r\nSua downline foi ativa, agora você já está ganhando comissões\r\n\r\n#ASSINATURA#', 'Aviso ao patrocinador da downline ativa', '', 'Dinheiro123', '2007-07-02', '', 'Suporte', 'dinheiro123', '', '', '', '', ''),
(61, 'Lembrete de senha', '#NOME#,\r\n\r\nconforme solicitado segue aqui os dados de acesso a sua área de associado.\r\n\r\n#SITE#clientes/\r\nLogin: #LOGIN#\r\nSenha: #SENHA#\r\n\r\n#ASSINATURA#', 'Lembrete de senha', '', '', '2012-07-09', '', '', 'dinheiro123', 'f', 'f', 'f', 'f', 'f'),
(62, 'Exclusão de associação', '#NOME#,\r\n\r\nsua associação em nosso sistema foi excluida.\r\n\r\n#ASSINATURA#', 'Exclusão de associado', '', '', '2012-07-09', '', '', 'dinheiro123', 'f', 'f', 'f', 'f', 'f'),
(63, 'Cobrança de mensalidade', '#NOME#\r\n\r\nsua conta tem vencimento em: #VENCIMENTO# favor efetuar o pagamento.\r\n\r\n#PAGAMENTO#\r\n\r\n#ASSINATURA#', 'Cobrança de mensalidade', '', 'Dinheiro123', '2007-07-02', '', 'Financeiro', 'dinheiro123', '', '', '', '', ''),
(64, 'Aviso de exclusão', '#NOME#\r\n\r\nsua conta teve vencimento em: #VENCIMENTO# favor efetuar o pagamento para que sua conta não seja excluida de nosso sistema.\r\n\r\n#PAGAMENTO#\r\n\r\n#ASSINATURA#', 'Aviso de exclusão', '', 'Dinheiro123', '2007-07-02', '', 'Suporte', 'dinheiro123', '', '', '', '', ''),
(65, 'Cadastro pendente', '#NOME#,\r\n\r\naté o momento não verificamos o pagamento para efetivar a sua associação em nosso sistema de Marketing de Rede.\r\n\r\n#PAGAMENTO#\r\n\r\n#ASSINATURA#', 'Motivo do não pagamento do cadastro', '', 'Dinheiro123', '2007-07-10', '', 'Suporte', 'dinheiro123', '', '', '', '', ''),
(66, 'Comissão convertida em mensalidade', '#NOME#,\r\n\r\nparte de sua comissão foi convertida em uma mensalidade.\r\n\r\n#ASSINATURA#', 'Conversão de comissão em mensalidade', '', 'Dinheiro123', '2007-07-10', 'admin', 'Financeiro', 'dinheiro123', '', '', '', '', ''),
(69, 'Aprenda a trabalhar na internet', '#DESTINATARIO#,\r\n\r\nconheci esse sistema e achei fantástico e gostaria de lhe indicar para que você, como eu, tenha também uma renda superior a R$ 1000,00 mensais dependendo do seu empenho! O funcionamento é por indicação e você ganha comissão tanto dos indicados diretos como dos indicados indiretos.\r\n\r\nComece já esse lucrativo negócio clicando no link:\r\n#SITE##ID#\r\n\r\nEste e-mail não é SPAM visto que foi enviado por um amigo seu: #NOME# que é associado a nosso sistema.\r\n\r\n#ASSINATURA#', 'Convite para associação', '', '', '2013-11-09', '', '', 'dinheiro123', 'f', 'f', 'f', 'f', 'f'),
(111, 'Aviso de suspensão', '#NOME#\r\n\r\nSua conta foi suspensa por falta de pagamento poi a mesma venceu em: #VENCIMENTO# favor efetuar o pagamento para que a mesma possa ser Re-Ativada.\r\n\r\n#PAGAMENTO#\r\n\r\n#ASSINATURA#\r\n\r\n', 'Aviso de suspensão', '', 'Marketing', '2009-04-03', '', '', 'dinheiro123', 'f', 'f', 'f', 'f', 'f'),
(21, 'Novo registro', '#NOME#,\r\n\r\nobrigado por registrar um domínio conosco: www.#DOMINIO#\r\n\r\nPara que ele seja liberado efetue o pagamento.\r\n===========================\r\n#PAGAMENTO#\r\n===========================\r\n\r\nAssim que confirmarmos o pagamento ativaremos seu domínio.\r\n\r\nCaso não tenha mais interesse no domínio www.#DOMINIO# não precisa fazer nada ele será automaticamente excluido por nosso sistema em 2 semanas, iremos infomar antes que isso aconteça.\r\n\r\nQualquer dúvida estamos a disposição por e-mail.\r\n\r\nAtenciosamente,\r\n #DEPARTAMENTO#', 'Novo registro', '', 'Domínio', '2008-12-01', '', '', 'dominios123', 'f', 'f', 'f', 'f', 'f'),
(22, 'Motivo do não pagamento do domínio', '#NOME#,\r\n\r\nvocê está recebendo este e-mail por ter feito um pedido de registro para: www.#DOMINIO#\r\n\r\nAté o momento não verificamos seu pagamento e por isso ele não está disponível. Gostariamos de saber se podemos ajudar em alguma coisa e saber qual o motivo do não pagamento.\r\n\r\nPara ativar seu domínio agora efetue o pagamento conforme as opções abaixo:\r\n===========================\r\n#PAGAMENTO#\r\n===========================\r\n\r\nAssim que confirmarmos o pagamento ativaremos seu domínio.\r\n\r\nCaso não tenha mais interesse no domínio www.#DOMINIO# não precisa fazer nada ele será automaticamente excluido por nosso sistema em 2 semanas, iremos infomar antes que isso aconteça.\r\n\r\nQualquer dúvida estamos a disposição.\r\n\r\nAtenciosamente,\r\n #DEPARTAMENTO#', 'Ver motivo', '', 'Domínio', '2005-04-14', 'admin', 'Financeiro', 'dominios123', 'f', 'f', 'f', 'f', 'f'),
(23, 'Confirmação de pagamento', '#NOME#,\r\n\r\nconfirmamos o pagamento de seu domínio #DOMINIO#, ele será liberado/renovado nos próximos instantes e terá validade até #VENCIMENTO#\r\n\r\n#ASSINATURA#', 'Confirmação de pagamento de domínio', '', 'Domínio', '2007-05-02', 'admin', 'Financeiro', 'dominios123', 'f', 'f', 'f', 'f', 'f'),
(24, 'Liberação do domínio', '#NOME#,\r\n\r\nseu domínio encontra-se liberado e estará funcionando nos próximos minutos.\r\n\r\nPara editar os dns''s entre em: \r\n#SITE#/clientes/dominios123_dns.php\r\n\r\n#DEPARTAMENTO#', 'Liberação do domínio', '', 'Domínio', '2007-04-24', 'admin', 'Financeiro', 'dominios123', '', '', '', '', ''),
(25, 'Cobrança de domínio', '#NOME#,\r\n\r\nSegue a cobrança referente a anuidade do domínio: #DOMINIO#\r\n\r\nSua anuidade tem vencimento em: #VENCIMENTO#\r\n\r\n===========================\r\n#PAGAMENTO#\r\n===========================\r\n\r\nConfirmado o pagamento enviaremos uma mensagem.\r\n\r\nQualquer dúvida entre em contato.\r\n\r\nAtenciosamente,\r\n#DEPARTAMENTO#', 'Cobrança', '', 'Domínio', '2008-12-01', '', '', 'dominios123', 'f', 'f', 'f', 'f', 'f'),
(26, 'Nova cobrança de domínio', '#NOME#,\r\n\r\naté o momento não confirmamos o pagamento da anuidade do domínio: #DOMINIO#\r\n\r\nSua anuidade teve vencimento em: #VENCIMENTO#\r\n\r\n#PAGAMENTO#\r\n\r\nConfirmado o pagamento enviaremos uma mensagem.\r\n\r\nQualquer dúvida entre em contato.\r\n\r\nAtenciosamente,\r\n #DEPARTAMENTO#', 'Nova cobrança', '', 'Domínio', '2005-09-13', 'admin', 'Financeiro', 'dominios123', 'f', 'f', 'f', 'f', 'f'),
(27, 'Aviso de suspensão', '#NOME#,\r\n\r\ndevido a não confirmação do pagamento referente a anuidade do domínio: #DOMINIO# o mesmo foi suspenso.\r\n\r\nSua anuidadevenceu em: #VENCIMENTO#\r\n\r\nCaso tenha interessa em manter o domínio efetue o pagamento o quanto antes e nos informe para que possamos liberar.\r\n\r\n#PAGAMENTO#\r\n\r\nConfirmado o pagamento enviaremos o recibo.\r\n\r\nQualquer dúvida entre em contato conosco.\r\n\r\nAtenciosamente,\r\n#DEPARTAMENTO#', 'Aviso de suspensão', '', 'Domínio', '2005-04-15', 'admin', 'Financeiro', 'dominios123', 'f', 'f', 'f', 'f', 'f'),
(28, 'Exclusão de Domínio', '#NOME#,\r\n\r\ninformamos que devido ao não pagamento do domínio #DOMINIO# ele foi excluido.\r\n\r\nAtenciosamente,\r\n#DEPARTAMENTO#', 'Exclusão', '', 'Domínio', '2004-11-22', 'admin', 'Financeiro', 'dominios123', '', '', '', '', ''),
(29, 'Manual do domínio', 'Este painel visa facilitar o uso do site pelo cliente, automatizando o sistema.\r\n\r\nNele é possível efetuar pagamentos por diversos meios como boleto. Confirmar o pagamento, solicitar suporte, ver recibos e diversas outras funções úteis.\r\n\r\nInstruções para registrar um domínio:\r\n - clique em adicionar domínio;\r\n - faça a busca e se tiver disponível irá aparecer um botão para registrar;\r\n - clique no registrar e preencha os dados;\r\n - efetue o pagamento e confirme o pagamento;\r\n - assim que confirmado será liberado e enviado um aviso.\r\n\r\n...........\r\nAdministrador para editar este manual, entre no Adm123 e edite a mensagem 29.', 'Manual', '', 'Domínio', '2007-04-25', 'admin', 'Financeiro', 'dominios123', 'f', 'f', 'f', 'f', 'f'),
(68, 'Novo domínio adicionado', 'Prezado Administrador,\r\n\r\nfoi adicionado um novo domínio no site: #DOMINIO#\r\n\r\nServiço de alerta do sistema de domínios.', 'Novo domínio adicionado', '', 'Alertas', '2007-08-28', 'admin', 'Alertas', 'dominios123', 'f', 'f', 'f', 'f', 'f'),
(85, 'Conta liberada', '#NOME#,\r\n\r\nseu pagamento foi confirmado e seu login foi liberado para fazer downloadsa completos.\r\n--------------------------------\r\nhttp://#SITE#/\r\n--------------------------------\r\n\r\nAtenciosamente,\r\n#ASSINATURA#', '', '', 'Conta liberada', '2008-06-10', '', '', 'downloads123', 'f', 'f', 'f', 'f', 'f'),
(86, 'Renovação de cadastro', '#NOME#,\r\n\r\nseu cadastro está prestes a expirar ou expirou. Entre em e renove:\r\n--------------------------------\r\nhttp://#SITE#/clientes/\r\n--------------------------------\r\n\r\nAtenciosamente,\r\nEquipe de apoio', '', '', 'Renovação de cadastro', '2008-06-10', '', '', 'downloads123', 'f', 'f', 'f', 'f', 'f'),
(87, 'Ative sua conta', '#NOME#,\r\n\r\nvocê fez um cadastro em nosso site e até o momento não ativou. Ative de imediato entrando em:\r\n--------------------------------\r\nhttp://#SITE#/clientes/\r\n--------------------------------\r\nAtenciosamente,\r\nEquipe de apoio\r\n\r\n', '', '', 'Ative sua conta', '2008-06-10', '', '', 'downloads123', 'f', 'f', 'f', 'f', 'f'),
(75, 'Cadastro efetuado com sucesso', '#NOME#,\r\n\r\né um prazer ter você aqui conosco. Em nosso site você conseguirá alcançar seus objetivos.\r\n\r\nAtencisoamente,\r\nEquipe de apoio', 'Boas vindas', '', 'Cadastramento', '2008-02-27', '', '', 'encontros123', '', '', '', '', ''),
(76, 'Mensagem enviada!', 'Esta é uma mensagem automática do site\r\nde relacionamento - NÃO RESPONDA ESTE E-MAIL\r\n--------------------------------------\r\nOlá #REMETENTE#,\r\nEsta é a confirmação de que você entrou no site\r\nde relacionamento e enviou uma mensagem para #NOME#.\r\n\r\nPara ver o perfil completo de #NOME# clique em:\r\n#SITE#/perfil_completo.php?idperfil=#IDPERFIL#\r\n\r\n.....................\r\nMensagem enviada:\r\n#MENSAGEM#\r\n.....................\r\n\r\n\r\nEquipe de apoio\r\n_____________________________________\r\nEsta é uma mensagem automática do site\r\nde relacionamento - NÃO RESPONDA ESTE E-MAIL\r\n\r\nSeu site de relacionamento', 'Confirmação de mensagem enviada', '', '', '2012-10-05', '', '', 'encontros123', 'f', 'f', 'f', 'f', 'f'),
(77, 'Você recebeu uma mensagem!', 'Olá #NOME#,\r\n\r\nVocê acaba de receber uma mensagem do site de relacionamento!\r\nMensagem de #REMETENTE# - #REMETENTEEMAIL#:\r\n_____________________________________\r\n#MENSAGEM#\r\n\r\n#REMETENTEPERFIL#\r\n\r\n_____________________________________\r\n\r\nVocê recebeu esta mensagem por possuir um cadastro no site de relacionamento.\r\nSe foi alguma pessoa que cadastrou utilizando seus dados, favor entre em \r\nnosso site e promova o seu descadastramento.\r\n\r\nEquipe de apoio', 'Mensagem para o perfil', '', 'Mensagem', '2008-02-28', 'admin', '', 'encontros123', 'f', 'f', 'f', 'f', 'f'),
(78, 'Exclusão por abuso', '#NOME#,\r\n\r\nseu cadastro no site de relacionamento foi excluido por abuso.\r\n\r\nAtenciosamente,\r\nEquipede apoio', 'Exclusão por abuso', '', 'Exclusão', '2008-02-27', '', '', 'encontros123', '', '', '', '', ''),
(79, 'Cadastro excluido', '#NOME#,\r\n\r\nseu cadastro foi excluido de nosso site de relacionamento devido a seu pedido.\r\n\r\nAtenciosamente,\r\nEquipe de apoio', 'Exclusão pelo cliente', '', 'Exclusão', '2008-02-27', '', '', 'encontros123', '', '', '', '', ''),
(80, 'Você indicou um perfil!', 'Olá #DESTNOME#,\r\nEsta mensagem foi enviada a partir do site de relacionamento por alguém que estava visitando.\r\nEsta pessoa viu o perfil abaixo e achou interessante lhe indicar.\r\n\r\n__________________________________________\r\nPara ver o perfil indicado clique no link abaixo:\r\n\r\n#SITE#/perfil_completo.php?idperfil=#IDPERFIL#\r\n\r\n#MENSAGEM#\r\n\r\n\r\nA indicação foi feita por: #NOME# #EMAIL#\r\n\r\n__________________________________________\r\nEste site é usado para divulgação pessoal e profissional. As pessoas o utilizam para dilvulgar suas profissões, fazer amizades, paqueras, namoro e até casamento. Tudo grátis !\r\n\r\n\r\nVisite-nos:\r\n#SITE#', 'Indicação de perfil', '', '', '2012-10-05', '', '', 'encontros123', 'f', 'f', 'f', 'f', 'f'),
(81, 'Perfil indicado por você', '#NOME#,\r\n\r\nEsta é uma confirmação que você indicou um perfil para #DESTNOME# #DESTEMAIL# .\r\n\r\nO Perfil indicado foi:\r\n#SITE#/perfil_completo.php?idperfil=#IDPERFIL#\r\n\r\n\r\nEsta confirmação é enviada para que você saiba que ela ocorreu, caso você não tenha enviado, alguém utilizando seu e-mail a enviou, neste caso você poderá informar quem a recebeu, que não foi você quem indicou.\r\n', 'Confirmação de indicação do Perfil', '', 'Mensagem', '2008-02-28', '', '', 'encontros123', '', '', '', '', ''),
(83, 'Pagamento confirmado', '#NOME#,\r\n\r\nseu pagamento foi confirmado e sua conta ativada até #VENCIMENTO#.\r\n\r\n#ASSINATURA#', 'Pagamento confirmado', '', 'Pagamento', '2008-04-16', '', '', 'encontros123', 'f', 'f', 'f', 'f', 'f'),
(84, 'Ative sua conta hoje mesmo', '#NOME#,\r\n\r\naproveite, ative sua conta hoje mesmo no plano anual e ganhe o livro The Secret.\r\n\r\nAtenciosamente,\r\nEquipe do marketing', 'Convite a se ativar', '', 'Marketing', '2008-04-16', '', '', 'encontros123', '', '', '', '', ''),
(120, 'Cobrança do anúncio', '#NOME#,\r\n\r\nSegue a cobrança referente a mensalidade do anuncio\r\n\r\nSua mensalidade tem vencimento em: #VENCIMENTO# \r\n\r\nO valor de cada mensalidade é: R$ 100,00/mês.\r\n\r\n========================================\r\n#PAGAMENTO#\r\n========================================\r\n\r\nConfirmado o pagamento enviaremos um e-mail.\r\n\r\nQualquer dúvida envie-nos um e-mail para #DESTEMAIL# .\r\n\r\n#ASSINATURA#', 'Cobrança', '', 'Cobrança', '2010-09-21', '', '', 'encontros123', 'f', 'f', 'f', 'f', 'f'),
(1, 'Assinatura de hospedagem', '#NOME#,\r\n\r\nObrigado por assinar uma conta de hospedagem conosco.\r\n\r\nDados de sua conta:\r\nDomínio: #DOMINIO#\r\n-------------------\r\nUsuário: #LOGIN#\r\n  Senha: #SENHA#\r\n-------------------\r\n\r\nPara que possamos ativar sua conta é preciso que você efetue o pagamento da primeira mensalidade.\r\n\r\nOferecemos as opções abaixo:\r\n========================================\r\nO valor é: R$ #VALOR#\r\n========================================\r\n#PAGAMENTO#\r\n========================================\r\n\r\nEfetuado o pagamento iremos ativar sua conta de imediato e enviar as instruções.\r\n\r\nQualquer dúvida estamos a disposição para esclarecer.\r\n\r\nÉ um prazer tê-lo como nosso cliente, seja bem vindo a nossa empresa!\r\n', 'Nova assinatura', '', 'Hospedagem', '2010-01-19', '', '', 'host123', 'f', 'f', 'f', 'f', 'f'),
(2, 'Motivo do não pagamento da Hospedagem', '#NOME#,\r\n\r\nem #DATACADASTRO# você se cadastrou em nosso site #SITE#  para uma conta de hospedagem para: #DOMINIO#\r\n\r\nSua conta não foi liberada pois até o momento não verificamos seu pagamento. Gostariamos de saber se podemos ajudar em alguma coisa e saber qual o motivo do não pagamento.\r\n\r\nPara a liberação de sua conta efetue o pagamento. O seu mês começará a contar a partir da liberação.\r\n\r\nOferecemos 3 opções - depósito/transferência, boleto ou cartão:\r\n====================================\r\nO valor de cada mensalidade é: R$ #VALOR#\r\n====================================\r\n#BANCOS#\r\n------------------------\r\n::Boleto bancário (pagável em qualquer banco, casa lotérica ou home banking)::\r\nhttp://#SITE#/clientes/\r\n------------------------\r\n::Cartão de Crédito::\r\nAcesse sua área restrita no link abaixo e clique em ''Efetuar Pagamento''\r\nhttp://#SITE#/clientes/\r\n========================\r\n\r\n\r\nQualquer dúvida estamos a disposição\r\n\r\nAtenciosamente,\r\n #DEPARTAMENTO#', 'Ver motivo', '', 'Hospedagem', '2007-09-20', 'admin', '', 'host123', 'f', 'f', 'f', 'f', 'f'),
(3, 'Confirmação de pagamento', '#NOME#,\r\n\r\nesta é uma confirmação que você efetuou o pagamento para a hospedagem do site: #DOMINIO#\r\n\r\nConfirmamos hoje: #HOJE# que foi pago R$ #VALOR# pago referente a #PAGODE# até #PAGOATE#. #OBS#\r\n\r\n==================================\r\nSeu próximo vencimento será em: #VENCIMENTO#\r\nEsta cobrança já está disponível em sua área de cliente\r\n==================================\r\n\r\nÉ um prazer ter você como nosso cliente. \r\n\r\nQualquer dúvida estamos a disposição.\r\n\r\nAtenciosamente,\r\n#DEPARTAMENTO#', 'Confirmação de pagamento', '', 'Hospedagem', '2007-08-27', 'admin', 'Financeiro', 'host123', 'f', 'f', 'f', 'f', 'f'),
(4, 'Hospedagem liberada', '#NOME#,\r\n\r\nsua conta de hospedagem já está configurada, seus dados de acesso são:\r\n----------------------------\r\nDomínio: http://www.#DOMINIO# ou somente http://#DOMINIO#\r\nUsuário: #LOGIN#\r\nSenha: #SENHA#\r\nhostadress: #IP# ou #DOMINIO# (quando for liberado pela empresa em que o registrou)\r\n----------------------------\r\n\r\n::::Previsão do site::::\r\nVocê pode acessar seu site para verificar antes do domínio estar funcionando em:\r\nhttp://#IP#/~#LOGIN#/\r\n\r\n\r\n::::Enviando o site::::\r\n\r\nHá 2 opções de envio do site: via ftp (por programas ou browser) ou http (no painel de controle).\r\n\r\nOs arquivos que já se encontram em sua conta NÃO DEVEM SER APAGADOS OU ALTERADOS. Eles são essenciais para o perfeito funcionamento de sua conta e também de todas as demais características de sua hospedagem conosco. Use index.html como página principal para ser chamada pelo servidor.\r\n\r\n-Via FTP:\r\nVocê pode usar programas de FTP como FTP explorer ou WS_FTP ou simplesmete usar o protocolo FTP via o próprio browser(ftp://ftp.#DOMINIO#) ele utiliza o próprio explorer do windows, utilize os dados que irá pedir:\r\n\r\nO envio deve ser feito para a pasta www ou public_html. O envio e como se você estivesse movimentando arquivos entre pastas normais.\r\n\r\n-Via http:\r\nBasta acessar o painel de cotrole em www.#DOMINIO#/cpanel clicar em serviços, depois gerenciamento de arquivos depois clicar na pasta www e clicar enviar arquivos, irá aparecer várias caixa para procurar o arquivo em seu computador, ao selecionar todos basta clicar em enviar.\r\n\r\n-Via Front Page:\r\nPeça nos que instalemos as extensões Front Page. Basta configurar com seus dados normais.\r\n\r\n::::Painel de Controle::::\r\nhttp://#DOMINIO#/cpanel/ ou http://#IP#/cpanel/\r\nUsuário: #LOGIN#\r\nSenha: #SENHA#\r\n\r\nNo painel de controle você tem acesso as estatísticas, criação de contas de e-mail, acesso aos scripts pré-configurados e uma série de outras funções.\r\n\r\n::::DNS::::\r\nSe você está utilizando um domínio próprio você deve atualizar a tabela de DNS junto a empresa que registrou seu domínio. Nossos DNS são:\r\n\r\n#DNS#\r\n\r\nFeito a atualização o novo DNS passa a funcionar às 5 horas da manhã quando as empresas de registro efetivam as modificações.\r\n\r\n::::Pagamentos::::\r\nhttp://#SITE#/clientes/\r\nUtilize seu nome de usuário e senha. \r\nAqui é possível pegar os dados do banco ou o boleto bancário. Bem como ver a data do vencimento\r\n\r\n::::Webmail:::: \r\nhttp://#DOMINIO#/webmail/ (após a transferência do domínio, é preciso colocar a / no final, do contrário não funciona)\r\nObs: no webmail, informe a conta arroba domínio quando perguntado. Por exemplo, joao@#DOMINIO# \r\n\r\nVocê não será capaz de usar o seu programa de administração de e-mails ou enviar e receber mensagens para seu novo domínio até que o seu domínio seja transferido pela entidade responsável pelo seu domínio.\r\n \r\nPara receber mensagens via POP3 basta ir até o painel de controle e clicar na configuração automática de e-mails pop3.\r\n\r\nDúvidas adicionais entre em contato conosco\r\n\r\n\r\nAtenciosamente,\r\n Departamento Financeiro', 'Liberação de hospedagem linux', '', 'Hospedagem', '2007-08-26', 'admin', 'Financeiro', 'host123', 'f', 'f', 'f', 'f', 'f'),
(5, 'Cobrança de hospedagem', '#NOME#,\r\n\r\nSegue a cobrança referente a mensalidade da hospedagem do site: #DOMINIO#\r\n\r\nSua mensalidade tem vencimento em: #VENCIMENTO# \r\n\r\nOferecemos 3 opções - depósito/transferência, boleto ou cartão:\r\n========================================\r\nO valor de cada mensalidade é: R$ #VALOR#\r\nDesconto/acréscimo.............R$ #DIFERENCA#\r\n----------------------------------------\r\nTotal..........................R$ #TOTAL#\r\n========================================\r\n#PAGAMENTO#\r\n========================================\r\n\r\nConfirmado o pagamento enviaremos um e-mail.\r\n\r\n\r\nQualquer dúvida envie-nos um e-mail para #DESTEMAIL# .\r\n\r\n#ASSINATURA#', 'Cobrança', '', 'Hospedagem', '2008-12-06', '', '', 'host123', 'f', 'f', 'f', 'f', 'f'),
(6, 'Cobrança de hospedagem reenviada', '#NOME#,\r\n\r\naté o momento não confirmamos o pagamento de sua conta de hospedagem referente ao site: #DOMINIO# que venceu em #VENCIMENTO# no valor de R$ #TOTAL# .\r\n\r\nCaso já tenha pago, envie-nos os dados do pagamento respondendo este e-mail ou via telefone.\r\n\r\nCaso ainda não tenha pago siga as instruções abaixo:\r\n\r\nOferecemos 3 opções - depósito/transferência, boleto ou cartão:\r\n========================================\r\nO valor de cada mensalidade é: R$ #VALOR#\r\nDesconto/acréscimo.............R$ #DIFERENCA#\r\n----------------------------------------\r\nTotal..........................R$ #TOTAL#\r\n========================================\r\n#BANCOS#\r\n------------------------\r\n::Boleto bancário (pagável em qualquer banco, casa lotérica ou home banking)::\r\nhttp://#SITE#/clientes/\r\n------------------------\r\n::Cartão de Crédito::\r\nAcesse sua área restrita no link abaixo e clique em ''Efetuar Pagamento''\r\nhttp://#SITE#/clientes/\r\n========================\r\n\r\nVerificado o pagamento enviaremos a confirmação.\r\n\r\nMantenha seu pagamento em dia para evitar que seu site saia do ar por falta de pagamento.\r\n\r\nQualquer dúvida envie-nos um e-mail.\r\n\r\n\r\nAtenciosamente,\r\n #DEPARTAMENTO#', 'Cobrança reenviada', '', 'Hospedagem', '2007-04-18', 'admin', 'Financeiro', 'host123', 'f', 'f', 'f', 'f', 'f'),
(7, 'Hospedagem suspensa', '#NOME#\r\n\r\nseu site #DOMINIO# foi suspenso por falta de pagamento.\r\n\r\nPara regularizar entre em contato conosco.\r\n\r\nAtenciosamente,\r\n#DEPARTAMENTO#', 'Suspensão', '', 'Hospedagem', '2007-04-18', '', 'Financeiro', 'host123', '', '', '', '', ''),
(8, 'Exclusão de Hospedagem', '#NOME#,\r\n\r\nem #DATACADASTRO# você se cadastrou para uma hospedagem em nosso site #SITE#\r\n\r\nViemos informar que seu cadastro foi apagado devido ao não pagamento. Caso queira poderá se cadastrar novamente em:\r\nhttp://#SITE#/clientes/\r\n\r\nQualquer dúvida estamos a disposição.\r\n\r\n\r\nAtenciosamente,\r\n#DEPARTAMENTO#', 'Exclusão', '', 'Hospedagem', '2004-11-19', 'admin', 'Financeiro', 'host123', '', '', '', '', ''),
(82, 'Pagamento confirmado', '#NOME#,\r\n\r\ninformamos que foi confirmado o pagamento efetuado no valor total de #VALOR# total. O pedido agora está em processamento.\r\n\r\n#ASSINATURA#', 'Confirmação de pagamento', '', '', '2012-07-09', '', '', 'loja123', 'f', 'f', 'f', 'f', 'f'),
(41, 'Novo pedido [#PRODUTO#]', '#NOME#,\r\n\r\nagradecemos seu interesse em nosso produto:\r\n-------------------------------------------\r\n#PRODUTO#\r\n-------------------------------------------\r\n\r\nPara que ele seja enviado efetue o pagamento.\r\n===========================\r\n#PAGAMENTO#\r\n===========================\r\n\r\nAssim que confirmarmos o pagamento enviaremos o produto.\r\n\r\nCaso não tenha mais interesse não precisa fazer nada ele será automaticamente excluido por nosso sistema em 2 semanas, iremos infomar antes que isso aconteça.\r\n\r\nQualquer dúvida estamos a disposição por e-mail.\r\n\r\n #DEPARTAMENTO#', 'Novo pedido', '', '', '2013-04-09', '', '', 'pedidos123', 'f', 'f', 'f', 'f', 'f'),
(42, 'Motivo do não pagamento [#PRODUTO#]', '#NOME#,\r\n\r\nvocê está recebendo este e-mail por ter feito um pedido do produto:\r\n-------------------------------------------\r\n#PRODUTO#\r\n-------------------------------------------\r\n\r\nAté o momento não verificamos seu pagamento e por isso ele não foi enviado. Gostariamos de saber se podemos ajudar em alguma coisa e saber qual o motivo do não pagamento.\r\n\r\nPara que ele seja enviado efetue o pagamento.\r\n===========================\r\n#PAGAMENTO#\r\n===========================\r\n\r\nAssim que confirmarmos o pagamento enviaremos o produto.\r\n\r\nCaso não tenha mais interesse não precisa fazer nada ele será automaticamente excluido por nosso sistema em 2 semanas, iremos infomar antes que isso aconteça.\r\n\r\nQualquer dúvida estamos a disposição por e-mail.\r\n\r\n #ASSINATURA#', 'Motivo do não pagamento', '', '', '2013-04-09', '', '', 'pedidos123', 'f', 'f', 'f', 'f', 'f'),
(43, 'Confirmação de pagamento', '#NOME#,\r\n\r\nconfirmamos o pagamento do produto adquirido:\r\n-------------------------------------------\r\n#PRODUTO#\r\n-------------------------------------------\r\n\r\nAssim que for liberado, enviaremos um e-mail informando.\r\n\r\nQualquer dúvida estamos a disposição por e-mail.\r\n\r\n\r\n #ASSINATURA#', 'Confirmação de pagamento', '', '', '2013-04-10', '', '', 'pedidos123', 'f', 'f', 'f', 'f', 'f'),
(44, 'Liberação do produto', '#NOME#,\r\n\r\no produto está liberado e você poderá pegá-lo em:\r\n\r\n#SITE#/clientes/download.php?e=#DESTEMAIL#&n=#NUMERO#\r\n\r\nQualquer dúvida estamos a disposição por e-mail.\r\n\r\nAtenciosamente,\r\n #DEPARTAMENTO#', 'Liberação do produto', '', 'Pedidos123', '2007-06-20', 'admin', 'Financeiro', 'pedidos123', 'f', 'f', 'f', 'f', 'f'),
(45, 'Produto enviado', '#NOME#,\r\n\r\ninformamos que o produto:\r\n-------------------------------------------\r\n#PRODUTO#\r\n-------------------------------------------\r\n\r\nfoi postado para o endereço:\r\n-------------------------------------------\r\n#ENDERECO#\r\n-------------------------------------------\r\n\r\nQualquer dúvida entre em contato.\r\n\r\nAtenciosamente,\r\n #DEPARTAMENTO#', 'Produto enviado', '', 'Pedidos123', '2007-06-20', 'admin', 'Financeiro', 'pedidos123', 'f', 'f', 'f', 'f', 'f'),
(46, 'Manual dos produtos', 'Este painel visa facilitar o uso do site pelo cliente, automatizando o sistema.\r\n\r\nNele é possível efetuar pagamentos por diversos meios como boleto. Confirmar o pagamento, solicitar suporte, ver recibos e diversas outras funções úteis.\r\n\r\n\r\n...........\r\nAdministrador para editar este manual, entre no Adm123 e edite a mensagem 46', 'Manual', '', 'Pedidos123', '2007-06-20', 'admin', 'Suporte', 'pedidos123', 'f', 'f', 'f', 'f', 'f'),
(88, 'Cadastro de serviço', '#NOME#,\r\n\r\nObrigado por cadastrar um serviço conosco.\r\n\r\nDados do seu cadastro:\r\n-------------------\r\nUsuário: #LOGIN#\r\n  Senha: #SENHA#\r\n-------------------\r\n\r\nPara que possamos realizar o serviço é preciso que você efetue o pagamento.\r\n\r\nOferecemos 3 opções - depósito/transferência, boleto ou cartão:\r\n========================================\r\nO valor de cada mensalidade é: R$ #VALOR#\r\nDesconto/acréscimo.............R$ #DIFERENCA#\r\n----------------------------------------\r\nTotal..........................R$ #TOTAL#\r\n========================================\r\n#PAGAMENTO#\r\n========================\r\n\r\nEfetuado o pagamento iremos ativar sua conta de imediato e enviar as instruções.\r\n\r\nQualquer dúvida estamos a disposição para esclarecer.\r\n\r\nÉ um prazer tê-lo como nosso cliente, seja bem vindo a nossa empresa!\r\n\r\n#ASSINATURA#', 'Novo cadastro', '', '', '2012-07-09', '', '', 'servicos123', 'f', 'f', 'f', 'f', 'f'),
(89, 'Motivo do não pagamento do serviço', '#NOME#,\r\n\r\nem #DATACADASTRO# você se cadastrou em nosso site #SITE#  para um serviço.\r\n\r\nPara a realização do serviço.\r\n\r\n====================================\r\nO valor de cada mensalidade é: R$ #VALOR#\r\n====================================\r\n#PAGAMENTO#\r\n========================\r\n\r\nQualquer dúvida estamos a disposição\r\n\r\n\r\n #ASSINATURA#', 'Ver motivo', '', '', '2012-07-09', '', '', 'servicos123', 'f', 'f', 'f', 'f', 'f'),
(90, 'Confirmação de pagamento', '#NOME#,\r\n\r\nesta é uma confirmação que você efetuou o pagamento para o serviço.\r\n\r\nConfirmamos hoje: #HOJE# que foi pago R$ #VALOR# pago referente a #PAGODE# até #PAGOATE#. #OBS#\r\n\r\n==================================\r\nSeu próximo vencimento será em: #VENCIMENTO#\r\nEsta cobrança já está disponível em sua área de cliente\r\n==================================\r\n\r\nÉ um prazer ter você como nosso cliente. \r\n\r\nQualquer dúvida estamos a disposição.\r\n\r\n\r\n#ASSINATURA#', 'Confirmação de pagamento', '', '', '2012-07-09', '', '', 'servicos123', 'f', 'f', 'f', 'f', 'f'),
(91, 'Serviço concluido', '#NOME#,\r\n\r\no serviço já está concluído.\r\n\r\nDúvidas adicionais entre em contato conosco.\r\n\r\n#ASSINATURA#', 'Serviço concluido', '', '', '2012-07-09', '', '', 'servicos123', 'f', 'f', 'f', 'f', 'f'),
(92, 'Cobrança de serviço', '#NOME#,\r\n\r\nSegue a cobrança referente a mensalidade do serviço.\r\n\r\nSua mensalidade tem vencimento em: #VENCIMENTO# \r\n\r\nOferecemos 3 opções - depósito/transferência, boleto ou cartão:\r\n========================================\r\nO valor de cada mensalidade é: R$ #VALOR#\r\nDesconto/acréscimo.............R$ #DIFERENCA#\r\n----------------------------------------\r\nTotal..........................R$ #TOTAL#\r\n========================================\r\n#PAGAMENTO#\r\n========================================\r\n\r\nConfirmado o pagamento enviaremos um e-mail.\r\n\r\n\r\nQualquer dúvida envie-nos um e-mail.\r\n\r\n#ASSINATURA#', 'Cobrança', '', '', '2012-07-09', '', '', 'servicos123', 'f', 'f', 'f', 'f', 'f'),
(93, 'Cobrança de serviço reenviada', '#NOME#,\r\n\r\naté o momento não confirmamos o pagamento do serviço venceu em #VENCIMENTO# no valor de R$ #TOTAL# .\r\n\r\nCaso já tenha pago, envie-nos os dados do pagamento respondendo este e-mail ou via telefone.\r\n\r\nCaso ainda não tenha pago siga as instruções abaixo:\r\n\r\nOferecemos 3 opções - depósito/transferência, boleto ou cartão:\r\n========================================\r\nO valor de cada mensalidade é: R$ #VALOR#\r\nDesconto/acréscimo.............R$ #DIFERENCA#\r\n----------------------------------------\r\nTotal..........................R$ #TOTAL#\r\n========================================\r\n#PAGAMENTO#\r\n========================\r\n\r\nVerificado o pagamento enviaremos a confirmação.\r\n\r\nMantenha seu pagamento em dia para evitar que seu site saia do ar por falta de pagamento.\r\n\r\nQualquer dúvida envie-nos um e-mail.\r\n\r\n\r\n#ASSINATURA#', 'Cobrança reenviada', '', '', '2012-07-09', '', '', 'servicos123', 'f', 'f', 'f', 'f', 'f'),
(94, 'Serviço suspenso', '#NOME#\r\n\r\nseu site serviço foi suspenso por falta de pagamento.\r\n\r\nPara regularizar entre em contato conosco.\r\n\r\n#ASSINATURA#', 'Suspensão', '', '', '2012-07-09', '', '', 'servicos123', 'f', 'f', 'f', 'f', 'f'),
(95, 'Exclusão de serviço', '#NOME#,\r\n\r\nem #DATACADASTRO# você se cadastrou para um serviço em nosso site #SITE#\r\n\r\nViemos informar que seu cadastro foi apagado devido ao não pagamento. Caso queira poderá se cadastrar novamente em:\r\nhttp://#SITE#/clientes/\r\n\r\nQualquer dúvida estamos a disposição.\r\n\r\n\r\n#ASSINATURA#', 'Exclusão', '', '', '2012-07-09', '', '', 'servicos123', 'f', 'f', 'f', 'f', 'f'),
(70, 'Lembrar protocolo do ticket', '%%NAME%%,\r\n\r\nEste email contém uma lista com os últimos tickets que foram enviados com este e-mail. Foram encontrados %%NUM%% tickets que são:\r\n\r\n%%LIST_TICKETS%%\r\n\r\n\r\n***NÃO RESPONDA A ESTE E-MAIL***\r\n\r\nEstá é uma mensagem automática enviado por nosso sistema de suporte.\r\n\r\nPara responder clique em um dos tickets conforme mostrado acima.\r\n\r\nAtenciosamente,\r\n\r\n%%SITE_TITLE%%\r\n%%SITE_URL%%', 'Lembrar protocolo do ticket', '', 'Tickets', '2007-10-08', 'admin', 'Alertas', 'suporte123', 'f', 'f', 'f', 'f', 'f'),
(71, 'Nova respota do cliente', '%%NAME%% respondeu ao ticket %%SUBJECT%% com protocolo %%TRACK_ID%%\r\n\r\nPara ver a resposta por favor clique aquí:\r\n\r\n%%TRACK_URL%%\r\n\r\n***NÃO RESPONDA A ESTE E-MAIL***\r\n\r\nEsta é uma mensagem automática enviada por nosso sistema de suporte.\r\n\r\nNão responda este e-mail que ele não será lido! Para respondermos, clique no link acima.', 'Nova respota do cliente', '', 'Tickets', '2007-10-08', '', 'Alertas', 'suporte123', '', '', '', '', ''),
(72, 'Nova resposta do funcionário', 'Estimado(a) %%NAME%%,\r\n\r\nSeu ticket com o asunto %%SUBJECT%% foi respondido por nossa equipe.\r\n\r\nPara ver a resposta, clique aquí:\r\n\r\n%%TRACK_URL%%\r\n\r\n\r\n***NÃO RESPONDA A ESTE E-MAIL***\r\n\r\nEstá é uma mensagem automática enviado por nosso sistema de suporte.\r\n\r\nPara responder clique em um dos tickets conforme mostrado acima.\r\n\r\nAtenciosamente,\r\n\r\n%%SITE_TITLE%%\r\n%%SITE_URL%%', 'Nova resposta do funcionário', '', 'Tickets', '2007-10-08', '', 'Alertas', 'suporte123', '', '', '', '', ''),
(73, 'Novo ticket', '%%NAME%%,\r\n\r\nA solicitação: %%SUBJECT%% foi enviada a nosso sistema de suporte.  Iremos responder o mais rápido possível.\r\n\r\nO número de seu ticket é: %%TRACK_ID%%\r\n\r\nPara ver o estado em que se encontra seu ticket para modificá-lo ou adicionar algum dado adicional, poderá clicar no seguinte link:\r\n\r\n\r\n%%TRACK_URL%%\r\n\r\n\r\n***NÃO RESPONDA A ESTE E-MAIL***\r\n\r\nEstá é uma mensagem automática enviado por nosso sistema de suporte.\r\n\r\nPara responder clique em um dos tickets conforme mostrado acima.\r\n\r\nAtenciosamente,\r\n\r\n%%SITE_TITLE%%\r\n%%SITE_URL%%', 'Novo ticket', '', 'Tickets', '2007-10-08', '', 'Alertas', 'suporte123', '', '', '', '', ''),
(74, 'Alerta novo ticket', 'Um novo ticket foi criado com os seguintes dados:\r\n\r\nTítulo do ticket: %%SUBJECT%%\r\nNúmero do ticket: %%TRACK_ID%%\r\nNome do cliente: %%NAME%%\r\n\r\nClique aqui para respondé-lo:\r\n\r\n%%TRACK_URL%%\r\n\r\n***NÃO RESPONDA A ESTE E-MAIL***\r\n\r\nEstá é uma mensagem automática enviado por nosso sistema de suporte.\r\n\r\nPara responder clique em um dos tickets conforme mostrado acima.\r\n\r\nAtenciosamente,\r\n\r\n%%SITE_TITLE%%\r\n%%SITE_URL%%', 'Alerta novo ticket', '', 'Tickets', '2007-10-08', '', 'Alertas', 'suporte123', '', '', '', '', '');
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_agenda` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `franquia` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `data` date NOT NULL DEFAULT '0000-00-00',
  `titulo` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `informacoes` text COLLATE latin1_general_ci NOT NULL,
  `local` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cidade` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `imagem` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `destaque` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=1 ;
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_banners` (
  `idbanner` int(8) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `bclientenumero` varchar(10) COLLATE latin1_general_ci NOT NULL,
  `burl` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `barquivo` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `balt` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `bgrupo` varchar(50) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `bcat` int(10) NOT NULL DEFAULT '0',
  `bsub` int(10) NOT NULL DEFAULT '0',
  `bstatus` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `bultimo` int(14) NOT NULL DEFAULT '0',
  `bacessos` int(10) NOT NULL DEFAULT '0',
  `bcliques` int(10) NOT NULL DEFAULT '0',
  `bexpiracliques` int(10) NOT NULL DEFAULT '0',
  `bexpiraacessos` int(10) NOT NULL DEFAULT '0',
  `binicio` date NOT NULL DEFAULT '0000-00-00',
  `bexpiraadata` date NOT NULL DEFAULT '0000-00-00',
  `bfiltros` longtext COLLATE latin1_general_ci,
  `bpais` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `bhtml` longtext COLLATE latin1_general_ci NOT NULL,
  PRIMARY KEY (`idbanner`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=4 ;
");

mysqli_query($link,"INSERT INTO `mdl123_banners` (`idbanner`, `bclientenumero`, `burl`, `barquivo`, `balt`, `bgrupo`, `bcat`, `bsub`, `bstatus`, `bultimo`, `bacessos`, `bcliques`, `bexpiracliques`, `bexpiraacessos`, `binicio`, `bexpiraadata`, `bfiltros`, `bpais`, `bhtml`) VALUES
(00000001, '', 'http://www.sseusite.com.br/', 'destaque1.jpg', 'Coloque um texto aqui!!!', 'destaque', 0, 0, '1', 1348177783, 409, 0, 0, 0, '2012-08-29', '0000-00-00', '', '', ''),
(00000002, '', '', 'destaque2.jpg', '!', 'destaque', 0, 0, '1', 1348177787, 407, 0, 0, 0, '2014-11-09', '0000-00-00', '', '', ''),
(00000003, '', '', 'destaque3.jpg', '', 'destaque', 0, 0, '1', 1348177788, 405, 0, 0, 0, '0000-00-00', '0000-00-00', '', '', '');
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_depoimentos` (
  `story_id` int(5) NOT NULL DEFAULT '0',
  `story` text COLLATE latin1_general_ci
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"INSERT INTO `mdl123_depoimentos` (`story_id`, `story`) VALUES
(1, ' Em uma semana após me cadastrar consegui meu primeiro emprego.\r\nMuito obrigado!!!  ');
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_depoimentos_waiting` (
  `WS_id` int(5) NOT NULL DEFAULT '0',
  `story` text COLLATE latin1_general_ci
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_destaques` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `franquia` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `data` date NOT NULL DEFAULT '0000-00-00',
  `titulo` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `url` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `imagem` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `destaque` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=4 ;
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_down_cat` (
  `id` tinyint(4) NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) COLLATE latin1_general_ci NOT NULL,
  PRIMARY KEY (`id`,`nome`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=9 ;
");

mysqli_query($link,"INSERT INTO `mdl123_down_cat` (`id`, `nome`) VALUES
(1, 'Auto ajuda'),
(3, 'Geral'),
(6, 'Marketing');
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_down_files` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `url` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `clicks` int(9) NOT NULL DEFAULT '1',
  `tamanho` varchar(15) COLLATE latin1_general_ci NOT NULL,
  `idioma` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `licensa` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `descricao` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `catid` int(4) NOT NULL DEFAULT '0',
  `data` varchar(10) COLLATE latin1_general_ci NOT NULL,
  `nota` double(4,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=11 ;
");

mysqli_query($link,"INSERT INTO `mdl123_down_files` (`id`, `nome`, `url`, `clicks`, `tamanho`, `idioma`, `licensa`, `descricao`, `catid`, `data`, `nota`) VALUES
(1, 'Como evitar o erro', '../arquivos123/mistake.exe', 19, '388 kb', 'Inglês', 'Freeware', 'Ebook ensinando como evitar diversos erros.', 6, '23/08/2007', 1.00),
(2, 'Oito', '../arquivos123/8stepstosuccess.pdf', 23, '762', 'Inglês', 'Freeware', 'Ebook ensinando de forma simples e objetiva através de 8 etapas como obter sucesso.', 1, '23/08/2007', 7.00);
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_down_rank` (
  `arqid` int(5) NOT NULL DEFAULT '0',
  `nota` char(2) COLLATE latin1_general_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"INSERT INTO `mdl123_down_rank` (`arqid`, `nota`) VALUES
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6'),
(9, '4'),
(1, '1'),
(2, '8'),
(2, '7'),
(2, '6'),
(2, '8'),
(2, '7'),
(2, '6');
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_enquetes` (
  `enqueteid` int(8) NOT NULL DEFAULT '0',
  `title` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `starts` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `expires` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `vote` int(15) NOT NULL DEFAULT '0',
  `voting` char(3) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `results` char(3) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `graph` char(3) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `resultsvotes` char(3) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `ip` char(3) COLLATE latin1_general_ci NOT NULL,
  `cookies` char(3) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `subdate` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `status` char(3) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`enqueteid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"INSERT INTO `mdl123_enquetes` (`enqueteid`, `title`, `starts`, `expires`, `vote`, `voting`, `results`, `graph`, `resultsvotes`, `ip`, `cookies`, `subdate`, `status`) VALUES
(1, 'Você gosta de enquetes ?', '13/04/2009', '13/04/2037', 86400, 'yes', 'yes', 'yes', 'yes', 'yes', 'no', '13/04/2009', 'on');
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_enquetes_bloqueados` (
  `bloqueadosid` int(8) NOT NULL DEFAULT '0',
  `ip` varchar(15) COLLATE latin1_general_ci NOT NULL,
  `enquetes` longtext COLLATE latin1_general_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_enquetes_ip` (
  `ipid` int(8) NOT NULL DEFAULT '0',
  `title` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `ip` varchar(15) COLLATE latin1_general_ci NOT NULL,
  `vote` int(15) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ipid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_enquetes_options` (
  `optionid` int(8) NOT NULL DEFAULT '0',
  `enqueteid` int(8) NOT NULL DEFAULT '0',
  `options` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `images` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `votes` int(8) NOT NULL DEFAULT '0',
  `order_id` int(8) NOT NULL DEFAULT '0',
  PRIMARY KEY (`optionid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"INSERT INTO `mdl123_enquetes_options` (`optionid`, `enqueteid`, `options`, `images`, `votes`, `order_id`) VALUES
(3, 1, 'Talvez', 'random', 0, 3),
(2, 1, 'Não', 'random', 1, 2),
(1, 1, 'Sim', 'random', 1, 1);
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_estatisticas_referer` (
  `referer` longtext COLLATE latin1_general_ci NOT NULL,
  `hits` varchar(8) COLLATE latin1_general_ci NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_estat_anual` (
  `subdate` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `hits` varchar(8) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `uniquehits` varchar(8) COLLATE latin1_general_ci NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_estat_diario` (
  `subdate` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `hits` varchar(8) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `uniquehits` varchar(8) COLLATE latin1_general_ci NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_estat_historico` (
  `title` varchar(30) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `hits` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `subdate` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_estat_mensal` (
  `subdate` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `hits` varchar(8) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `uniquehits` varchar(8) COLLATE latin1_general_ci NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_estat_navegador` (
  `browser` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `hits` varchar(8) COLLATE latin1_general_ci NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");




mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_estat_os` (
  `os` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `hits` varchar(8) COLLATE latin1_general_ci NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_estat_visitantes` (
  `subdate` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `ip` varchar(20) COLLATE latin1_general_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_eventos` (
  `id` int(6) NOT NULL AUTO_INCREMENT,
  `evento` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  `dia` varchar(50) COLLATE latin1_general_ci DEFAULT NULL,
  `mes` varchar(50) COLLATE latin1_general_ci DEFAULT NULL,
  `ano` varchar(50) COLLATE latin1_general_ci DEFAULT NULL,
  `local` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  `descricao` text COLLATE latin1_general_ci,
  `data` date DEFAULT NULL,
  `img` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=1 ;
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_faq_categorias` (
  `catid` bigint(5) NOT NULL AUTO_INCREMENT,
  `catparent` bigint(5) NOT NULL DEFAULT '0',
  `cattitle` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`catid`),
  KEY `catparent` (`catparent`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=7 ;
");

mysqli_query($link,"INSERT INTO `mdl123_faq_categorias` (`catid`, `catparent`, `cattitle`) VALUES
(1, 0, 'Suporte'),
(2, 0, 'Financeiro'),
(5, 0, 'teste4');
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_faq_filtro` (
  `filtroid` bigint(5) NOT NULL AUTO_INCREMENT,
  `filtronome` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`filtroid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=1 ;
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_faq_questoes` (
  `faqid` bigint(5) NOT NULL AUTO_INCREMENT,
  `catid` bigint(5) NOT NULL DEFAULT '0',
  `faqtitle` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `faqdescription` longtext COLLATE latin1_general_ci NOT NULL,
  `faqsolution` longtext COLLATE latin1_general_ci NOT NULL,
  `faqlastupdate` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `faqkeywords` longtext COLLATE latin1_general_ci NOT NULL,
  `kind` varchar(30) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `important` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `staff` varchar(30) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `ext` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `ok` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `free1` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `free2` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `free3` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`faqid`),
  KEY `catid` (`catid`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=5 ;
");

mysqli_query($link,"INSERT INTO `mdl123_faq_questoes` (`faqid`, `catid`, `faqtitle`, `faqdescription`, `faqsolution`, `faqlastupdate`, `faqkeywords`, `kind`, `important`, `staff`, `ext`, `ok`, `free1`, `free2`, `free3`) VALUES
(1, 1, 'Como gerencio esse FAQ?', '', 'O gerenciamento deste FAQ é feito na área administrativa, onde com facilidade você pode adicionar, editar, excluir as questões. É tudo automatizado.', '1345555130', '', '', '1', '', '1', '1', '', '', ''),
(2, 1, 'Posso colocar esse FAQ em outras páginas ?', '', 'Pode sim, para isso basta colocar o código conforme explicado em detalhes na área administrativa.', '1345557574', '', '', '1', '', '1', '1', '', '', '');
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_faq_relacionamento` (
  `relfaqid1` bigint(5) NOT NULL DEFAULT '0',
  `relfaqid2` bigint(5) NOT NULL DEFAULT '0',
  PRIMARY KEY (`relfaqid1`,`relfaqid2`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");
mysqli_query($link,"INSERT INTO `mdl123_faq_relacionamento` (`relfaqid1`, `relfaqid2`) VALUES
(1, 2);
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_forum_replies` (
  `sectionid` int(11) DEFAULT NULL,
  `threadid` int(11) DEFAULT NULL,
  `replyid` int(11) NOT NULL AUTO_INCREMENT,
  `replytext` text COLLATE latin1_general_ci,
  `postedby` text COLLATE latin1_general_ci,
  `whenposted` int(11) DEFAULT NULL,
  `replytitle` text COLLATE latin1_general_ci,
  PRIMARY KEY (`replyid`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=11 ;

");

mysqli_query($link,"INSERT INTO `mdl123_forum_replies` (`sectionid`, `threadid`, `replyid`, `replytext`, `postedby`, `whenposted`, `replytitle`) VALUES
(3, 3, 6, 'Eu acho que uma camera na portaria seria muito interessante para sabermos quem entra e quem sai do condominio.', '44563453', 1294682498, 'Na portaria');
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_forum_sections` (
  `sectionid` int(11) NOT NULL AUTO_INCREMENT,
  `sectiontitle` text COLLATE latin1_general_ci,
  `sectiondescription` text COLLATE latin1_general_ci,
  PRIMARY KEY (`sectionid`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=5 ;
");


mysqli_query($link,"INSERT INTO `mdl123_forum_sections` (`sectionid`, `sectiontitle`, `sectiondescription`) VALUES
(1, 'Regra do condomínio', 'Este tópico visa esclarecer os as regras do condomínio.'),
(2, 'Problemas do condomínio', 'Este tópico visa debater todos os problemas do condomínio.'),
(3, 'Sugestões gerais', 'Coloque aqui as sugestões para que possamos melhorar nosso condominio.');
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_forum_threads` (
  `sectionid` int(11) DEFAULT NULL,
  `threadid` int(11) NOT NULL AUTO_INCREMENT,
  `threadtitle` text COLLATE latin1_general_ci,
  `threadtext` text COLLATE latin1_general_ci,
  `postedby` text COLLATE latin1_general_ci,
  `whenposted` int(11) DEFAULT NULL,
  PRIMARY KEY (`threadid`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=11 ;
");


mysqli_query($link,"INSERT INTO `mdl123_forum_threads` (`sectionid`, `threadid`, `threadtitle`, `threadtext`, `postedby`, `whenposted`) VALUES
(3, 2, 'Novas regras para utilização da garagem', 'Devido aos constantes problemas com a utilização da garagem pedimos a todos que sugira novas regras para que possamos colocar em pratica em breve.', '44563453', 1294682386),
(3, 3, 'Cameras de segurança', 'Sugira os locais onde vc gostaria que existisse uma camera de segurança em nosso condominio.', '44563453', 1394746991),
(3, 4, '', '', '44563453', 1394746152),
(3, 5, '', '', '44563453', 1394746279),
(3, 6, '', '', '44563453', 1394746314),
(3, 7, '', '', '44563453', 1394746369),
(3, 8, '', '', '44563453', 1394746386),
(3, 9, '', '', '44563453', 1394746518),
(3, 10, '', '', '44563453', 1394746527);
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_mural` (
  `id` int(5) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `de` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `para` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `mensagem` text COLLATE latin1_general_ci NOT NULL,
  `data` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` char(3) COLLATE latin1_general_ci NOT NULL DEFAULT 'N',
  `ip` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '127.0.001',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=7 ;
");

mysqli_query($link,"INSERT INTO `mdl123_mural` (`id`, `de`, `para`, `mensagem`, `data`, `status`, `ip`) VALUES
(00001, 'Rogério', 'Luana', 'Luana você o maior sucesso ontem na festa com aquele seu vestido vermelho... Você está cada vez mais linda!', '2009-08-11 11:07:23', 'S', '123.128.054.233'),
(00002, 'Julia', 'Alberto', 'Que dia vc vai me convidar para sair, estou só esperando! Beijos', '2009-05-11 11:07:23', 'S', '123.128.054.233'),
(00003, 'Ju', 'La', 'Oi sumida!!!!!', '2009-09-10 01:11:47', 'S', '127.0.0.1'),
(00004, 'Luanda', 'Mauro', 'Gosto da festa ontem Mauro ?', '2009-09-10 01:12:39', 'S', '127.0.0.1'),
(00006, 'Eduardo', 'Rafaela', 'Estou mandando este recado para dizer que ontem a noite foi boa de mais!!!', '2012-08-17 18:17:46', 'S', '127.0.0.1');
");


mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_newsletter` (
  `subject` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `message` text COLLATE latin1_general_ci,
  `MailDate` int(10) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");




mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_newsletter_assinantes` (
  `news_id` int(11) NOT NULL AUTO_INCREMENT,
  `news_numero` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `news_name` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `news_data` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `news_email` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `news_senha` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `news_status` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `news_send` longtext COLLATE latin1_general_ci NOT NULL,
  `news_sent` longtext COLLATE latin1_general_ci NOT NULL,
  `news_lista` longtext COLLATE latin1_general_ci NOT NULL,
  PRIMARY KEY (`news_id`),
  UNIQUE KEY `news_email` (`news_email`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=1 ;
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_noticias` (
  `id_noticias` tinyint(5) unsigned NOT NULL AUTO_INCREMENT,
  `titulo_noticias` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `txtconteudo_noticias` text COLLATE latin1_general_ci,
  `data_noticias` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  `categoria_noticias` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT 'noticia',
  `arqnome_noticias` varchar(255) COLLATE latin1_general_ci DEFAULT NULL,
  `editor_noticias` varchar(100) COLLATE latin1_general_ci NOT NULL,
  PRIMARY KEY (`id_noticias`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=48 ;
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_parceiros` (
  `id_parceiro` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `nome` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `endereco` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `cidade` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `telefone` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `site` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `logo` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `descricao` longtext COLLATE latin1_general_ci NOT NULL,
  `status` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `numero` int(8) unsigned zerofill DEFAULT NULL,
  `responsavel` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cpf` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `razaosocial` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cnpj` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `complemento` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `bairro` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `estado` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cep` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `email` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `desconto` longtext COLLATE latin1_general_ci NOT NULL,
  UNIQUE KEY `id_parceiro` (`id_parceiro`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=23 ;
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `mdl123_parceiros_tipo` (
  `parceiros_tipo_id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `status` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `descricao` longtext COLLATE latin1_general_ci NOT NULL,
  UNIQUE KEY `parceiros_tipo_id` (`parceiros_tipo_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=7 ;
");

mysqli_query($link,"INSERT INTO `mdl123_parceiros_tipo` (`parceiros_tipo_id`, `tipo`, `status`, `descricao`) VALUES
(1, 'Lanternagem', '1', 'Serviços de lanternagem em geral para veículos.'),
(2, 'Corretor de Seguros', '1', 'Lista dos melhores corretos de seguro.'),
(3, 'Despachante', '1', 'Serviços relacionados a documentação do veículo'),
(4, 'Revitalização', '1', 'Deixe seu carro com um ar de novo.'),
(5, 'Oficina Mecânica', '1', 'Oficinas mecânicas especializadas.'),
(6, 'Locadora Veículos', '1', 'Alugue um veículo.');
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `pagamentos123_bancos` (
  `bancoid` int(4) NOT NULL AUTO_INCREMENT,
  `banco_nome` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `banco_agencia` varchar(20) COLLATE latin1_general_ci NOT NULL,
  `banco_titular` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `banco_conta` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `banco_contatipo` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `banco_habilitado` char(1) COLLATE latin1_general_ci NOT NULL,
  `banco_obs` longtext COLLATE latin1_general_ci NOT NULL,
  `banco_cpfcnpj` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `banco_site` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `f1` varchar(1) COLLATE latin1_general_ci NOT NULL,
  PRIMARY KEY (`bancoid`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=13 ;
");

mysqli_query($link,"INSERT INTO `pagamentos123_bancos` (`bancoid`, `banco_nome`, `banco_agencia`, `banco_titular`, `banco_conta`, `banco_contatipo`, `banco_habilitado`, `banco_obs`, `banco_cpfcnpj`, `banco_site`, `f1`) VALUES
(1, 'Caixa Econômica', 'xxxx-x', 'Nome sobrenome', 'xxxxxx-x', 'Conta corrente', '1', 'Transfência e DOC', 'xx-xxx-xxx-xxx-xx', 'www.caixa.com.br', ''),
(3, 'Banco do Brasil', '123', 'Nome do titular', '32245-5', 'CC', '1', '', 'xx-xxx-xxx-xxx-xx', 'www.bb.com.br', '');
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `pagamentos123_comissao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `indicador` varchar(50) DEFAULT NULL,
  `servico` varchar(255) DEFAULT NULL,
  `valor` varchar(10) DEFAULT NULL,
  `data` date DEFAULT NULL,
  `status` char(1) DEFAULT '0',
  `numero` varchar(30) DEFAULT NULL,
  `obs` varchar(250) DEFAULT NULL,
  `valorgeral` varchar(30) DEFAULT NULL,
  `servicos` varchar(255) DEFAULT NULL,
  `dominio` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `pagamentos123_config` (
  `id` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `boleto` char(1) COLLATE latin1_general_ci NOT NULL,
  `boleto_banco` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `boleto_carteira` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `boleto_codigo` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `deptrans` char(1) COLLATE latin1_general_ci NOT NULL,
  `paypal_email` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `paypal` varchar(1) COLLATE latin1_general_ci NOT NULL,
  `boleto_empresa` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `boleto_agencia` varchar(10) COLLATE latin1_general_ci NOT NULL,
  `f2` varchar(150) COLLATE latin1_general_ci NOT NULL,
  `boleto_endereco` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `boleto_cnpj_cedente` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `boleto_conta` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `boleto_conta_digito` varchar(1) COLLATE latin1_general_ci NOT NULL,
  `boleto_cidade` varchar(150) COLLATE latin1_general_ci NOT NULL,
  `f1` varchar(1) COLLATE latin1_general_ci NOT NULL,
  `brpay` varchar(1) COLLATE latin1_general_ci NOT NULL,
  `brpay_email` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `brpay_token` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `sendep` varchar(1) COLLATE latin1_general_ci NOT NULL,
  `sendep_user_id` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `sendep_email` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `sendep_xipn` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `sendep_xhash` longtext COLLATE latin1_general_ci NOT NULL,
  `moip` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `moip_email` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `moip_url` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `moip_f1` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `moip_f2` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `v` varchar(9) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `boleto_instrucao1` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `boleto_instrucao2` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `boleto_instrucao3` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `boleto_dias_vence` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `boleto_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `pagamentodigital` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `pagamentodigital_email` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `pagamentodigital_token` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `f2b` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `f2b_conta` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `f2b_senha` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `boleto_contrato` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `topo_html` longtext COLLATE latin1_general_ci NOT NULL,
  `rodape_html` longtext COLLATE latin1_general_ci NOT NULL,
  `valoredit` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `inicio_nosso_numero` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '80',
  `boleto_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `brpay_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0.00',
  `brpay_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `sendep_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0.00',
  `sendep_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `moip_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0.00',
  `moip_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `pagamentodigital_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0.00',
  `pagamentodigital_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `f2b_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0.00',
  `f2b_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `USD` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `EUR` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `JPY` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `BRL` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '1.00',
  `GBP` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `AUD` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `CAD` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `CZK` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `DKK` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `HKD` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `HUF` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `ILS` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `MXN` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `NZD` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `NOK` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `PHP` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `PLN` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `SGD` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `SEK` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `CHF` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `TWD` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `THB` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `USDCALC` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '1.0',
  `hipay` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `hipay_login` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `hipay_senha` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `hipay_conta_credito` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `hipay_conta_taxa` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `hipay_linguapadrao` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT 'pt_PT',
  `hipay_moedapadrao` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT 'EUR',
  `hipay_siteid` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `hipay_tax` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '5',
  `cartao` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `cartao_filiacao` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cartao_distribuidor` varchar(9) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cartao_urlcima` longtext COLLATE latin1_general_ci NOT NULL,
  `cartao_taxaavista` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cartao_parcela` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT 'pt_PT',
  `cartao_parcela_minimo` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT 'EUR',
  `cartao_parcela_taxa` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cartao_parcela_tipo` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cartao_parcela_semtaxa` varchar(2) COLLATE latin1_general_ci NOT NULL DEFAULT '6',
  `cartao_visa` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cartao_mastercard` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cartao_diners` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cartao_hipercard` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `cartao_discover` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `cartao_lang` varchar(3) COLLATE latin1_general_ci NOT NULL DEFAULT '5',
  `cobrebem` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_usuario` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cobrebem_visa` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_visaelectron` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_mastercard` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_diners` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_amex` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_hipercard` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_jcb` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_sorocred` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_aura` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_parcelas` varchar(2) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_boleto` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_boleto_vcto` varchar(3) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_transferencia` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_transferencia_ABNREAL` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_transferencia_BBRASIL` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_transferencia_BANRISUL` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_transferencia_BRADESCO` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_transferencia_HSBC` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_transferencia_ITAU` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cobrebem_transferencia_UNIBANCO` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `mercadopago` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `mercadopago_acc_id` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `mercadopago_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `mercadopago_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `mercadopago_sonda_key` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `mercadopago_enc` varchar(200) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cielo` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cielo_filiacao` varchar(20) COLLATE latin1_general_ci NOT NULL,
  `cielo_chave` varchar(250) COLLATE latin1_general_ci NOT NULL,
  `cielo_distribuidor` varchar(9) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cielo_urlcima` longtext COLLATE latin1_general_ci,
  `cielo_taxaavista` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '-3',
  `cielo_parcela` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '6',
  `cielo_parcela_minimo` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '10.00',
  `cielo_parcela_taxa` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '1.99',
  `cielo_parcela_tipo` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '08',
  `cielo_parcela_semtaxa` varchar(2) COLLATE latin1_general_ci NOT NULL DEFAULT '6',
  `cielo_visa` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cielo_mastercard` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cielo_diners` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cielo_hipercard` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cielo_discover` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cielo_elo` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `cielo_visa_electron` varchar(1) COLLATE latin1_general_ci NOT NULL,
  `cielo_lang` varchar(3) COLLATE latin1_general_ci NOT NULL DEFAULT 'POR',
  `itau` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `itau_codigo` varchar(26) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `itau_chave` varchar(16) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `itau_porcentagem` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `itau_vencimento` varchar(4) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `itau_taxa` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatus` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `akatus_email` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatus_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatus_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `dinheiromail` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `dinheiromail_email` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `dinheiromail_logo` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `dinheiromail_valorextra` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `dinheiromail_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `dinheiromail_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `dinheiromail_moeda` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatus_key` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatus_token` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `paypal_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `paypal_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cielo_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cielo_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatusapi` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `akatusapi_email` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatusapi_key` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatusapi_token` varchar(150) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatusapi_boleto` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `akatusapi_boleto_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatusapi_boleto_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatusapi_tef` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `akatusapi_tef_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatusapi_tef_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatusapi_cartao` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `akatusapi_taxaavista` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '-3',
  `akatusapi_parcela` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '6',
  `akatusapi_parcela_minimo` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '10.00',
  `akatusapi_parcela_taxa` varchar(5) COLLATE latin1_general_ci NOT NULL DEFAULT '1.99',
  `akatusapi_parcela_semtaxa` varchar(2) COLLATE latin1_general_ci NOT NULL DEFAULT '6',
  `akatusapi_visa` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `akatusapi_mastercard` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `akatusapi_diners` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `akatusapi_hipercard` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `akatusapi_discover` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `akatusapi_elo` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `akatusapi_amex` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `akatusapi_visa_electron` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `akatusapi_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `akatusapi_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `pgto_auto` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `pgto_auto_alerta` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `gerencianet` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `gerencianet_token` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `gerencianet_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `gerencianet_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `gerencianet_btaxa` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `primefidelity` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `primefidelity_codigo` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `primefidelity_token` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `primefidelity_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `primefidelity_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cielo_amex` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `pgtocomsaldo` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '1',
  `contasuper` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `contasuper_conta` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `astropay` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `astropay_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `astropay_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `astropay_x_login` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `astropay_x_trans_key` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `astropay_x_login_for_webpaystatus` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `astropay_x_trans_key_for_webpaystatus` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `astropay_secret_key` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `ewalletpay` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `ewalletpay_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `ewalletpay_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `ewalletpay_apiKey` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `ewalletpay_apiSecret` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `neteller` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `neteller_conta` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `embrapag` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `embrapag_email` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `embrapag_token` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `embrapag_taxa` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `embrapag_porcentagem` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `fortunus_boleto` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `fortunus_carne` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `fortunus_token` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `fortunus_porcentagem` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `fortunus_taxa` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `fortunus_btaxa` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `fortunus_parcelas` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
");

mysqli_query($link,"INSERT INTO `pagamentos123_config` (`id`, `boleto`, `boleto_banco`, `boleto_carteira`, `boleto_codigo`, `deptrans`, `paypal_email`, `paypal`, `boleto_empresa`, `boleto_agencia`, `f2`, `boleto_endereco`, `boleto_cnpj_cedente`, `boleto_conta`, `boleto_conta_digito`, `boleto_cidade`, `f1`, `brpay`, `brpay_email`, `brpay_token`, `sendep`, `sendep_user_id`, `sendep_email`, `sendep_xipn`, `sendep_xhash`, `moip`, `moip_email`, `moip_url`, `moip_f1`, `moip_f2`, `v`, `boleto_instrucao1`, `boleto_instrucao2`, `boleto_instrucao3`, `boleto_dias_vence`, `boleto_taxa`, `pagamentodigital`, `pagamentodigital_email`, `pagamentodigital_token`, `f2b`, `f2b_conta`, `f2b_senha`, `boleto_contrato`, `topo_html`, `rodape_html`, `valoredit`, `inicio_nosso_numero`, `boleto_porcentagem`, `brpay_taxa`, `brpay_porcentagem`, `sendep_taxa`, `sendep_porcentagem`, `moip_taxa`, `moip_porcentagem`, `pagamentodigital_taxa`, `pagamentodigital_porcentagem`, `f2b_taxa`, `f2b_porcentagem`, `USD`, `EUR`, `JPY`, `BRL`, `GBP`, `AUD`, `CAD`, `CZK`, `DKK`, `HKD`, `HUF`, `ILS`, `MXN`, `NZD`, `NOK`, `PHP`, `PLN`, `SGD`, `SEK`, `CHF`, `TWD`, `THB`, `USDCALC`, `hipay`, `hipay_login`, `hipay_senha`, `hipay_conta_credito`, `hipay_conta_taxa`, `hipay_linguapadrao`, `hipay_moedapadrao`, `hipay_siteid`, `hipay_tax`, `cartao`, `cartao_filiacao`, `cartao_distribuidor`, `cartao_urlcima`, `cartao_taxaavista`, `cartao_parcela`, `cartao_parcela_minimo`, `cartao_parcela_taxa`, `cartao_parcela_tipo`, `cartao_parcela_semtaxa`, `cartao_visa`, `cartao_mastercard`, `cartao_diners`, `cartao_hipercard`, `cartao_discover`, `cartao_lang`, `cobrebem`, `cobrebem_usuario`, `cobrebem_visa`, `cobrebem_visaelectron`, `cobrebem_mastercard`, `cobrebem_diners`, `cobrebem_amex`, `cobrebem_hipercard`, `cobrebem_jcb`, `cobrebem_sorocred`, `cobrebem_aura`, `cobrebem_parcelas`, `cobrebem_boleto`, `cobrebem_boleto_vcto`, `cobrebem_transferencia`, `cobrebem_transferencia_ABNREAL`, `cobrebem_transferencia_BBRASIL`, `cobrebem_transferencia_BANRISUL`, `cobrebem_transferencia_BRADESCO`, `cobrebem_transferencia_HSBC`, `cobrebem_transferencia_ITAU`, `cobrebem_transferencia_UNIBANCO`, `mercadopago`, `mercadopago_acc_id`, `mercadopago_taxa`, `mercadopago_porcentagem`, `mercadopago_sonda_key`, `mercadopago_enc`, `cielo`, `cielo_filiacao`, `cielo_chave`, `cielo_distribuidor`, `cielo_urlcima`, `cielo_taxaavista`, `cielo_parcela`, `cielo_parcela_minimo`, `cielo_parcela_taxa`, `cielo_parcela_tipo`, `cielo_parcela_semtaxa`, `cielo_visa`, `cielo_mastercard`, `cielo_diners`, `cielo_hipercard`, `cielo_discover`, `cielo_elo`, `cielo_visa_electron`, `cielo_lang`, `itau`, `itau_codigo`, `itau_chave`, `itau_porcentagem`, `itau_vencimento`, `itau_taxa`, `akatus`, `akatus_email`, `akatus_porcentagem`, `akatus_taxa`, `dinheiromail`, `dinheiromail_email`, `dinheiromail_logo`, `dinheiromail_valorextra`, `dinheiromail_porcentagem`, `dinheiromail_taxa`, `dinheiromail_moeda`, `akatus_key`, `akatus_token`, `paypal_porcentagem`, `paypal_taxa`, `cielo_porcentagem`, `cielo_taxa`, `akatusapi`, `akatusapi_email`, `akatusapi_key`, `akatusapi_token`, `akatusapi_boleto`, `akatusapi_boleto_porcentagem`, `akatusapi_boleto_taxa`, `akatusapi_tef`, `akatusapi_tef_porcentagem`, `akatusapi_tef_taxa`, `akatusapi_cartao`, `akatusapi_taxaavista`, `akatusapi_parcela`, `akatusapi_parcela_minimo`, `akatusapi_parcela_taxa`, `akatusapi_parcela_semtaxa`, `akatusapi_visa`, `akatusapi_mastercard`, `akatusapi_diners`, `akatusapi_hipercard`, `akatusapi_discover`, `akatusapi_elo`, `akatusapi_amex`, `akatusapi_visa_electron`, `akatusapi_porcentagem`, `akatusapi_taxa`, `pgto_auto`, `pgto_auto_alerta`, `gerencianet`, `gerencianet_token`, `gerencianet_porcentagem`, `gerencianet_taxa`, `gerencianet_btaxa`, `primefidelity`, `primefidelity_codigo`, `primefidelity_token`, `primefidelity_porcentagem`, `primefidelity_taxa`, `cielo_amex`, `pgtocomsaldo`, `contasuper`, `contasuper_conta`, `astropay`, `astropay_porcentagem`, `astropay_taxa`, `astropay_x_login`, `astropay_x_trans_key`, `astropay_x_login_for_webpaystatus`, `astropay_x_trans_key_for_webpaystatus`, `astropay_secret_key`, `ewalletpay`, `ewalletpay_porcentagem`, `ewalletpay_taxa`, `ewalletpay_apiKey`, `ewalletpay_apiSecret`, `neteller`, `neteller_conta`, `embrapag`, `embrapag_email`, `embrapag_token`, `embrapag_taxa`, `embrapag_porcentagem`, `fortunus_boleto`, `fortunus_carne`, `fortunus_token`, `fortunus_porcentagem`, `fortunus_taxa`, `fortunus_btaxa`, `fortunus_parcelas`) VALUES
('1', '1', 'cef', '175', '00000', '1', 'xxxxxxxx', '1', 'Empresa Demo123', '1429', '', 'Rua de demostração, 134 - Centro', '12.123.123.123-12', '42553', '9', 'Conselheiro Lafaiete', '', '1', 'xxxxxxxx', '', '', '', '', '', '', '1', 'xxxxxxxx', '', '', '', '12', 'Instrução 1', 'Instrução 2', 'Instrução 3', '5', '1.90', '1', 'xxxxxxxx', '', '1', 'teste.f2b@gmail.com', '', '', '', '', '0', '', '', '0.40', '4.99', '', '', '', '', '', '', '', '', '', '', '700', '1.00', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '2.00', '1', 'xxxxxxxx', 'admin', 'admin', '', '', '', '', '', '1', 'xxxxxxxx', '', '<body topmargin=0 leftmargin=0 rightmargin=0 bottommargin=0 bgcolor=#000080>\r\n<br><p align=center><b><font face=Georgia><i><font size=7 color=#FFFFFF>Cartão de crédito</font></i></font></b></p>', '10', '6', '5.00', '2.99', '08', '3', '1', '1', '1', '1', '1', 'POR', '1', 'xxxxxxxx', '', '', '', '', '', '', '', '', '', '1', '', '', '', '', '', '', '', '', '', '', '1', '', '', '', '', '', '1', 'xxxxxxxx', '', '', '', '', '12', '', '1.99', '3', '', '1', '1', '1', '', '1', '1', '0', 'POR', '1', 'xxxxxxxx', '', '', '', '0.34', '1', 'xxxxxxxx', '', '', '1', 'xxxxxxxx', '', '', '', '', '', '', '', '6.4', '0.60', '', '', '1', 'xxxxxxxx', '', '', '1', '1', '5.55', '1', '3', '2.21', '1', '0', '12', '10.00', '1.99', '0', '1', '1', '1', '', '1', '1', '', '', '2.14', '5.00', '0', '0', '1', 'xxxxxxxx', '', '', '0', '1', 'xxxxxxxx', 'xxxxxxxx', '3,00', '5,00', '1', '1', '1', 'xxxxxxxx', '1', '0', '0.0', 'xxxxxxxx', 'xxxxxxxx', 'xxxxxxxx', 'xxxxxxxx', 'xxxxxxxx', '1', '', '', 'xxxxxxxx', '', '1', 'xxxxxxxx', '1', 'xxxxxxxx', '', '', '', '1', '0', 'xxxxxxxx', '', '', '', '');
");

mysqli_query($link,"CREATE TABLE IF NOT EXISTS `pagamentos123_despesas` (
  `id` int(9) NOT NULL AUTO_INCREMENT,
  `banco` varchar(20) NOT NULL DEFAULT '',
  `data` date NOT NULL DEFAULT '0000-00-00',
  `valor` varchar(8) NOT NULL DEFAULT '',
  `motivo` varchar(250) NOT NULL DEFAULT '',
  `obs` longtext NOT NULL,
  `refid` varchar(20) NOT NULL DEFAULT '',
  `staff` varchar(20) NOT NULL DEFAULT '',
  `agencia` varchar(20) NOT NULL DEFAULT '',
  `boleto` varchar(12) NOT NULL DEFAULT '',
  `despesa` char(1) NOT NULL DEFAULT '',
  `ok` char(1) NOT NULL DEFAULT '1',
  `acao` varchar(30) NOT NULL DEFAULT '',
  `free7` char(1) NOT NULL DEFAULT '',
  `free8` char(1) NOT NULL DEFAULT '',
  `free9` char(1) NOT NULL DEFAULT '',
  `free10` char(1) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;
");



mysqli_query($link,"CREATE TABLE IF NOT EXISTS `pagamentos123_receitas` (
  `id` int(9) NOT NULL AUTO_INCREMENT,
  `service` varchar(30) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `data` date NOT NULL DEFAULT '0000-00-00',
  `em` date NOT NULL DEFAULT '0000-00-00',
  `valor` varchar(8) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `obs` varchar(255) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `ok` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '0',
  `refid` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `staff` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `staff2` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `cliente` varchar(100) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `agencia` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `boleto` varchar(12) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `banco` varchar(20) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `forma` varchar(50) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `obspub` varchar(250) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `nova` char(1) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `conta` varchar(30) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `moeda` varchar(10) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `numero` varchar(40) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `pgde` date NOT NULL DEFAULT '0000-00-00',
  `pgate` date NOT NULL DEFAULT '0000-00-00',
  `taxa` int(12) NOT NULL,
  `motivo` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `status` varchar(100) COLLATE latin1_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `boleto` (`boleto`),
  KEY `ok` (`ok`)
  ) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=1 ;
");

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

mysqli_query($link,"ALTER TABLE  `area123_layout` ADD UNIQUE (`layout_layout`);");

if (file_exists('inc123/coletiva123_sql.php')) { include_once "inc123/coletiva123_sql.php";}
if (file_exists('inc123/autos123_sql.php')) { include_once "inc123/autos123_sql.php";}
if (file_exists('inc123/dinheiro123_sql.php')) { include_once "inc123/dinheiro123_sql.php";}
if (file_exists('inc123/loja123_sql.php')) { include_once "inc123/loja123_sql.php";}
if (file_exists('inc123/encontros123_sql.php')) { include_once "inc123/encontros123_sql.php";}
if (file_exists('inc123/servicos123_sql.php')) { include_once "inc123/servicos123_sql.php";}
if (file_exists('inc123/host123_sql.php')) { include_once "inc123/host123_sql.php";}
if (file_exists('inc123/dinheiro123_sql.php')) { include_once "inc123/dinheiro123_sql.php";}
if (file_exists('inc123/dominios123_sql.php')) { include_once "inc123/dominios123_sql.php";}
if (file_exists('inc123/alunos123_sql.php')) { include_once "inc123/alunos123_sql.php";}
if (file_exists('inc123/imb123_sql.php')) { include_once "inc123/imb123_sql.php";}
if (file_exists('inc123/guia123_sql.php')) { include_once "inc123/guia123_sql.php";}
if (file_exists('inc123/pedidos123_sql.php')) { include_once "inc123/pedidos123_sql.php";}
if (file_exists('inc123/adv123_sql.php')) { include_once "inc123/adv123_sql.php";}
if (file_exists('inc123/acompanhantes123_sql.php')) { include_once "inc123/acompanhantes123_sql.php";}
if (file_exists('inc123/publicidade123_sql.php')) { include_once "inc123/publicidade123_sql.php";}
if (file_exists('inc123/suporte123_sql.php')) { include_once "inc123/suporte123_sql.php";}
if (file_exists('inc123/empregos123_sql.php')) { include_once "inc123/empregos123_sql.php";}
if (file_exists('inc123/mdl123_sql.php')) { include_once "inc123/mdl123_sql.php";}
if (file_exists('inc123/condominio123_sql.php')) { include_once "inc123/condominio123_sql.php";}
if (file_exists('inc123/painel123_sql.php')) { include_once "inc123/painel123_sql.php";}


if (file_exists('../inc123/coletiva123_sql.php')) { include_once "../inc123/coletiva123_sql.php";}
if (file_exists('../inc123/autos123_sql.php')) { include_once "../inc123/autos123_sql.php";}
if (file_exists('../inc123/dinheiro123_sql.php')) { include_once "../inc123/dinheiro123_sql.php";}
if (file_exists('../inc123/loja123_sql.php')) { include_once "../inc123/loja123_sql.php";}
if (file_exists('../inc123/encontros123_sql.php')) { include_once "../inc123/encontros123_sql.php";}
if (file_exists('../inc123/servicos123_sql.php')) { include_once "../inc123/servicos123_sql.php";}
if (file_exists('../inc123/host123_sql.php')) { include_once "../inc123/host123_sql.php";}
if (file_exists('../inc123/dinheiro123_sql.php')) { include_once "../inc123/dinheiro123_sql.php";}
if (file_exists('../inc123/dominios123_sql.php')) { include_once "../inc123/dominios123_sql.php";}
if (file_exists('../inc123/alunos123_sql.php')) { include_once "../inc123/alunos123_sql.php";}
if (file_exists('../inc123/imb123_sql.php')) { include_once "../inc123/imb123_sql.php";}
if (file_exists('../inc123/guia123_sql.php')) { include_once "../inc123/guia123_sql.php";}
if (file_exists('../inc123/pedidos123_sql.php')) { include_once "../inc123/pedidos123_sql.php";}
if (file_exists('../inc123/adv123_sql.php')) { include_once "../inc123/adv123_sql.php";}
if (file_exists('../inc123/acompanhantes123_sql.php')) { include_once "../inc123/acompanhantes123_sql.php";}
if (file_exists('../inc123/publicidade123_sql.php')) { include_once "../inc123/publicidade123_sql.php";}
if (file_exists('../inc123/suporte123_sql.php')) { include_once "../inc123/suporte123_sql.php";}
if (file_exists('../inc123/empregos123_sql.php')) { include_once "../inc123/empregos123_sql.php";}
if (file_exists('../inc123/mdl123_sql.php')) { include_once "../inc123/mdl123_sql.php";}
if (file_exists('../inc123/condominio123_sql.php')) { include_once "../inc123/condominio123_sql.php";}
if (file_exists('../inc123/painel123_sql.php')) { include_once "../inc123/painel123_sql.php";}



//Atualiza
if (file_exists('../inc123/area123_update.php')) { include_once "../inc123/area123_update.php";
	}
if (file_exists('inc123/area123_update.php')) { include_once "inc123/area123_update.php";
	}
if (file_exists('area123_update.php')) { include_once "area123_update.php";
	}



if ($user !="root" AND $database != "demo_total123") {
@unlink("area123_banco_de_dados.php");
}
?>
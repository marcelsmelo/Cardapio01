const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

module.exports = (params) =>{
	logger.debug('[MailGun - Welcome]', 'Parametros recebidos', params);
	logger.debug('[MailGun - Welcome]', 'Preparando para enviar e-mail');
	const config = require('../../config/mailgun.js');
	const mailgun = require('mailgun-js')({apiKey: config.apiKey, domain: config.domain});

	logger.debug('[MailGun - Welcome]', 'Configurando parâmetros para gerar HTML do e-mail');
	const templatePath = path.join(__dirname, './template/welcomeEmail.html');
	const templateHTML = fs.readFileSync(templatePath, 'utf8');
	const template = handlebars.compile(templateHTML); //Compila o template HTML usando Handlebars
	const templateData = {
		name: params.fantasyName
	};
	const htmlResult = template(templateData);
	logger.debug('[MailGun - Welcome]', 'HTML Gerado com sucesso');

	logger.debug('[MailGun - Welcome]', 'Configurando parâmetros para envio de e-mail');
	let logoImagePath = path.join(__dirname, './template/logo-cardapio01.png');

	let data = {
	  from: 'Cardapio01 <no-reply@cardapio01.com>',
	  to: params.email,
	  subject: 'Bem vindo ao Cardápio01!',
	  html: htmlResult,
	  inline: logoImagePath
	};

	logger.debug('[MailGun - Welcome]', 'Salvar e-mail na maillist de clientes');
	require('../lib/mailList.js')(params);

	logger.debug('[Send MailGun]', 'Enviando E-mail...');
	return mailgun.messages().send(data);

};

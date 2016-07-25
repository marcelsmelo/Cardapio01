module.exports = (companyID) => {
	logger.debug('[saveMenuStatistics]', 'Parametros', companyID);

    const MenuStatistics = require('../models/MenuStatistics.js');
    const date = new Date();
    const stringDate = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

    MenuStatistics.update({
            companyID: companyID,
            date: stringDate
        }, {
            $inc: {
                count: 1
            }
        }, {
            upsert: true,
            setDefaultsOnInsert: true
        })
        .then((data) => {
            logger.debug('[saveMenuStatistics]', 'Estatistica salva com sucesso', data);
        })
        .catch((err) => {
            logger.error('[saveMenuStatistics]', 'Erro ao salvar estatistica', err.errmsg);
        });
}

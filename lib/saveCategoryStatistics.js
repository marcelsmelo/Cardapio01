module.exports = (categoryID) => {
	logger.debug('[saveCategoryStatistics]', 'Parametros', categoryID);

    const CategoryStatistics = require('../models/CategoryStatistics.js');
    const date = new Date();
    const stringDate = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

    CategoryStatistics.update({
            categoryID: categoryID,
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
            logger.debug('[saveCategoryStatistics]', 'Estatistica salva com sucesso', data);
        })
        .catch((err) => {
            logger.error('[saveCategoryStatistics]', 'Erro ao salvar estatistica', err.errmsg);
        });
}

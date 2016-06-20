const regex = /^[a-z A-Z]{3,}$/ //Minimo tres caracteres
module.exports = value => regex.test(value)

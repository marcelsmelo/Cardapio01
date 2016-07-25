const regex = /^.{6,}$/
module.exports = value => regex.test(value)

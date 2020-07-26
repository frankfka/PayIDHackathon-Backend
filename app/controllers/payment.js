const paymentService = require('../services/payments')

module.exports = function(app) {
    app.get('/pages/:id', (req, res) => paymentService.find(req, res))
    
    app.post('/pages', (req, res) => paymentService.create(req, res))
    
    app.post('/api/payments/verify/:id', (req, res) => paymentService.verify(req, res))
}

const Product = require("../models/productModel")

const getSingleProduct = async (req, res) => {
    const { id } = req.params
    const product = await Product.findOne({ _id: id }).populate('brand').populate('sizes').populate('category')
    return res.json({ msg: 'Single product data', product: product })
}

const addProductCart = (req, res) => {
    const { pid, size } = req.body
    const { userId } = req.user
    console.log(pid, size, userId)
    return res.json({ msg: 'product added' })
}


module.exports = { getSingleProduct, addProductCart }
const Category = require('../models/Category')
const Bank = require('../models/Bank')
const Item = require('../models/Item')
const Image = require('../models/Image')
const Feature = require('../models/Feature')
const Activity = require('../models/Activity')
const Users = require('../models/Users')
const fs = require('fs-extra')
const path = require('path')
const bcrypt = require('bcryptjs')

module.exports = {
    viewSignin: async(req, res) => {
        try {
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };
            if(req.session.user == null || req.session.user == undefined) {
                res.render('index', { 
                    alert,
                    title: 'Staycation | Login'
                });
                
            }
            else {
                res.redirect('/admin/dashboard');
            }
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/signin');
        }
    },
    actionSignin: async(req,res) => {
        try {
            const {username, password} = req.body
            const user = await Users.findOne({username: username})
            if(!user) {
                req.flash('alertMessage', 'User tidak terdaftar')
                req.flash('alertStatus', 'danger')
                res.redirect('/admin/signin');
            }
            const isPasswordMatch = await bcrypt.compare(password, user.password)
            if(!isPasswordMatch) {
                req.flash('alertMessage', 'Password yang anda masukkan salah')
                req.flash('alertStatus', 'danger')
                res.redirect('/admin/signin');
            }

            req.session.user = {
                id: user.id,
                username: user.username
            }

            res.redirect('/admin/dashboard');

        } catch (error) {
            res.redirect('/admin/signin');
        }

    },

    viewDashboard: (req, res) => {
        res.render('admin/dashboard/view_dashboard', {
            title: 'Staycation | Dashboard'
        });
    },

    viewCategory: async (req, res) => {
        try {
            const category = await Category.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };
            res.render('admin/category/view_category', { 
                category,
                alert,
                title: 'Staycation | Category'
             });
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/category');
        }
    },
    addCategory: async (req, res) => {
        try {
            const { name } = req.body;
            await Category.create({name});
            req.flash('alertMessage', "Success add category")
            req.flash('alertStatus', 'success')
            res.redirect('/admin/category');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/category');
        }
    },
    editCategory: async (req, res) => {
        try {
            const { id, name } = req.body
            const category = await Category.findOne({_id: id});
            category.name = name;
            await category.save();

            req.flash('alertMessage', "Success update category")
            req.flash('alertStatus', 'success')
            res.redirect('/admin/category');
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/category');
        }
        
    },
    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params
            const category = await Category.findOne({_id: id})
            await category.remove()

            req.flash('alertMessage', "Success delete category")
            req.flash('alertStatus', 'success')
            res.redirect('/admin/category');
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/category');
        }
    },

    viewBank: async (req, res) => {
        try {
            const bank = await Bank.find()
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };
            res.render('admin/bank/view_bank', {
                bank,
                alert,
                title: 'Staycation | Bank'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/bank');
        }
    },
    addBank: async (req, res) => {
        try {
            const { nameBank, nomorRekening, name } = req.body
            await Bank.create({
                nameBank, 
                nomorRekening, 
                name,
                imageUrl: `images/${req.file.filename}`
            })
            req.flash('alertMessage', "Success add bank")
            req.flash('alertStatus', 'success')
            res.redirect('/admin/bank');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/bank');
        }

    },
    editBank: async(req, res) => {
        try {
           
            const {id, nameBank, nomorRekening, name} = req.body
            const bank = await Bank.findOne({_id: id}) 
            if(req.file == undefined) {
                bank.nameBank = nameBank
                bank.nomorRekening = nomorRekening
                bank.name = name
                await bank.save()
                req.flash('alertMessage', "Success update bank")
                req.flash('alertStatus', 'success')
                res.redirect('/admin/bank');
            } else {
                await fs.unlink(path.join(`public/${bank.imageUrl}`))
                bank.nameBank = nameBank
                bank.nomorRekening = nomorRekening
                bank.name = name
                bank.imageUrl = `images/${req.file.filename}`
                await bank.save()
                req.flash('alertMessage', "Success update bank")
                req.flash('alertStatus', 'success')
                res.redirect('/admin/bank');
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/bank');
        }
    },
    deleteBank: async(req, res) => {
        try {
            const {id} = req.params
            const bank = await Bank.findOne({_id: id}) 
            await fs.unlink(path.join(`public/${bank.imageUrl}`))
            await bank.remove()

            req.flash('alertMessage', "Success delete bank")
            req.flash('alertStatus', 'success')
            res.redirect('/admin/bank');
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/bank');
        }

    },

    viewItem: async (req, res) => {
        try {
            const item = await Item.find()
                .populate({ path: 'imageId', select: 'id imageUrl' })
                .populate({ path: 'categoryId', select: 'id name' })

            const category = await Category.find()

            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };
            res.render('admin/item/view_item', {
                item,
                alert,
                category,
                action: 'view',
                title: 'Staycation | Item'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/item');
        }
    },
    addItem: async (req, res) => {
        try {
            const { categoryId, title, price, city, about } = req.body 
            if(req.files.length > 0){
                const category = await Category.findOne({_id : categoryId});
                const newItem = {
                    categoryId : category._id,
                    title,
                    description: about,
                    price,
                    city
                }
                const item = await Item.create(newItem);
                category.itemId.push({_id: item._id});
                await category.save();

                for(let i = 0; i < req.files.length; i++) {{
                    const saveImages = await Image.create({imageUrl: `images/${req.files[i].filename}`})
                    item.imageId.push({_id: saveImages._id})
                    await item.save()
                }}
                req.flash('alertMessage', "Success add item")
                req.flash('alertStatus', 'success')
                res.redirect('/admin/item');
            }

        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/item');
        }
    },
    showImageItem: async(req, res) => {
        try {
            const {id} = req.params

            const item = await Item.findOne({_id: id})
                .populate({ path: 'imageId', select: 'id imageUrl' })

            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };
            res.render('admin/item/view_item', {
                item,
                alert,
                action: 'show image',
                title: 'Staycation | Show Image Item'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/item');
        }
    },
    showEditItem: async(req, res) => {
        try {
            const {id} = req.params

            const item = await Item.findOne({_id: id})
                .populate({ path: 'imageId', select: 'id imageUrl' })
                .populate({ path: 'categoryId', select: 'id name' })

            const category = await Category.find()
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };
            res.render('admin/item/view_item', {
                item,
                category,
                alert,
                action: 'edit',
                title: 'Staycation | Show Edit Item'
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/item');
        }
    },
    editItem: async (req, res) => {
        try {
            const {id} = req.params
            const { categoryId, title, price, city, about } = req.body 
            const item = await Item.findOne({_id: id})
                .populate({ path: 'imageId', select: 'id imageUrl' })
                .populate({ path: 'categoryId', select: 'id name' });
            
            if(req.files.length > 0) {
                for(let i = 0; i < item.imageId.length; i++) {
                    const imageUpdate = await Image.findOne({_id: item.imageId[i]._id})
                    await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`))
                    imageUpdate.imageUrl = `images/${req.files[i].filename}`
                    await imageUpdate.save()
                }
                item.title = title
                item.price = price
                item.city = city
                item.description = about
                item.categoryId = categoryId
                await item.save()
                req.flash('alertMessage', "Success edit item") 
                req.flash('alertStatus', 'success')
                res.redirect('/admin/item');
            } 
            else {
                item.title = title
                item.price = price
                item.city = city
                item.description = about
                item.categoryId = categoryId
                await item.save()
                req.flash('alertMessage', "Success edit item")
                req.flash('alertStatus', 'success')
                res.redirect('/admin/item');
            }
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/item');
        }
    },
    deleteItem: async(req, res) => {
        try {
            const {id} = req.params
            const item = await Item.findOne({_id: id}).populate('imageId')
            const category = await Category.findOne({_id: item.categoryId}).populate('itemId')

            for(let i = 0; i < category.itemId.length; i++) {
                if(category.itemId[i]._id.toString() == item._id.toString()){
                    category.itemId.pull({_id: item._id})
                    await category.save()
                }
            }
            for(let i = 0; i < item.imageId.length; i++) {
                Image.findOne({_id: item.imageId[i]._id}).then((image) => {
                    fs.unlink(path.join(`public/${image.imageUrl}`))
                    image.remove()
                })
                .catch((error) => {
                    req.flash('alertMessage', `${error.message}`)
                    req.flash('alertStatus', 'danger')
                    res.redirect('/admin/item');
                })
            }
            await item.remove()
            req.flash('alertMessage', "Success delete item")
            req.flash('alertStatus', 'success')
            res.redirect('/admin/item');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/item');
        }
    },
    viewDetailItem: async(req, res) => {
        const {itemId} = req.params
        try {
            const feature = await Feature.find({itemId : itemId})
            const activity = await Activity.find({itemId : itemId})
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus };
            res.render('admin/item/detail_item/view_detail_item', {
                alert,
                itemId,
                feature,
                activity,
                title: 'Staycation | Detail Item'
            })
            
        } catch (error) {
            req.flash('alertMessage', "Success delete item")
            req.flash('alertStatus', 'success')
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
    },

    addFeature: async (req, res) => {
        const { name, qty, itemId } = req.body

        try {
            if(!req.file) {
                req.flash('alertMessage', "Image not found")
                req.flash('alertStatus', 'danger')
                res.redirect(`/admin/item/show-detail-item/${itemId}`);
            }
            const feature = await Feature.create({
                name,
                qty,
                itemId,
                imageUrl: `images/${req.file.filename}`
            })

            const item = await Item.findOne({_id: itemId})
            item.featureId.push({_id: feature._id})
            await item.save()
            req.flash('alertMessage', "Success add feature")
            req.flash('alertStatus', 'success')
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/bank');
        }
    },
    editFeature: async(req, res) => {
        const {id, name, qty, itemId} = req.body
        try {
            const feature = await Feature.findOne({_id: id}) 
            if(req.file == undefined) {
                feature.name = name
                feature.qty = qty
                await feature.save()
                req.flash('alertMessage', "Success update feature")
                req.flash('alertStatus', 'success')
                res.redirect(`/admin/item/show-detail-item/${itemId}`);
            } else {
                await fs.unlink(path.join(`public/${feature.imageUrl}`))
                feature.name = name
                feature.qty = qty
                feature.imageUrl = `images/${req.file.filename}`
                await feature.save()
                req.flash('alertMessage', "Success update feature")
                req.flash('alertStatus', 'success')
                res.redirect(`/admin/item/show-detail-item/${itemId}`);
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
    },
    deleteFeature: async(req, res) => {
        const {id, itemId} = req.params
        try {
            const feature = await Feature.findOne({_id: id}) 

            const item = await Item.findOne({_id: itemId}).populate('featureId')
            for(let i = 0; i < item.featureId.length; i++) {
                if(item.featureId[i]._id.toString() == feature._id.toString()) {
                    item.featureId.pull({_id: feature._id})
                    await item.save()
                }
            }
            await fs.unlink(path.join(`public/${feature.imageUrl}`))
            await feature.remove()

            req.flash('alertMessage', "Success delete feature")
            req.flash('alertStatus', 'success')
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }

    },

    addActivity: async (req, res) => {
        const { name, type, itemId } = req.body

        try {
            if(!req.file) {
                req.flash('alertMessage', "Image not found")
                req.flash('alertStatus', 'danger')
                res.redirect(`/admin/item/show-detail-item/${itemId}`);
            }
            const activity = await Activity.create({
                name,
                type,
                itemId,
                imageUrl: `images/${req.file.filename}`
            })

            const item = await Item.findOne({_id: itemId})
            item.activityId.push({_id: activity._id})
            await item.save()
            req.flash('alertMessage', "Success add activity")
            req.flash('alertStatus', 'success')
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/bank');
        }
    },
    editActivity: async(req, res) => {
        const {id, name, type, itemId} = req.body
        try {
            const activity = await Activity.findOne({_id: id}) 
            if(req.file == undefined) {
                activity.name = name
                activity.type = type
                await activity.save()
                req.flash('alertMessage', "Success update activity")
                req.flash('alertStatus', 'success')
                res.redirect(`/admin/item/show-detail-item/${itemId}`);
            } else {
                await fs.unlink(path.join(`public/${activity.imageUrl}`))
                activity.name = name
                activity.type = type
                activity.imageUrl = `images/${req.file.filename}`
                await activity.save()
                req.flash('alertMessage', "Success update activity")
                req.flash('alertStatus', 'success')
                res.redirect(`/admin/item/show-detail-item/${itemId}`);
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
    },
    deleteActivity: async(req, res) => {
        const {id, itemId} = req.params
        try {
            const activity = await Activity.findOne({_id: id}) 

            const item = await Item.findOne({_id: itemId}).populate('activityId')
            for(let i = 0; i < item.activityId.length; i++) {
                if(item.activityId[i]._id.toString() == activity._id.toString()) {
                    item.activityId.pull({_id: activity._id})
                    await item.save()
                }
            }
            await fs.unlink(path.join(`public/${activity.imageUrl}`))
            await activity.remove()

            req.flash('alertMessage', "Success delete activity")
            req.flash('alertStatus', 'success')
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }

    },

    viewBooking: (req, res) => {
        res.render('admin/booking/view_booking', {
            title: 'Staycation | Booking'
        });
    },
}
const isLogin = async(req, res, next) => {
    try {
        if(req.session.user){}
        else{
            res.redirect('/')
        }
        next()
    } catch (error) {
        console.log(error.messgae);
    }
}

const isLogout = async(req, res, next) => {
    try {
        if(req.session.user){
            res.redirect('/dashboard')
        }
        next()
    } catch (error) {
        console.log(error.messgae);
    }
}

module.exports = {
    isLogin,
    isLogout
}
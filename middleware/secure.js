export function secureAuth(req, res, next){
  if(req.session.isConnected){
    next()
  }
  else{
    res.redirect('/login')
  }
}
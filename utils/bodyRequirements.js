export const isBody = (body) => {
  if (body && Object.keys(body).length !== 0) return true
  else return false
}

export const bodyValidToRegisterUser = (body) => {
  if (
    !body.name ||
    !body.lastName ||
    !body.email ||
    !body.password ||
    !body.birthDate
  )
    return false
  else return true
}

export const bodyValidToLogin = (body) => {
  if (!body.email || !body.password) return false
  else return true
}

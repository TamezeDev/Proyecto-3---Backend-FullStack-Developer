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

export const bodyValidToChangePass = (body) => {
  if (!body.currentPass || !body.newPass || !body.repeatNewPass) return false
  else return true
}

export const bodyValidToRegisterCard = (body) => {
  if (!body.nameOwner || !body.numberCard || !body.expiredDate || !body.cvv)
    return false
  else return true
}

export const bodyValidToAddCreditCard = (body) => {
  if (!body.quantity) return false
  else if (typeof body.quantity === 'string') {
    const regex = /^\d+(\.\d+)?$/
    if (!regex.test(body.quantity)) return false

    body.quantity = Number(body.quantity)

    if (body.quantity <= 0) return false
  } else {
    if (body.quantity <= 0) return false
  }
  return true
}

export const bodyValidToSetPremiumAccount = (body) => {
  if (!body.plan || !body.cardId) return false
  return true
}

export const bodyValidToCreatePremiumPlan = (body) => {
  if (!body.name || !body.durationMonths || !body.price) return false
  return true
}

export const bodyValidToUpdatePremiumPlan = (body) => {
  return Boolean(body.name || body.price || body.durationMonths)
}

export const bodyValidToCreateBook = (body) => {
  return Boolean(
    body.bookName &&
    body.isbn &&
    body.pages > 0 &&
    body.synopsis &&
    Array.isArray(body.content) &&
    body.content.length > 0 &&
    body.genreName
  )
}

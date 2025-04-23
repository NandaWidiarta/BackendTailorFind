const midtransClient = require('midtrans-client')

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY

export const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: MIDTRANS_SERVER_KEY ?? "",
  clientKey: MIDTRANS_CLIENT_KEY ?? ""
})

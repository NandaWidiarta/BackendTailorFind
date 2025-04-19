const midtransClient = require('midtrans-client')

export const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "SB-Mid-server-O05GMugLOjzLZ9hGbaDI-7xO",
  clientKey: "SB-Mid-client-SVVwIHhEHRH0CS46"
})

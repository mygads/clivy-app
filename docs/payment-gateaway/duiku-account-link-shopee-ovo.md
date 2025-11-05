DOKUMENTASI
DUITKU ACCOUNT LINK
V1.1
Dokumentasi Duitku Account Link V 1.1 Juli 2022
Version and Authorization
Versi Tanggal Penulis Catatan
1.0 22 April 2022 Bambang Maulana
Pembayaran Account Link:
1. Menghubungkan Account Link Pengguna
2. Memutuskan tautan Account Link
Pengguna
3. Mendapatkan Informasi Pengguna
4. Mendapatkan Petunjuk TopUp
5. Transaksi Pembayaran
6. Cek Transaksi
7. Callback Transaksi (Notifikasi)
8. Pedoman Tambahan (Panduan)
1.1 07 Juli 2022 Bambang Maulana Penambahan Channel Shopee
Dokumentasi Duitku Account Link V 1.1 Juli 2022
API ini bertujuan untuk memberikan pengalaman pembayaran Account Link terpadu di seluruh
aplikasi mitra Duitku dan memungkinkan mitra baru kami untuk berintegrasi dengan channel
e-Wallet account Link lebih cepat.
● Pembayaran yang didukung :
a. OVO (OL)
b. SHOPEE (SL)
● Berikut ini tersedia API yang dapat anda gunakan antara lain:
a. Menghubungkan Account Link Pengguna
b. Memutuskan Tautan Account Link Pengguna
c. Mendapatkan Informasi Pengguna
d. Mendapatkan Petunjuk TopUp
e. Transaksi Pembayaran
f. Cek Transaksi
g. Callback Transaksi (Notifikasi)
h. Pedoman Tambahan (Panduan)
Dokumentasi Duitku Account Link V 1.1 Juli 2022
1. MENGHUBUNGKAN ACCOUNT LINK PENGGUNA
Deskripsi : Gunakan API ini untuk menghubungkan nomor telepon Anda yang telah terdaftar dengan
pembayaran account linking ke aplikasi merchant.
REQUEST :
METHOD : HTTP POST
TYPE : Application/json
URL :
SANDBOX: https://api-sandbox.duitku.com/accountlinking/api/accountlinking/v1/connect
PRODUCTION: https://accountlink-prod.duitku.com/api/accountlinking/v1/connect
HEADER :
Parameter Wajib Keterangan
X-Duitku-timestamp Y
Timestamp (unix).
format: alfanumerik.
X-Duitku-signature Y
Formula: SHA256(merchantCode +
timestamp + requestBody +
merchantKey)
X-Duitku-merchant Y Kode merchant dari Duitku.
BODY :
Parameter Tipe Data Panjang Data Wajib Keterangan
phoneNumber string 1-50 Y
Nomor Handpone Pelanggan.
Contoh Format :
0812345xxxx .
customerUniqueId string 1-255 Y
Id yang digunakan sebagai id
unik pelanggan di aplikasi
Anda.
Contoh: ID Pelanggan, Email,
Phone dll.
channel string 1-2 Y
Kode Metode Pembayaran
Contoh : OL .
returnUrl string 1-255 Y
Respon yang dikembalikan
setelah memasukan PIN
Contoh format:
http://{returnUrl}?resultCode
=00&phoneNumber=081234
5xxx&state=LINKAGE
Dokumentasi Duitku Account Link V 1.1 Juli 2022
Contoh Request:
curl --location --request POST
'https://accountlink-prod.duitku.com/api/accountlinking/v1/connect' \
--header 'X-Duitku-timestamp: 1657710956368' \
--header 'X-Duitku-signature: 7c33c7db619622c7a3c6ba7db222fadb' \
--header 'X-Duitku-merchant: D7XX' \
--header 'Content-Type: application/json' \
--data-raw '{
"phoneNumber":"085718xxxx",
"returnUrl":"https://Duitku.com",
"customerUniqueId":"123",
"channel":"SL"
}'
RESPONSE :
BODY :
Parameter Tipe Data Keterangan
webviewUrl string Url untuk verifikasi pin.
resultCode string
Kode dari hasil proses
request.
Contoh : 00 / 01
resultMessage string
Keterangan hasil dari
proses request.
Contoh : Success .
Contoh Response :
{ "webviewUrl":
"https://mall.uat.shopee.co.id/s?tes=lse&ticket=rKGsWrcXfOVj1LPx4Akoc3KxTdcpk9sv",
"resultCode": "00",
"resultMessage": "SUCCESS"
}
Dokumentasi Duitku Account Link V 1.1 Juli 2022
2. MEMUTUSKAN TAUTAN ACCOUNT LINK PENGGUNA
Deskripsi : Gunakan API ini untuk memutuskan tautan akun yang terhubung ke aplikasi merchant.
REQUEST :
METHOD : HTTP POST
TYPE : Application/json
URL :
SANDBOX: https://apisandbox.duitku.com/accountlinking/api/accountlinking/v1/disconnect PRODUCTION:
https://accountlink-prod.duitku.com/api/accountlinking/v1/disconnect
HEADER :
Parameter Wajib Keterangan
X-Duitku-timestamp Y
Timestamp (unix).
Format: Alfanumerik.
X-Duitku-signature Y
Formula : Sha256(merchantCode +
timestamp + requestBody +
merchantKey).
X-Duitku-merchant Y Kode merchant dari Duitku.
BODY :
Parameter Tipe Data Panjang Data Wajib Keterangan
credentialCode string 1-50 Y
Kode kredensial untuk
otentikasi.
channel string 1-2 Y
Kode Metode Pembayaran
Contoh: OL.
Contoh Request:
curl --location --request POST
'https://accountlink-prod.duitku.com/api/accountlinking/v1/disconnect' \
--header 'X-Duitku-timestamp: 1657710956368' \
--header 'X-Duitku-signature: 7c33c7db619622c7a3c6ba7db222fadb' \
--header 'X-Duitku-merchant: D7XX' \
--header 'Content-Type: application/json' \
--data-raw '{
"credentialCode":"8320D4EB-FDF5-EC11-812C-B0DB33DQW936",
"channel":"OL"
}'
Dokumentasi Duitku Account Link V 1.1 Juli 2022
RESPONSE :
BODY :
Parameter Tipe Data Keterangan
resultCode string
Kode dari hasil prosesrequest.
Contoh: 00/01.
resultMessage string
Keterangan hasil dari
proses request.
Contoh:success.
Contoh Response:
{
"resultCode": "00",
"resultMessage": "SUCCESS"
}
Dokumentasi Duitku Account Link V 1.1 Juli 2022
3. MENDAPATKAN INFORMASI PENGGUNA
Deskripsi : Gunakan API ini untuk mendapatkan informasi status nomor akun.
REQUEST :
METHOD : HTTP POST
TYPE : Application/json
URL :
SANDBOX: https://apisandbox.duitku.com/accountlinking/api/accountlinking/v1/user/info PRODUCTION:
https://accountlink-prod.duitku.com/api/accountlinking/v1/user/info
HEADER :
Parameter Wajib Keterangan
X-Duitku-timestamp Y Timestamp (unix) .
Format: Alfanumerik .
X-Duitku-signature Y
Formula: SHA256(merchantCode +
timestamp + requestBody +
merchantKey).
X-Duitku-merchant Y Kode merchant dari Duitku.
BODY :
Parameter Tipe Data Panjang Data Wajib Keterangan
credentialCode string 1-50 Y
Kode kredensial untuk
otentikasi.
channel string 1-2 Y
Kode Metode Pembayaran
Contoh : OL.
Contoh Request:
curl --location --request POST
'https://accountlink-prod.duitku.com/api/accountlinking/v1/user/info' \
--header 'X-Duitku-timestamp: 1657710956368' \
--header 'X-Duitku-signature: 7c33c7db619622c7a3c6ba7db222fadb' \
--header 'X-Duitku-merchant: D7XX' \
--header 'Content-Type: application/json' \
--data-raw '{
"credentialCode":"8320D4EB-FDF5-EC11-812C-B0DB33DQW936",
"channel":"OL"
}'
Dokumentasi Duitku Account Link V 1.1 Juli 2022
RESPONSE :
BODY :
Parameter Tipe Data Keterangan
resultCode string
Kode dari hasil prosesrequest.
Contoh : 00 / 01.
resultMessage string
Keterangan hasil dari proses
request.
Contoh : success.
accountStatus string
Status akun pengguna yang
ditautkan .
Contoh : LINKED / UNLINKED .
channel string
Kode Metode Pembayaran.
Contoh : OL.
balanceCash string
Saldo akun anda di aplikasi.
balancePoint string Poin akun anda di aplikasi
Contoh Response:
{
"accountStatus": "LINKED",
"channel": "OL",
"balanceCash": 549159,
"balancePoint": 0,
"resultCode": "00",
"resultMessage": "SUCCESS"
}
Dokumentasi Duitku Account Link V 1.1 Juli 2022
4. MENDAPATKAN PETUNJUK TOPUP
Deskripsi : Gunakan API ini untuk mendapatkan petunjuk tentang cara mengisi saldo Anda.
Mendukung : OVO
REQUEST :
METHOD : HTTP POST
TYPE : Application/json
URL :
SANDBOX: https://api-sandbox.duitku.com/accountlinking/api/accountlinking/v1/topup/intructions
PRODUCTION: https://accountlink-prod.duitku.com/api/accountlinking/v1/topup/intructions
HEADER :
Parameter Wajib Keterangan
X-Duitku-timestamp Y Timestamp (unix)
Format: Alfanumerik.
X-Duitku-signature Y
Formula:sha256(merchantCode +
timestamp + requestBody +
merchantKey).
X-Duitku-merchant Y Kode merchant dari Duitku.
BODY :
Parameter Tipe Data Panjang Data Wajib Keterangan
credentialCode string 1-50 Y
Kode kredensial untuk
otentikasi.
channel string 1-2 Y
Kode Metode Pembayaran
Contoh : OL.
Contoh Request:
curl --location --request POST
'https://accountlink-prod.duitku.com/api/accountlinking/v1/topup/intructions' \
--header 'X-Duitku-timestamp: 1657710956368' \
--header 'X-Duitku-signature: 7c33c7db619622c7a3c6ba7db222fadb' \
--header 'X-Duitku-merchant: D7XX' \
--header 'Content-Type: application/json' \
--data-raw '{
"credentialCode":"8320D4EB-FDF5-EC11-812C-B0DB33DQW936",
"channel":"OL"
}'
Dokumentasi Duitku Account Link V 1.1 Juli 2022
RESPONSE :
BODY :
Parameter Tipe Data Keterangan
data array Menampilkan daftar metode
pembayaran.
displayText string Nama metode pembayaran.
icon string Url ikon metode pembayaran.
url string Url halaman tampilan web metode
pembayaran.
resultCode string
Kode dari hasil prosesrequest.
Contoh : 00 / 01.
resultMessage string Keterangan hasil dari prosesrequest.
Contoh : Success.
Contoh Response:
{
"data": [
{
"displayText": "ATM",
"icon": "https://images-stg.id/fintech/topup/icons/ic_bank_topup.png",
"url": "https://images-stg..id/fintech/topup/topup_atm.html"
},
{
"displayText": "Internet / Mobile Banking",
"icon":
"https://images-stg.id/fintech/topup/icons/ic_mobile_bank_topup.png",
"url": "https://images-stg.ovo.id/fintech/topup/topup_mobile.html"
},
{
"displayText": "Grab",
"icon": "https://images-stg.id/fintech/topup/icons/ic_grab.png",
"url": "https://images-stg.id/fintech/topup/topup_grab.html"
},
{
"displayText": "Tokopedia",
"icon": "https://images-stg.id/fintech/topup/icons/ic_tokopedia.png",
"url": "https://images-stg.id/fintech/topup/topup_tokopedia.html"
}],
"resultCode": "00",
"resultMessage": "SUCCESS"
}
Dokumentasi Duitku Account Link V 1.1 Juli 2022
5. TRANSAKSI PEMBAYARAN
Deskripsi : Gunakan API ini untuk memulai pembayaran langsung. Disarankan untuk memeriksa akun
yang akan yang terhubung sebelum melakukan pembayaran.
Silahkan lihat di https://docs.duitku.com/api/id/#http-request
REQUEST :
METHOD : HTTP POST
TYPE : Application/json
URL :
SANDBOX : https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry
PRODUCTION : https://passport.duitku.com/webapi/api/merchant/v2/inquiry
BODY :
Parameter Tipe Data Panjang Data Wajib Keterangan
merchantCode string 1-50 Y Kode merchant dari Duitku.
paymentAmount int Y Jumlah nominal transaksi.
merchantOrderId string 1-50 Y Nomor transaksi dari merchant.
productDetails string 1-255 Y Keterangan produk/jasa yang diperjual
belikan.
email string 1-50 Y Alamat email pelanggan anda.
additionalParam string 1-255 T Parameter tambahan (opsional).
paymentMethod string 2 Y
Kode metode pembayaran
Contoh: OL untuk Ovo Account Link.
merchantUserInfo string 1-255 T Username atau email pelanggan di
situs merchant (opsional).
customerVaName string 1-20 Y Nama yang akan tampil pada halaman
konfirmasi pembayaran bank.
phoneNumber string 1-20 T Nomor telepon pelanggan (opsional).
accountLink object - - Detail parameter untuk metode
pembayaran accountlink.
Dokumentasi Duitku Account Link V 1.1 Juli 2022
itemDetails object - - -
returnUrl string 1-255 Y
Tautan untuk mengarahkan setelah
transaksi selesai atau dibatalkan.
callbackurl string 1-255 Y Tautan untuk callback transaksi.
signature string 1-255 Y
Formula: MD5 ( merchantcode +
merchantOrderId + paymentAmount +
merchantKey).
ACCOUNT LINK OBJECTS :
Parameter Tipe Data Panjang Data Wajib Keterangan
credentialCode string 1-20 Y
Kode kredensial dari Duitku.
Contoh :
B3A72721-7FFB-EC11-812D-B4617B39
7E08
ovo object - Y Wajib untuk pembayaran melalui OVO.
shopee object - Y Wajib untuk pembayaran melalui
Shopee.
OVO OBJECTS :
Parameter Tipe Data Panjang Data Wajib Keterangan
paymentDetails array - Y Detail parameter untuk permintaan
pembayaran OVO.
paymentType string 1-10 Y Tipe pembayaran yang digunakan
Contoh : CASH.
amount int - Y
Jumlah nominal transaksi.
Contoh : 10000.
Dokumentasi Duitku Account Link V 1.1 Juli 2022
SHOPEE OBJECTS :
Parameter Tipe Data Panjang Data Wajib Keterangan
useCoin bool - Y
Penggunaan koin / poin
untuk
pembayaran
Contoh : true.
promoId string 1-50 Y Kode voucher untuk Shopee.
Contoh Request:
curl --location --request POST
'https://passport.duitku.com/webapi/api/merchant/v2/inquiry' \
--header 'Content-Type: application/json' \
--data-raw '{
"merchantCode" : "D00xx",
"paymentAmount" : "10000",
"merchantOrderId" : "12341234",
"productDetails" : "Tas Trendy",
"email" : "tes@Duitku.com",
"additionalParam" : "sample string",
"paymentMethod" : "OL",
"merchantUserInfo" : "sample string",
"customerVaName" : "Your Customer Name",
"phoneNumber" : "0899721xx",
"accountLink": {
"credentialCode": "A0F22572-4AF1-E111-812C-B01224449936",
"ovo": {
"paymentDetails": [
{
"paymentType": "CASH",
"amount": "10000"
}
]
},
"shopee": {
"useCoin": false,
"promoId": ""
}
},
Dokumentasi Duitku Account Link V 1.1 Juli 2022
"itemDetails" : [{
"price": 10000,
"quantity": 2,
"name": "Apel"
}],
"returnUrl" : "https://YourReturnUrl.com/",
"callbackurl" : "https://YourCallbackUrl.com/",
"signature" : "sgwt21286hjjhdakd6218jakajhvdvdvbsd787111hs"
}
RESPONSE :
BODY :
Parameter Tipe Data Keterangan
merchantCode string Kode merchant dari Duitku.
reference string
Nomorreferensi transaksi dari
Duitku
paymentUrl string
Tautan halaman pembayaran
saat menggunakan verifikasi PIN
amount string Nominal Pembayaran.
statusCode string
Kode dari hasil prosesrequest.
Contoh: 00 / 01.
statusMessage string
Keterangan hasil dari
proses request.
Contoh: Success.
Contoh Response:
{
"merchantCode" : "D00xx",
"reference" : "D00xxCGOB65LY0EN7XVL",
"paymentUrl" : "https://webview.byte-stack.net/cellblockui/v2/paymentPin",
"amount" : "10000",
"statusCode" : "00",
"statusMessage" : "SUCCESS"
}
Dokumentasi Duitku Account Link V 1.1 Juli 2022
6. CEK TRANSAKSI
Deskripsi : Gunakan API ini untuk mendapatkan status transaksi pembayaran.
REQUEST :
METHOD : HTTP POST
TYPE : Application/json
URL :
SANDBOX : https://sandbox.duitku.com/webapi/api/merchant/transactionStatus
PRODUCTION : https://passport.duitku.com/webapi/api/merchant/transactionStatus
BODY :
Parameter Tipe Data Panjang Data Wajib Keterangan
merchantCode string 1-20 Y Kode merchant dari Duitku.
merchantOrderId string 1-2 Y
Nomor transaksi dari
merchant
signature string 1-50 Y
Formula: MD5(merchantCode
+ merchantOrderId + apiKey).
Contoh Request:
curl --location --request POST
'https://passport.duitku.com/webapi/api/merchant/transactionStatus' \
--header 'Content-Type: application/json' \
--data-raw '{
"merchantCode": "D0XXX",
"merchantOrderId": "1652496148897",
"signature": "830aa16319173b9f5e9218f2eb6a7a5f"
}
RESPONSE :
BODY :
Parameter Tipe Data Keterangan
merchantOrderId string Nomor transaksi dari merchant.
reference string Kode referensi dari Duitku.
amount string Nominal transaksi pembayaran.
fee string Biaya tambahan transaksi.
Dokumentasi Duitku Account Link V 1.1 Juli 2022
statusCode string
Kode dari hasil prosesrequest.
Contoh : 00 / 01.
statusMessage string
Keterangan hasil dari proses
request.
Contoh : SUCCESS.
Contoh Response:
{
"merchantOrderId": "1652496148897",
"reference": "D0XXXFKA8NKZQZNXAXCK",
"amount": "10000",
"fee": "0.00",
"statusCode": "00",
"statusMessage": "SUCCESS"
}
Dokumentasi Duitku Account Link V 1.1 Juli 2022
7. CALLBACK TRANSAKSI (NOTIFIKASI)
Deskripsi : Return values yang dikembalikan sebagai HTTP POST, Merchant perlu menyediakan halaman
callback untuk mendapatkan hasilnya.
Silahkan lihat di https://docs.duitku.com/api/id/#callback
METHOD : HTTP POST
TYPE : x-www-form-urlencoded
BODY :
Parameter Tipe Data Keterangan
merchantCode string Kode merchant dari Duitku.
amount int Nominal transaksi
merchantOrderId string Nomor transaksi dari merchant
productDetails string Keterangan produk/jasa yang diperjual belikan.
additionalParam string Parameter tambahan (opsional).
paymentCode string
Kode metode pembayaran.
Contoh : OL untuk OVO Account Link.
resultCode string Kode dari hasil prosesrequest.
Contoh : 00 / 01.
signature string
Formula: MD5(merchantcode + merchantOrderId
+ paymentAmount + merchantKey).
reference string
Kode referensi dari Duitku
Contoh: D00xx12HAJKSAUIUW.
Dokumentasi Duitku Account Link V 1.1 Juli 2022
Merchant Code: D01xx
Request Body: {"phoneNumber":"0812342xxx"}
Merchant Key: 732B39FC6XXXXXXXXXXXXXXXXXXXXXXXXXXX
Timestamp: 1650606622042
Signature: Formula SHA256(D01xx + 1650606622042 + {"phoneNumber":"0812342xxx"} +
732B39FC6XXXXXXXXXXXXXXXXXXXXXXXXXXX )
Signature: 9a6d1209e7db65fd97bac3e6c89fc6a0d3454e52b1ed0a93eab6d5646b198c66
8. PEDOMAN TAMBAHAN (PANDUAN)
RESPONSE CODE
Response Code Deskripsi
00 Sukses.
01 Gagal.
02 Kesalahan tak terduga / kesalahan lainnya.
03 Nomor telepon tidak valid.
04 Metode pembayaran yang anda masukkan salah
05 Permintaan tidak valid.
06 Merchant tidak ditemukan.
07 Metode pembayaran tidak tersedia.
08 Return url tidak valid.
09 Id unik pelanggan tidak valid.
10 Kredensial kode tidak valid
-100 Saldo tidak mencukupi / kesalahan lainnya.
HTTP RESPONSE CODE
Response Code Deskripsi
200 Sukses.
401 Tidak sah.
400 Kesalahan yang tidak diduga.
405 Metode tidak diizinkan.
500 Kesalahan dari dalam server.
SIGNATURE CALCULATION
Dokumentasi Duitku Account Link V 1.1 Juli 2022
Silakan tanyakan kepada tim Integrasi Duitku untuk Collection tertentu.
PERSYARATAN TAMBAHAN OVO
Di bawah ini adalah kalimat untuk memutuskan tautan berdasarkan tim Compliance OVO, dan mitra
harus menunjukkan pesan berikut pada saat proses memutuskan tautan.
English Version:
Unlink OVO? To use your remaining OVO Cash and OVO Points balance, you'll need to reactivate OVO
in the [Partner’s Name] App or download OVO app for more functionalities such as P2P transfer and
withdrawal to bank account. Contact cs@ovo.id for more Keterangan.
[No] [Unlink]
Indonesian Version:
Memutus Tautan (Unlink) Akun OVO? Untuk menggunakan saldo OVO Cash dan OVO Points, Anda
harus mengaktifkan kembali Akun OVO Anda pada Aplikasi [Nama Partner] atau download Aplikasi
OVO untuk menikmati fungsi-fungsi lainnya seperti transfer dan penarikan dana ke rekening bank.
Hubungi cs@ovo.id atau 1500696 untuk informasi lebih lanjut.
[Tidak] [Putuskan Tautan]